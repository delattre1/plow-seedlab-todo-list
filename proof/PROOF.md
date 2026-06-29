# Proof — plow-seedlab-todo-list

This seed was proven the seedlab way before publishing: a **fresh, blind agent** (clean
context, given **only** `todo-list.seed.md` in an otherwise-empty directory) generated the
app from zero and passed the seed's own `## Verify` over the real rendered page.

## What was run

A clean directory containing nothing but `todo-list.seed.md`. A fresh Claude Code agent was
told only:

> Read `todo-list.seed.md` and execute it to its `## Done`, then run its `## Verify` and
> report the result.

It generated `todo-list.html` (single self-contained file, inline CSS + vanilla JS, no
external requests, `localStorage` persistence) and wrote a Playwright harness that drives a
real headless-Chromium page through all ten acceptance scenarios.

## Result

```
VERIFY: 10/10 scenarios passed   (exit 0)
SEED_RESULT=DONE
```

- Generativity: the seed contains **zero** pasteable app code — the agent authored the app
  from the contracts alone (Rule 42).
- Offline / single-file confirmed: no `http(s)://` in `src`/`href`, no `fetch`/
  `XMLHttpRequest`/CDN/remote font. Storage key `seedlab.todos.v1` present.

## Files here

- `todo-list.generated.html` — the app the blind agent generated (an example output; your
  agent will regenerate its own).
- `verify.mjs` — the Playwright acceptance harness the agent wrote from the `## Verify`
  contract.
- `verify-output.txt` — the per-scenario pass output from an independent re-run (10/10).
- `blind-hydrate-verdict.txt` — the blind agent's final verdict.
