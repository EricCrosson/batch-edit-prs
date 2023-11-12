/**
 * Template the search string, replacing:
 *
 * - `:me` with the current user's username.
 *
 * @param {GithubClientInterface} github - The GitHub client to use for API calls.
 * @param {string} query - The search query.
 */
export async function templateSearchString(github, query) {
  let templatedQuery = query;

  if (/:me\b/.test(templatedQuery)) {
    const username = await github.getUsername();
    templatedQuery = templatedQuery.replace(
      new RegExp(":me", "g"),
      `:${username}`,
    );
  }

  return templatedQuery;
}
