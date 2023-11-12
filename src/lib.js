import { Writable } from "node:stream";

import { GithubClientInterface } from "./service/github.js";
import { templateSearchString } from "./template.js";

/**
 * @typedef {("search"|"approve"|"merge"|"approve and merge"|"close")} Action
 */

/**
 * @typedef {Object} PullRequestReport
 * @property {string} owner - The repository owner.
 * @property {string} repo - The repository name.
 * @property {number} pullRequestNumber - The pull request number.
 * @property {boolean} approved - True when the pull request was approved.
 * @property {boolean} merged - True when the pull request was merged.
 * @property {boolean} closed - True when the pull request was closed.
 */

/**
 * Batch edit pull requests.
 *
 * @param {GithubClientInterface} github - The GitHub client to use for API calls.
 * @param {Writable} output - The output stream to use for printing.
 * @param {Object} args - The arguments for the function.
 * @param {string} args.pattern - The pattern to use for searching pull requests.
 * @param {Action} args.action - The action to take on matching pull requests.
 * @returns {Promise<Array<PullRequestReport>>} A promise that resolves when all assigned pull requests have been processed.
 */
export async function batchEditPullRequests(github, output, args) {
  const { pattern, action } = args;

  /**
   * An array of pull requests to perform `action` on.
   * @type {Array<Object>}
   */
  const prs = [];

  const query = await templateSearchString(
    github,
    `is:pull-request is:open ${pattern}`,
  );
  for await (const issue of github.search(query)) {
    const pullRequestNumber = issue.number;
    const [owner, repo] = issue.repository_url.split("/").slice(-2);

    const pr = await github.getPullRequest({
      owner,
      repo,
      pullRequestNumber,
    });

    const isMergeable = await prIsMergeable({ github, owner, repo, pr });
    if (isMergeable) {
      prs.push(pr);
    }
  }

  /**
   * An array of reports for each processed pull request.
   * @type {Array<PullRequestReport>}
   */
  const reports = [];

  /**
   * The maximum length of a pull request title in characters.
   * @type {number}
   */
  const maxTitleLength = Math.max(...prs.map((pr) => pr.title.length));

  for (const pr of prs) {
    switch (action) {
      case "search":
        output.write(`- ${display(pr, maxTitleLength)}\n`);
        break;
      case "approve":
        github.approvePullRequest(pr);
        output.write(`✔ ${display(pr, maxTitleLength)}\n`);
        break;
      case "approve and merge":
        github.approvePullRequest(pr);
        github.mergePullRequest(pr);
        output.write(`🚢 ${display(pr, maxTitleLength)}\n`);
        break;
      case "merge":
        github.mergePullRequest(pr);
        output.write(`🚢 ${display(pr, maxTitleLength)}\n`);
        break;
      case "close":
        github.closePullRequest(pr);
        output.write(`🛑 ${display(pr, maxTitleLength)}\n`);
        break;
    }

    reports.push({
      owner: pr.head.repo.owner.login,
      repo: pr.head.repo.name,
      pullRequestNumber: pr.number,
      approved: action === "approve" || action === "approve and merge",
      merged: action === "merge" || action === "approve and merge",
      closed: action === "close",
    });
  }

  output.end();

  return reports;
}

/**
 * True when a pull request is mergeable.
 *
 * @param {Object} args
 * @param {GithubClientInterface} args.github - The GitHub client to use for API calls.
 * @param {string} args.owner - The repository owner.
 * @param {string} args.repo - The repository name.
 * @param {Object} args.pr - The pull request object.
 * @returns {Promise<boolean>} - True when pull request is mergeable.
 */
async function prIsMergeable(args) {
  const { github, owner, repo, pr } = args;
  const allStatusChecksArePassing = await github.allChecksPassed({
    owner,
    repo,
    ref: pr.head.sha,
  });
  // DISCUSS: we used to check `pr.mergeable` here, but then it vanished on the
  // response body?
  // Are there any other checks to perform here?
  return allStatusChecksArePassing;
}

/**
 * Formats the title and HTML URL of a pull request in a string suitable to be displayed to the user.
 *
 * @param {Object} pr - The pull request object to print.
 * @param {number} maxTitleLength - The maximum length of a pull request title in characters.
 */
function display(pr, maxTitleLength) {
  const paddedTitle = pr.title.padEnd(1 + maxTitleLength, " ");
  return `${paddedTitle} [${pr.html_url}]`;
}
