import * as fs from "node:fs";

import { GithubClientInterface } from "../../src/service/github.js";

/**
 * @implements {GithubClientInterface}
 */
export class MockGithubClient {
  /**
   * Represents a mock GitHub instance.
   * @constructor
   * @param {Object} args
   * @param {string} args.issuesFile - The path to the file containing issue data.
   * @param {string} args.pullRequestsFile - The path to the file containing pull request data.
   * @param {string} args.checksFile - The path to the file containing pull request check data.
   */
  constructor(args) {
    /**
     * The username of the authenticated user.
     * @type {string}
     * @private
     */
    this.username = "mock-username";

    /**
     * Array of issue objects.
     * @type {Object}
     * @private
     */
    this.issues = JSON.parse(
      fs.readFileSync(args.issuesFile, { encoding: "utf-8" }),
    );

    /**
     * Array of pull request objects.
     * @type {Object}
     * @private
     */
    this.pullRequests = JSON.parse(
      fs.readFileSync(args.pullRequestsFile, { encoding: "utf-8" }),
    );

    /**
     * Array of check objects.
     * @type {Object}
     * @private
     */
    this.checks = JSON.parse(
      fs.readFileSync(args.checksFile, { encoding: "utf-8" }),
    );

    /**
     * Map of pull request objects, keyed by a string in the format 'owner/repo#number'.
     * @type {Map}
     * @private
     */
    this.pullRequestMap = this.pullRequests.reduce((accumulator, pr) => {
      const key = slug({
        owner: pr.base.repo.owner.login,
        repo: pr.base.repo.name,
        pullRequestNumber: pr.number,
      });
      accumulator.set(key, pr);
      return accumulator;
    }, new Map());

    /**
     * Array of approved pull request slugs.
     */
    this.approved = [];

    /**
     * Array of merged pull request slugs.
     */
    this.merged = [];

    /**
     * Array of closed pull request slugs.
     */
    this.closed = [];
  }

  /**
   * Returns the username of the authenticated user.
   *
   * @returns {Promise<string>} A promise that resolves to the username of the authenticated user.
   */
  async getUsername() {
    return this.username;
  }

  /**
   * Returns an asynchronous iterator over paginated issues and pull requests.
   *
   * @param {string} query - The query to use for the search.
   * @returns {AsyncIterable<Array<Object>>} An asynchronous iterator that yields arrays of issues and pull requests.
   */
  async *search(_query) {
    for (const issue of this.issues) {
      yield issue;
    }
  }

  /**
   * Returns the pull request for the given repository and pull request number.
   *
   * @param {Object} args - The arguments for the function.
   * @param {string} args.owner - The owner of the repository.
   * @param {string} args.repo - The name of the repository.
   * @param {number} args.pullRequestNumber - The number of the pull request.
   * @returns {Promise<Object>} A promise that resolves to the pull request object.
   */
  async getPullRequest(args) {
    const key = slug(args);
    const pr = this.pullRequestMap.get(key);
    if (pr === undefined) {
      throw new Error(`Could not retrieve pull request ${key}`);
    }
    return pr;
  }

  /**
   * Returns a function that checks if all CI checks have passed (or been skipped) for a given ref in a repository.
   *
   * @param {Object} args - The arguments for the function.
   * @param {string} args.owner - The owner of the repository.
   * @param {string} args.repo - The name of the repository.
   * @param {string} args.ref - The ref to check. This can be a SHA, a branch name, or a tag name.
   * @returns {Promise<boolean>} A promise that resolves to `true` if all checks have passed or been skipped, and `false` otherwise.
   */
  async allChecksPassed(args) {
    const key = `${args.owner}/${args.repo}@${args.ref}`;
    const checks = this.checks[key];
    return checks.check_runs.every(
      (check) =>
        check.conclusion === "success" || check.conclusion === "skipped",
    );
  }

  /**
   * Approves the specified pull request.
   *
   * @param {Object} args - The arguments for the function.
   * @param {string} args.owner - The owner of the repository.
   * @param {string} args.repo - The name of the repository.
   * @param {number} args.pullRequestNumber - The number of the pull request.
   * @returns {Promise<void>} A promise that resolves when the pull request has been approved.
   */
  async approvePullRequest(args) {
    const key = slug(args);
    this.approved.push(key);
  }

  /**
   * Merges the specified pull request.
   *
   * @param {Object} args - The arguments for the function.
   * @param {string} args.owner - The owner of the repository.
   * @param {string} args.repo - The name of the repository.
   * @param {number} args.pullRequestNumber - The number of the pull request.
   * @returns {Promise<void>} A promise that resolves when the pull request has been merged.
   */
  async mergePullRequest(args) {
    const key = slug(args);
    this.merged.push(key);
  }

  /**
   * Closes the specified pull request.
   *
   * @param {Object} args - The arguments for the function.
   * @param {string} args.owner - The owner of the repository.
   * @param {string} args.repo - The name of the repository.
   * @param {number} args.pullRequestNumber - The number of the pull request.
   * @returns {Promise<void>} A promise that resolves when the pull request has been closed.
   */
  async closePullRequest(args) {
    const key = slug(args);
    this.closed.push(key);
  }
}

/**
 * Returns a string representing the unique key for a pull request.
 *
 * @param {Object} args - The arguments object.
 * @param {string} args.owner - The owner of the repository.
 * @param {string} args.repo - The name of the repository.
 * @param {number} args.pullRequestNumber - The number of the pull request.
 * @returns {string} - The unique key for the pull request.
 */
function slug(args) {
  return `${args.owner}/${args.repo}#${args.pullRequestNumber}`;
}
