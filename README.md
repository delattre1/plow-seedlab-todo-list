# plow-seedlab-todo-list — a stateful SEED

A small **example of a seed**: a single Markdown file
([`todo-list.seed.md`](todo-list.seed.md)) that your AI coding agent reads and turns into a
working app — an offline to-do list you open in your browser. Add tasks, check them off,
filter, and they persist across reloads.

There is **no app code in this repo to copy.** The seed is a *spec* (intent + contracts +
acceptance tests). You hand it to an agent, the agent **generates** the `todo-list.html`
from scratch, and it self-verifies that the result is correct. That "idea → prompt →
working software" round-trip *is* the point.

Where [`plow-seedlab-tip-calculator`](https://github.com/delattre1/plow-seedlab-tip-calculator)
(the "hello world") proves pure computation, this one proves the next step up: **state,
mutation, and persistence** — still with zero pre-baked code.

> **What's a seed?** A portable, agent-readable spec for "what a system should be." A
> capable agent on a fresh machine reads it and is responsible for reaching the **Done**
> state. The seed is the artifact; the running app is the proof. (Full method:
> [seedlab](https://github.com/plow-pbc/seedlab).)

---

## Run this yourself (≈3 minutes)

You need: a coding agent (Claude Code, Codex, Cursor, or any agent that can read a file,
write a file, and run a command) and a web browser. No accounts, no API keys, no services.

1. **Get the seed.**
   ```bash
   git clone https://github.com/delattre1/plow-seedlab-todo-list.git
   cd plow-seedlab-todo-list
   ```

2. **Point your agent at it.** Start your agent in that folder and give it one instruction:
   > Read `todo-list.seed.md` and execute it to its `## Done`, then run its `## Verify` and
   > report the result.

   The agent generates `todo-list.html` and runs the acceptance tests. When it finishes it
   prints `SEED_RESULT=DONE`.

3. **Open the app.** Double-click the generated `todo-list.html` (or
   `open todo-list.html` on macOS). It runs entirely offline.

4. **See it work.** Add a few tasks, check one off, switch the **Active / Completed**
   filters, watch the **remaining** count update — then reload the page and notice your
   tasks are still there.

That's the whole loop: you gave an idea-as-spec to *your* agent, on *your* machine, and it
brought working software into reality — and proved it.

---

## What "it works" means (the deterministic gate)

The seed ships its own acceptance test. The agent isn't trusted to *say* it's done — the
`## Verify` harness drives the real rendered page through a scripted journey and checks
state after each step:

| # | action | check |
|---|---|---|
| 1 | clean start | list empty, remaining = 0 |
| 2 | add 3 tasks | 3 items, in order, remaining = 3 |
| 3 | add `"   "` (spaces) | rejected — still 3 |
| 4 | toggle one done | that item completed, remaining = 2 |
| 5–7 | filter Active / Completed / All | list renders only the matching tasks |
| 8 | delete one | 2 items left |
| 9 | clear completed | only active tasks remain |
| 10 | reload the page | tasks + done-state + count all survive (localStorage) |

If all ten pass, the seed is proven for your agent.

---

## Why this is a *seed*, not a code template

- **Zero pre-baked code.** Open the seed — there's no HTML/CSS/JS to paste. The agent
  writes the app from the contracts. A paste-artifact reproduces one frozen build; a seed
  *regenerates* the software.
- **Self-verifying.** "Done" is a passing acceptance test over the real running page, not a
  vibe — including a reload to prove persistence.
- **Portable.** No server, no framework, no network. The output is one file that runs by
  double-clicking, offline, forever.

## Proof

This seed was proven the seedlab way before publishing: a **fresh, blind agent** (clean
context, given only the seed) generated the app from zero and passed `## Verify`. See
[`proof/`](proof/).

---

*Part of the [seedlab](https://github.com/plow-pbc/seedlab) method. License: MIT.*
