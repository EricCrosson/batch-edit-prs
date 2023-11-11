/**
 * Validates command-line arguments.
 *
 * @param {string[]} args - The command-line arguments to validate.
 * @returns {{mergeFlag: boolean, pattern: string}} Validated CLI arguments.
 * @throws {Error} Will throw an error if the arguments are not valid.
 */
export function validateCliArguments(args) {
  const mergeFlag = args.includes("--merge");
  const helpFlag = args.includes("--help");
  const pattern = args.find(
    (arg) => !arg.startsWith("--") && !arg.startsWith("-"),
  );

  let errors = [];

  if (helpFlag) {
    console.log(`Usage: script.js [--merge] <pattern>
    --merge   Optional flag to merge PRs that match the pattern and conditions.
    --help    Show this help message.
    <pattern> Required pattern to match PR titles.
`);
    process.exit(0);
  }

  if (!pattern) {
    errors.push("Error: Pattern argument is required.");
  }

  if (args.length > 2 || (args.length === 2 && !mergeFlag && !helpFlag)) {
    errors.push("Error: Unexpected arguments.");
  }

  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  return { mergeFlag, pattern };
}
