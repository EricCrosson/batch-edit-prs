#!/usr/bin/env node

import { Octokit } from "@octokit/rest";

// Validate GitHub token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN environment variable is not set.");
  process.exit(1);
}

// Initialize Octokit
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Parse and validate command-line arguments
const args = process.argv.slice(2);
const mergeFlag = args.includes("--merge");
const helpFlag = args.includes("--help");
const pattern = args.find(
  (arg) => !arg.startsWith("--") && !arg.startsWith("-"),
);

let errors = [];

if (helpFlag) {
  console.log(`Usage: script.js [--merge] <pattern>
    --merge   Optional flag to merge PRs that match the pattern and conditions.
    --help    Show this help message.
    <pattern> Required pattern to match PR titles.`);
  process.exit(0);
}

if (!pattern) {
  errors.push("Error: Pattern argument is required.");
}

if (args.length > 2 || (args.length === 2 && !mergeFlag && !helpFlag)) {
  errors.push("Error: Unexpected arguments.");
}

if (errors.length > 0) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

// Function to check if all CI checks have passed
async function allChecksPassed(owner, repo, ref) {
  const { data: checks } = await octokit.checks.listForRef({
    owner,
    repo,
    ref,
  });

  return checks.check_runs.every(
    (check) => check.conclusion === "success" || check.conclusion === "skipped",
  );
}

// Function to process pull requests assigned to the authenticated user
async function processAssignedPullRequests() {
  try {
    const user = await octokit.users.getAuthenticated();
    const username = user.data.login;

    for await (const { data: issues } of octokit.paginate.iterator(
      octokit.search.issuesAndPullRequests,
      {
        q: `is:pull-request is:open assignee:${username} ${pattern}`,
        per_page: 100,
      },
    )) {
      for (const issue of issues) {
        // Directly iterating over issues
        if (issue.pull_request) {
          const prNumber = issue.number;
          const [owner, repo] = issue.repository_url.split("/").slice(-2);

          const pr = await octokit.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
          });

          const allStatusChecksArePassing = await allChecksPassed(
            owner,
            repo,
            pr.data.head.sha,
          );
          console.log({
            repo: `${owner}/${repo}`,
            title: pr.data.title,
            mergeable: pr.data.mergeable,
            allStatusChecksArePassing,
          });

          if (
            pr.data.user.login === "renovate[bot]" &&
            pr.data.mergeable &&
            allStatusChecksArePassing
          ) {
            console.log(`PR: ${pr.data.html_url}`);

            if (mergeFlag) {
              await octokit.pulls.merge({
                owner,
                repo,
                pull_number: prNumber,
              });

              console.log(`Merged PR: ${pr.data.html_url}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing assigned pull requests:", error);
    process.exit(1);
  }
}

processAssignedPullRequests();
