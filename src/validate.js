/**
 * Validates command-line arguments.
 *
 * @param {string[]} args - The arguments to validate.
 * @returns {{mergeFlag: boolean, pattern: string, githubToken: string}} Validated arguments.
 * @throws {Error} Throws an error if the arguments are not valid.
 */
export function validateCliArguments(args) {
  const mergeFlag = args.includes("--merge");
  const helpFlag = args.includes("--help");
  const pattern = args.filter((arg) => !arg.startsWith("--"));

  let errors = [];

  if (helpFlag) {
    console.log(`Usage: script.js [--merge] <pattern>
    --merge   Optional flag to merge PRs that match the pattern and conditions.
    --help    Show this help message.
    <pattern> Required pattern to match PR titles.
`);
    process.exit(0);
  }

  // Validate GitHub token
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    errors.push("Error: GITHUB_TOKEN environment variable is not set.");
  }

  if (pattern.length === 0) {
    errors.push("Error: Pattern argument is required.");
  }

  if (pattern.length > 1) {
    errors.push("Error: Unexpected arguments -- expected only one pattern.");
  }

  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  return { mergeFlag, pattern, githubToken };
}
