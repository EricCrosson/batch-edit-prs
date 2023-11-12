#!/usr/bin/env node

import { GithubClient } from "./implementation/github.js";
import { GithubClientInterface } from "./service/github.js";
import { validateCliArguments } from "./validate.js";

/**
 * Processes assigned pull requests based on the provided arguments.
 *
 * @param {GithubClientInterface} github - The GitHub client to use for API calls.
 * @param {Object} args - The arguments for the function.
 * @param {boolean} args.mergeFlag - Flag indicating whether to merge pull requests.
 * @param {string} args.pattern - The pattern to use for searching pull requests.
 * @returns {Promise<void>} A promise that resolves when all assigned pull requests have been processed.
 */
async function processAssignedPullRequests(github, args) {
  const { mergeFlag, pattern } = args;

  try {
    const username = await github.getUsername();

    for await (const issue of github.search(
      `is:pull-request is:open assignee:${username} ${pattern}`,
    )) {
      if (issue.pull_request) {
        const pullRequestNumber = issue.number;
        const [owner, repo] = issue.repository_url.split("/").slice(-2);

        const pr = await github.getPullRequest({
          owner,
          repo,
          pullRequestNumber,
        });

        const allStatusChecksArePassing = await github.allChecksPassed({
          owner,
          repo,
          ref: pr.head.sha,
        });
        console.log({
          repo: `${owner}/${repo}`,
          title: pr.title,
          mergeable: pr.mergeable,
          allStatusChecksArePassing,
        });

        if (
          pr.user.login === "renovate[bot]" &&
          pr.mergeable &&
          allStatusChecksArePassing
        ) {
          console.log(`PR: ${pr.html_url}`);

          if (mergeFlag) {
            await github.mergePullRequest({
              owner,
              repo,
              pullRequestNumber,
            });

            console.log(`Merged PR: ${pr.html_url}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing assigned pull requests:", error);
    process.exit(1);
  }
}

async function main() {
  const cliArguments = process.argv.slice(2);
  const { mergeFlag, pattern, githubToken } =
    validateCliArguments(cliArguments);

  const github = new GithubClient(githubToken);

  const args = {
    mergeFlag,
    pattern,
  };

  processAssignedPullRequests(github, args);
}

main();
