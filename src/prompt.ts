export function buildReviewPrompt(args: {
  repoFullName: string;
  prNumber: number;
  prTitle: string;
  prBody: string;
  baseBranch: string;
  headBranch: string;
  diff: string;
}): string {
  const { repoFullName, prNumber, prTitle, prBody, baseBranch, headBranch, diff } = args;

  return `You are an expert code reviewer. Review the pull request below.

### Context
- Repository: ${repoFullName}
- PR #${prNumber}: ${prTitle}
- Base: ${baseBranch} ← Head: ${headBranch}

### PR description
${prBody || '(no description)'}

### Diff
\`\`\`diff
${diff}
\`\`\`

### Instructions
Evaluate the diff for correctness, security, maintainability, and style. Tag each finding with a severity:
- **[BLOCKING]** — security flaws, correctness bugs, data loss risks, broken APIs.
- **[WARN]** — meaningful concerns that should be addressed but do not block merge.
- **[NIT]** — style, naming, minor suggestions.

If the diff looks good overall, say so briefly and still call out any NITs.

### Output format (STRICT)
Respond in Markdown. Structure:

## Summary
One short paragraph.

## Findings
List findings grouped by severity. For each, include: file path, approximate line context, and the issue.
If there are none at a severity, omit that subsection.

## Verdict
End with EXACTLY one line in this format — nothing after it:

\`VERDICT: approve\` — no blocking issues, ready to merge.
\`VERDICT: comment\` — has warnings/nits but nothing blocking.
\`VERDICT: block\` — one or more BLOCKING issues.
`;
}
