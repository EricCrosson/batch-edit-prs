#!/usr/bin/env node

import { Octokit } from "@octokit/rest";

import { validateCliArguments } from "./validate.js";

// Parse and validate command-line arguments
const args = process.argv.slice(2);
const { mergeFlag, pattern, githubToken } = validateCliArguments(args);

// Initialize Octokit
const octokit = new Octokit({ auth: githubToken });

// Function to check if all CI checks have passed
async function allChecksPassed(octokit, owner, repo, ref) {
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
            octokit,
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
