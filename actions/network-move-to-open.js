import { subMilliseconds } from "date-fns";
import { Op } from "sequelize";
import db from "../db/index.js";
import DAOService from "../services/dao-service.js";
import GHService, {
  issueDetails,
  issueRemoveLabel,
} from "../services/github/index.js";
import { error, info } from "../utils/logger-handler.js";
import { ghPathSplit } from "../utils/string.js";

export const name = "move-bounties-to-open";
export const schedule = "1 * * * * *";
export const description = "moving draft bounties to open";
export const author = "clarkjoao";

async function loadIssues(network, contract) {
  const redeemTime = await contract.network.draftTime();

  const where = {
    createdAt: { [Op.lt]: subMilliseconds(+new Date(), redeemTime) },
    network_id: network.id,
    state: "draft",
  };

  const include = [{ association: "token", association: "repository" }];

  const issues = await db.issues.findAll({
    where,
    include,
  });

  const repositoriesDetails = {};

  for (const issue of issues) {
    info(`Moving issue ${issue.id} to open`);
    try {
      const [owner, repo] = ghPathSplit(issue?.repository?.githubPath);

      if (!repositoriesDetails[`${owner}/${repo}`]) {
        repositoriesDetails[`${owner}/${repo}`] =
          await GHService.repositoryDetails(repo, owner);
      }

      const labelId = repositoriesDetails[
        `${owner}/${repo}`
      ]?.repository?.labels?.nodes.find(
        (label) => label.name.toLowerCase() === "draft"
      )?.id;

      if (labelId) {
        const ghIssue = await issueDetails(repo, owner, +issue.githubId);
        await issueRemoveLabel(ghIssue.repository.issue.id, labelId);
      }

      issue.state = "open";
      await issue.save();
      info(`Issue ${issue.id} moved to open`);
      // TODO: must generate new SEO CARD;
    } catch (err) {
      error(`Error moving issue ${issue.id}: ${err.message}`);
    }
  }

  return issues;
}

export async function action() {
  info("Starting move bounties to open");

  const networks = await db.networks.findAll();
  const contract = new DAOService();

  for (const network of networks) {
    if (!network.name) return;

    info(`Moving bounties to open for network ${network.name}`);

    if (!(await contract.loadNetwork(network.networkAddress)))
      return error(`Error loading network contract ${network.name}`);

    await loadIssues(network, contract);
  }
}

action();
