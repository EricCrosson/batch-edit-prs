import { Octokit } from "@octokit/rest";

/**
 * @implements {GithubClientInterface}
 */
export class GithubClient {
  /**
   * Creates a new GitHubClient instance.
   *
   * @param {string} githubToken - The GitHub token to authenticate with.
   */
  constructor(githubToken) {
    /**
     * The Octokit instance to use for GitHub API calls.
     * @type {Octokit}
     */
    this.octokit = new Octokit({ auth: githubToken });
  }

  /**
   * Returns the username of the authenticated user.
   *
   * @returns {Promise<string>} A promise that resolves to the username of the authenticated user.
   */
  async getUsername() {
    const { data: user } = await this.octokit.users.getAuthenticated();
    return user.login;
  }

  /**
   * Returns an asynchronous iterator over paginated issues and pull requests.
   *
   * @param {string} query - The query to use for the search.
   * @returns {AsyncIterable<Array<Object>>} An asynchronous iterator that yields arrays of issues and pull requests.
   */
  async *search(query) {
    for await (const { data: issues } of this.octokit.paginate.iterator(
      this.octokit.search.issuesAndPullRequests,
      {
        q: query,
        per_page: 100,
      },
    )) {
      for (const issue of issues) {
        yield issue;
      }
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
    const { owner, repo, pullRequestNumber } = args;

    const { data: prs } = await this.octokit.pulls.get({
      owner,
      repo,
      pullRequestNumber,
    });

    if (prs.length === 0) {
      throw new Error(
        `Could not retrieve pull request ${owner}/${repo}#${pullRequestNumber}`,
      );
    }

    return prs[0];
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
    const { owner, repo, ref } = args;

    const { data: checks } = await this.octokit.checks.listForRef({
      owner,
      repo,
      ref,
    });

    return checks.check_runs.every(
      (check) =>
        check.conclusion === "success" || check.conclusion === "skipped",
    );
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
    const { owner, repo, pullRequestNumber } = args;

    await this.octokit.pulls.merge({
      owner,
      repo,
      pull_number: pullRequestNumber,
    });
  }
}
