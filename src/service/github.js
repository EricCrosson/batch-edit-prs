/**
 * @interface GithubClientInterface
 */
export class GithubClientInterface {
  /**
   * Returns the username of the authenticated user.
   *
   * @returns {Promise<string>} A promise that resolves to the username of the authenticated user.
   */
  async getUsername() {}

  /**
   * Returns an asynchronous iterator over paginated issues and pull requests.
   *
   * @param {string} query - The query to use for the search.
   * @returns {AsyncIterable<Array<Object>>} An asynchronous iterator that yields arrays of issues and pull requests.
   */
  async search(query) {}

  /**
   * Returns the pull request for the given repository and pull request number.
   *
   * @param {Object} args - The arguments for the function.
   * @param {string} args.owner - The owner of the repository.
   * @param {string} args.repo - The name of the repository.
   * @param {number} args.pullRequestNumber - The number of the pull request.
   * @returns {Promise<Object>} A promise that resolves to the pull request object.
   */
  async getPullRequest(args) {}

  /**
   * Returns a function that checks if all CI checks have passed (or been skipped) for a given ref in a repository.
   *
   * @param {Object} args - The arguments for the function.
   * @param {string} args.owner - The owner of the repository.
   * @param {string} args.repo - The name of the repository.
   * @param {string} args.ref - The ref to check. This can be a SHA, a branch name, or a tag name.
   * @returns {Promise<boolean>} A promise that resolves to `true` if all checks have passed or been skipped, and `false` otherwise.
   */
  async allChecksPassed(args) {}

  /**
   * Merges the specified pull request.
   *
   * @param {Object} args - The arguments for the function.
   * @param {string} args.owner - The owner of the repository.
   * @param {string} args.repo - The name of the repository.
   * @param {number} args.pullRequestNumber - The number of the pull request.
   * @returns {Promise<void>} A promise that resolves when the pull request has been merged.
   */
  async mergePullRequest(args) {}
}
