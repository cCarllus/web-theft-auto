# Commit Message Instructions

Generate commit messages for this repository using Conventional Commits.

## Required format

`<type>: <summary>`

An optional scope is allowed only when it clearly improves the message:

`<type>(<scope>): <summary>`

## Allowed types

Use only these types, matching `.commitlintrc.cjs`:

- `ci`
- `chore`
- `docs`
- `feat`
- `fix`
- `perf`
- `refactor`
- `revert`
- `style`

## Subject rules

- Write the commit message in English.
- Use lowercase Conventional Commit types.
- Write the summary in imperative present tense, such as `add`, `fix`, `replace`, `prevent`, or `update`.
- Describe the primary outcome of the change, not a list of changed files.
- Keep the header concise. Aim for 72 characters or fewer.
- The complete header must never exceed 100 characters.
- Do not end the summary with a period.
- Do not use vague summaries such as `update files`, `changes`, `misc fixes`, or `work in progress`.
- Do not mention AI, model names, generated-by metadata, or co-author trailers unless the user explicitly asks.
- If several changes belong to one feature, summarize the feature-level outcome instead of enumerating every sub-change.
- If the staged changes contain unrelated work, do not invent one broad message. Tell the user they should be split into separate commits.

## Examples

Good:

`feat: replace OpenSA branding with Web Theft Auto assets`

`fix: preserve camera state when leaving vehicles`

`docs: update the implementation checklist`

`refactor: simplify interior transition pairing`

Avoid:

`feat: add branding files, update favicon, change metadata, change menu links, update docs, fix tests`

`update stuff`
