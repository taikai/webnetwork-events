import { ERC20 } from "@taikai/dappkit";
import db from "../../db/index.js";
import GHService from "../../services/github/index.js";
import { error } from "../../utils/logger-handler.js";

export async function getBountyCreatedEvents(events, network, contract) {
  const createdBounties = [];

  async function validateToken(transactionalToken) {
    var token = await db.tokens.findOne({
      where: {
        address: transactionalToken,
      },
    });

    if (!token?.id) {
      const erc20 = new ERC20(
        contract?.network?.connection,
        transactionalToken
      );

      await erc20.loadContract();

      token = await db.tokens.create({
        name: await erc20.name(),
        symbol: await erc20.symbol(),
        address: transactionalToken,
      });
    }

    return token.id;
  }

  for (const event of events) {
    const { id, cid } = event.returnValues;
    try {
      const bounty = await db.issues.findOne({
        where: {
          issueId: cid,
          network_id: network?.id,
        },
      });

      if (!bounty) return error(`Bounty cid: ${cid} not found`);

      if (bounty.state !== "pending")
        return error(`Bounty cid: ${cid} already in draft state`);

      bounty.state = "draft";

      const networkBounty = await contract?.network?.getBounty(id);

      if (networkBounty) {
        bounty.creatorAddress = networkBounty.creator;
        bounty.creatorGithub = networkBounty.githubUser;
        bounty.amount = networkBounty.tokenAmount;
        bounty.branch = networkBounty.branch;
        bounty.title = networkBounty.title;
        bounty.contractId = id;

        const tokeId = await validateToken(networkBounty.transactional);
        if (tokeId) bounty.token = tokeId;
      }

      await bounty.save();

      createdBounties.push(bounty);
    } catch (err) {
      error(`Error creating bounty cid: ${cid}`, err);
    }
  }

  return createdBounties;
}

export async function getBountyCanceledEvents(events, network, contract) {
  const canceledBounties = [];
  debugger;
  for (const event of events) {
    const { id } = event.returnValues;
    try {
      const networkBounty = await contract?.network?.getBounty(id);

      if (!networkBounty) return error(`Bounty id: ${id} not found`);

      const bounty = await db.issues.findOne({
        where: {
          contractId: id,
          issueId: networkBounty.cid,
          network_id: network.id,
        },
        include: [{ association: "token", association: "repository" }],
      });

      if (!bounty) return error(`Bounty cid: ${cid} not found`);

      if (bounty.state !== "draft")
        return error(`Bounty cid: ${cid} already in draft state`);

      const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath);

      await GHService.issueClose(repo, owner, bounty?.issueId);

      bounty.state = "canceled";

      await bounty.save();

      canceledBounties.push(bounty);

      //TODO: must post a new twitter card;
    } catch (err) {
      error(`Error creating bounty cid: ${cid}`, err);
    }
  }

  return canceledBounties;
}

export async function getBountyClosedEvents(events, network, contract) {
  const closedBounties = [];

  async function mergeProposal(bounty, proposal) {
    const pullRequest = await db.pull_requests.findOne({
      where: {
        id: proposal.pullRequestId,
        issueId: proposal.issueId,
      },
    });

    if (!pullRequest) return;

    const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath);

    await GHService.mergeProposal(owner, repo, pullRequest?.githubId);
    await GHService.issueClose(repo, owner, bounty?.issueId);

    return pullRequest;
  }

  async function closePullRequests(bounty, pullRequest) {
    const pullRequests = await models.pullRequest.findAll({
      where: {
        issueId: bounty.id,
        githubId: { [Op.not]: pullRequest.githubId },
      },
      raw: true,
    });

    const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath);

    for (const pr of pullRequests) {
      await GHService.pullrequestClose(owner, repo, pr.githubId);
    }
  }

  async function updateUserPayments(bounty, event, networkBounty) {
    return await Promise.all(
      networkBounty?.proposals?.[0].details.map(async (detail) =>
        db.users_payments.create({
          address: detail?.["recipient"],
          ammount:
            Number(
              (detail?.["percentage"] / 100) * networkBounty?.tokenAmount
            ) || 0,
          issueId: bounty?.id,
          transactionHash: event?.transactionHash || null,
        })
      )
    );
  }

  for (const event of events) {
    const { id, proposalId } = event.returnValues;

    try {
      const networkBounty = await contract?.network?.getBounty(id);

      if (!networkBounty) return error(`Bounty id: ${id} not found`);

      const bounty = await db.issues.findOne({
        where: {
          contractId: id,
          issueId: networkBounty?.cid,
          network_id: network?.id,
        },
        include: [
          {
            association: "token",
            association: "repository",
            association: "merge_proposals",
          },
        ],
      });

      if (!bounty) return error(`Bounty id: ${id} not found`);

      const proposal = bounty?.merge_proposals?.find(
        (p) => p.id === proposalId
      );

      if (networkBounty.closed && !networkBounty.canceled && proposal) {
        const prMerged = await mergeProposal(bounty, proposal);
        if (prMerged) await closePullRequests(bounty, prMerged);
      }

      bounty.merged = proposal.scMergeId;
      bounty.state = "closed";
      await bounty.save();
      await updateUserPayments(bounty, event, networkBounty);
      closedBounties.push(bounty.issueId);
      //TODO: must post a new twitter card;
    } catch (err) {
      error(`Error cancel bounty id: ${id}`, err);
    }
  }

  return closedBounties;
}
export function getBountyAmountUpdatedEvents(events, network, contract) {
  return "getBountyAmountUpdatedEvents";
}
