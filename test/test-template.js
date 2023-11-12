import { strict as assert } from "node:assert";
import test from "node:test";

import { MockGithubClient } from "./mock/mock-github.js";
import { templateSearchString } from "../src/template.js";

test.describe("templateSearchString", async () => {
  test("returns the query when it doesn't contain :me", async () => {
    const query = "lorem ipsum";
    const actual = await templateSearchString(null, query);
    assert.equal(actual, query);
  });

  test("replaces :me with the current user's username", async () => {
    const mockGithub = new MockGithubClient({
      issuesFile: "./test-data/happy-path/issues.json",
      pullRequestsFile: "./test-data/happy-path/pull-requests.json",
      checksFile: "./test-data/happy-path/checks.json",
    });

    const username = await mockGithub.getUsername();
    const query = "assignee:me lorem ipsum";
    const actual = await templateSearchString(mockGithub, query);
    assert.equal(actual, `assignee:${username} lorem ipsum`);
  });

  test("templates every occurrence of :me", async () => {
    const mockGithub = new MockGithubClient({
      issuesFile: "./test-data/happy-path/issues.json",
      pullRequestsFile: "./test-data/happy-path/pull-requests.json",
      checksFile: "./test-data/happy-path/checks.json",
    });

    const username = await mockGithub.getUsername();
    const query = "assignee:me review-requested:me lorem ipsum";
    const actual = await templateSearchString(mockGithub, query);
    assert.equal(
      actual,
      `assignee:${username} review-requested:${username} lorem ipsum`,
    );
  });
});
