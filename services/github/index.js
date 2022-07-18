import "dotenv/config";
import { Octokit } from "octokit";
import * as IssueQueries from "./graphql/issue.js";
import * as RepositoryQueries from "./graphql/repository.js";

const { GITHUB_TOKEN: token } = process.env;

const githubAPI = new Octokit({ auth: token }).graphql;

export async function repositoryDetails(repo, owner) {
  return await githubAPI(RepositoryQueries.Details, {
    repo,
    owner,
  });
}

export async function issueDetails(repo, owner, issueId) {
  return await githubAPI(IssueQueries.Details, {
    repo,
    owner,
    issueId: +issueId,
  });
}
//'LA_kwDOHlO0IM7_S3da'
//'I_kwDOHlO0IM5N-aK2'
export async function issueRemoveLabel(issueId, labelId) {
  await githubAPI(IssueQueries.RemoveLabel, {
    issueId,
    labelId: [labelId],
  });
}

export default { repositoryDetails, issueDetails, issueRemoveLabel };
