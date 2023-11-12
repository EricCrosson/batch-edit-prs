import { strict as assert } from "node:assert";
import test from "node:test";

import { MockGithubClient } from "./mock/mock-github.js";
import { batchEditPullRequests } from "../src/lib.js";

test.describe("happy path", () => {
  test("search", async () => {
    const mockGithub = new MockGithubClient({
      issuesFile: "./test-data/happy-path/issues.json",
      pullRequestsFile: "./test-data/happy-path/pull-requests.json",
      checksFile: "./test-data/happy-path/checks.json",
    });

    const args = {
      pattern: "semantic-release to v22",
      action: "search",
    };

    let results = await batchEditPullRequests(mockGithub, args);

    const approvedPullRequests = results.filter((result) => result.approved);
    assert.ok(
      approvedPullRequests.length === 0,
      "when action is search, no pull requests should be reported as approved",
    );
    assert.ok(
      mockGithub.approved.length === 0,
      "when action is search, the service should receive no requests to approve a pull request",
    );

    const mergedPullRequests = results.filter((result) => result.merged);
    assert.ok(
      mergedPullRequests.length === 0,
      "when action is search, no pull requests should be reported as merged",
    );
    assert.ok(
      mockGithub.merged.length === 0,
      "when action is search, the service should receive no requests to merge a pull request",
    );

    const closedPullRequests = results.filter((result) => result.closed);
    assert.ok(
      closedPullRequests.length === 0,
      "when action is search, no pull requests should be reported as closed",
    );
    assert.ok(
      mockGithub.closed.length === 0,
      "when action is search, the service should receive no requests to close a pull request",
    );
  });

  test("approve", async () => {
    const mockGithub = new MockGithubClient({
      issuesFile: "./test-data/happy-path/issues.json",
      pullRequestsFile: "./test-data/happy-path/pull-requests.json",
      checksFile: "./test-data/happy-path/checks.json",
    });

    const args = {
      pattern: "semantic-release to v22",
      action: "approve",
    };

    let results = await batchEditPullRequests(mockGithub, args);

    const approvedPullRequests = results.filter((result) => result.approved);
    assert.ok(
      approvedPullRequests.length === 4,
      "when action is approve, all pull requests should be reported as approved",
    );
    assert.ok(
      mockGithub.approved.length === 4,
      "when action is approve, the service should receive n requests to approve a pull request",
    );

    const mergedPullRequests = results.filter((result) => result.merged);
    assert.ok(
      mergedPullRequests.length === 0,
      "when action is approve, no pull requests should be reported as merged",
    );
    assert.ok(
      mockGithub.merged.length === 0,
      "when action is approve, the service should receive no requests to merge a pull request",
    );

    const closedPullRequests = results.filter((result) => result.closed);
    assert.ok(
      closedPullRequests.length === 0,
      "when action is approve, no pull requests should be reported as closed",
    );
    assert.ok(
      mockGithub.closed.length === 0,
      "when action is approve, the service should receive no requests to close a pull request",
    );
  });

  test("approve and merge", async () => {
    const mockGithub = new MockGithubClient({
      issuesFile: "./test-data/happy-path/issues.json",
      pullRequestsFile: "./test-data/happy-path/pull-requests.json",
      checksFile: "./test-data/happy-path/checks.json",
    });

    const args = {
      pattern: "semantic-release to v22",
      action: "approve and merge",
    };

    let results = await batchEditPullRequests(mockGithub, args);

    const approvedPullRequests = results.filter((result) => result.approved);
    assert.ok(
      approvedPullRequests.length === 4,
      "when action is approve and merge, all pull requests should be reported as approved",
    );
    assert.ok(
      mockGithub.approved.length === 4,
      "when action is approve and merge, the service should receive n requests to approve a pull request",
    );

    const mergedPullRequests = results.filter((result) => result.merged);
    assert.ok(
      mergedPullRequests.length === 4,
      "when action is approve and merge, all pull requests should be reported as merged",
    );
    assert.ok(
      mockGithub.merged.length === 4,
      "when action is approve and merge, the service should receive n requests to merge a pull request",
    );

    const closedPullRequests = results.filter((result) => result.closed);
    assert.ok(
      closedPullRequests.length === 0,
      "when action is approve and merge, no pull requests should be reported as closed",
    );
    assert.ok(
      mockGithub.closed.length === 0,
      "when action is approve and merge, the service should receive no requests to close a pull request",
    );
  });

  test("merge", async () => {
    const mockGithub = new MockGithubClient({
      issuesFile: "./test-data/happy-path/issues.json",
      pullRequestsFile: "./test-data/happy-path/pull-requests.json",
      checksFile: "./test-data/happy-path/checks.json",
    });

    const args = {
      pattern: "semantic-release to v22",
      action: "merge",
    };

    let results = await batchEditPullRequests(mockGithub, args);

    const approvedPullRequests = results.filter((result) => result.approved);
    assert.ok(
      approvedPullRequests.length === 0,
      "when action is merge, no pull requests should be reported as approved",
    );
    assert.ok(
      mockGithub.approved.length === 0,
      "when action is merge, the service should receive no requests to approve a pull request",
    );

    const mergedPullRequests = results.filter((result) => result.merged);
    assert.ok(
      mergedPullRequests.length === 4,
      "when action is merge, all pull requests should be reported as merged",
    );
    assert.ok(
      mockGithub.merged.length === 4,
      "when action is merge, the service should receive n requests to merge a pull request",
    );

    const closedPullRequests = results.filter((result) => result.closed);
    assert.ok(
      closedPullRequests.length === 0,
      "when action is merge, no pull requests should be reported as closed",
    );
    assert.ok(
      mockGithub.closed.length === 0,
      "when action is merge, the service should receive no requests to close a pull request",
    );
  });

  test("close", async () => {
    const mockGithub = new MockGithubClient({
      issuesFile: "./test-data/happy-path/issues.json",
      pullRequestsFile: "./test-data/happy-path/pull-requests.json",
      checksFile: "./test-data/happy-path/checks.json",
    });

    const args = {
      pattern: "semantic-release to v22",
      action: "close",
    };

    let results = await batchEditPullRequests(mockGithub, args);

    const approvedPullRequests = results.filter((result) => result.approved);
    assert.ok(
      approvedPullRequests.length === 0,
      "when action is close, no pull requests should be reported as approved",
    );
    assert.ok(
      mockGithub.approved.length === 0,
      "when action is close, the service should receive no requests to approve a pull request",
    );

    const mergedPullRequests = results.filter((result) => result.merged);
    assert.ok(
      mergedPullRequests.length === 0,
      "when action is close, no pull requests should be reported as merged",
    );
    assert.ok(
      mockGithub.merged.length === 0,
      "when action is close, the service should receive no requests to merge a pull request",
    );

    const closedPullRequests = results.filter((result) => result.closed);
    assert.ok(
      closedPullRequests.length === 4,
      "when action is close, all pull requests should be reported as closed",
    );
    assert.ok(
      mockGithub.closed.length === 4,
      "when action is close, the service should receive n requests to close a pull request",
    );
  });
});
