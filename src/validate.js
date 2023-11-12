/**
 * @typedef {Object} ValidatedCliArguments
 * @property {string} githubToken - The User's GitHub token.
 * @property {string} pattern - The pattern to use for searching pull requests.
 * @property {Action} action - The action to take on matching pull requests.
 */

/**
 * Validates command-line arguments.
 *
 * @param {string[]} args - The arguments to validate.
 * @returns {ValidatedCliArguments} Validated arguments.
 * @throws {Error} Throws an error if the arguments are not valid.
 */
export function validateCliArguments(args) {
  const helpFlag = args.includes("--help");
  const pattern = args[0];
  const action = args[1];

  let errors = [];

  if (helpFlag) {
    console.log(`Usage: script.js <pattern> <action>
    --help    Show this help message.
    <pattern> Required pattern to match PR titles.
    <action>  Action to take on matching PRs. Must be one of:
                "search", "approve", "merge", "approve and merge", "close".
`);
    process.exit(0);
  }

  // Validate GitHub token
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    errors.push("Error: GITHUB_TOKEN environment variable is not set.");
  }

  if (pattern === undefined || pattern.length === 0) {
    errors.push("Error: Pattern argument is required.");
  }

  if (action === undefined || action.length === 0) {
    errors.push("Error: Action argument is required.");
  } else if (
    action !== "search" &&
    action !== "approve" &&
    action !== "merge" &&
    action !== "approve and merge" &&
    action !== "close"
  ) {
    errors.push(
      "Error: Invalid action. Must be one of: search, approve, merge, approve and merge, close.",
    );
  }

  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    throw new Error("invalid arguments");
  }

  return { githubToken, pattern, action };
}
