#!/usr/bin/env node

import { GithubClient } from "./implementation/github.js";
import { batchEditPullRequests } from "./lib.js";
import { validateCliArguments } from "./validate.js";

async function main() {
  const cliArguments = process.argv.slice(2);
  const { githubToken, pattern, action } = validateCliArguments(cliArguments);

  const github = new GithubClient(githubToken);

  const args = {
    pattern,
    action,
  };

  try {
    await batchEditPullRequests(github, args);
  } catch (error) {
    console.error("Error processing pull requests:", error);
    process.exit(1);
  }
}

main();
