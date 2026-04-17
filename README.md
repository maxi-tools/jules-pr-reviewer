# Jules PR Reviewer

A GitHub Action that uses [Google Jules](https://jules.google) to review pull requests and post the review as a PR comment. Optionally gates merges via a commit status check.

## What it does

On every pull request:

1. Posts an in-progress comment on the PR so the author knows review has started.
2. Sets a pending commit status (`jules/review`) visible on the Checks tab.
3. Sends the PR diff to Jules for review.
4. Replaces the in-progress comment with the final review.
5. Flips the commit status to `success` / `failure` based on review verdict and your `fail_on` policy.

## Quick start

### 1. Add your Jules API key as a secret

In your repo: **Settings → Secrets and variables → Actions → New repository secret**

- Name: `JULES_API_KEY`
- Value: your key from [jules.google.com](https://jules.google.com)

### 2. Add the workflow

Create `.github/workflows/pr-review.yml`:

```yaml
name: Jules PR Review
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
      statuses: write
    steps:
      - uses: sanjay3290/jules-pr-reviewer@v1
        with:
          jules_api_key: ${{ secrets.JULES_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          fail_on: blocking
```

### 3. (Optional) Require the check to merge

**Settings → Branches → Branch protection rules → Require status check → `jules/review`**.

Without this step the red X is visible but non-blocking.

## Inputs

| Input | Default | Description |
|---|---|---|
| `jules_api_key` | — | **Required.** Your Jules API key. |
| `github_token` | — | **Required.** Usually `${{ secrets.GITHUB_TOKEN }}`. Needs `pull-requests: write` and `statuses: write`. |
| `fail_on` | `blocking` | `never` \| `blocking` \| `any`. Controls when the commit status fails. |
| `skip_drafts` | `true` | Skip review on draft PRs. |
| `skip_forks` | `true` | Skip PRs from forks (prompt-injection risk via diff). |
| `bypass_label` | `jules-override` | If this label is on the PR, review is skipped entirely. |
| `status_context` | `jules/review` | Commit status context name. |

## Verdict & severity

Jules is instructed to tag findings:

- **`[BLOCKING]`** — security, correctness, data loss.
- **`[WARN]`** — meaningful concerns, non-blocking.
- **`[NIT]`** — style, naming.

And to end with a verdict line: `VERDICT: approve | comment | block`.

`fail_on` policy maps verdict to status:

| `fail_on` | `approve` | `comment` | `block` |
|---|---|---|---|
| `never` | success | success | success |
| `blocking` *(default)* | success | success | **failure** |
| `any` | success | **failure** | **failure** |

## Notes

- The action runs for the full duration of Jules' review (~2–5 min typical, 15 min max). On public repos Actions is free; on private repos it counts against your minutes.
- Fork PRs are skipped by default because their diff can contain prompt-injection payloads.
- Drafts are skipped by default; mark the PR `ready_for_review` to trigger review.

## License

MIT
