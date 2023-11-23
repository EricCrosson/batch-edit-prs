# batch-edit-prs

[![Build Status]](https://github.com/EricCrosson/batch-edit-prs/actions/workflows/release.yml)

[build status]: https://github.com/EricCrosson/batch-edit-prs/actions/workflows/release.yml/badge.svg?event=push

**batch-edit-prs** operates on each pull request returned by a [GitHub search].

Supported actions are:

- approve
- merge
- approve and merge
- close

[github search]: https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests

## Install

Install from the Nix flake.

## Use

```
Usage: batch-edit-prs <pattern> <action>

  <pattern>    Search string to use to identify PRs to act on
  <action>     Action to take on matching PRs. Must be one of:
                 "search", "approve", "merge", "approve and merge", "close"

  --help       Show this help message
```

## Examples

Use `search` to show PRs matching your query:

```
$ batch-edit-pr "author:app/renovate assignee:@me semantic-release to v22" "search"

🔍 fix(deps): update dependency semantic-release to v22    [https://github.com/semantic-release-action/github-actions/pull/24]
🔍 fix(deps): update dependency semantic-release to v22    [https://github.com/semantic-release-action/rust/pull/75]
🔍 chore(deps): update dependency semantic-release to v22  [https://github.com/semantic-release-extras/test-verified-git-commit/pull/18]
🔍 fix(deps): update dependency semantic-release to v22    [https://github.com/semantic-release-action/typescript/pull/18]
```

Operate on that selection with a different action:

```
$ batch-edit-pr "author:app/renovate assignee:@me semantic-release to v22" "approve and merge"

🚢 fix(deps): update dependency semantic-release to v22    [https://github.com/semantic-release-action/github-actions/pull/24]
🚢 fix(deps): update dependency semantic-release to v22    [https://github.com/semantic-release-action/rust/pull/75]
🚢 chore(deps): update dependency semantic-release to v22  [https://github.com/semantic-release-extras/test-verified-git-commit/pull/18]
🚢 fix(deps): update dependency semantic-release to v22    [https://github.com/semantic-release-action/typescript/pull/18]
```
