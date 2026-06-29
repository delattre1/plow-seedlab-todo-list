# SEED: todo-list

> seed-format: 1

> **You are an AI agent reading this seed.** This file is a *spec*, not a script and
> not a README. Your job: run `## Steps` Step 0 (the Interview), then **generate** the
> software the spec describes, then run `## Verify` and report the verdict. When every
> `## Verify` check passes, print `SEED_RESULT=DONE`; on a blocker print
> `BLOCKED_REASON=<short reason>` and stop. Do not ask the human anything outside the
> single Interview turn.
>
> **This seed contains NO application code on purpose.** There is no HTML, CSS, or
> JavaScript to copy. You GENERATE the app from the intent + contracts below. That is
> what makes this a *seed* and not an install flow. If you find yourself looking for a
> code block to paste, re-read this paragraph: the contracts ARE the spec — build to
> them.

---

## Goal

Produce **one self-contained file, `todo-list.html`**, that a person opens by
double-clicking it (a `file://` URL — **no web server, no build step, no install, no
network**). It is an interactive to-do list: the user types a task and adds it, sees the
list of tasks, **toggles** a task done/undone, **deletes** a task, **filters** the view
(All / Active / Completed), sees a live **count of remaining active tasks**, and can
**clear all completed** tasks at once. The list **persists across reloads** using the
browser's `localStorage` — close the tab, reopen the file, the tasks are still there.
It must work fully offline in any modern browser, forever, with nothing else installed.

This is a *seed* in the seedlab sense: an intent expressed as a spec, generated into
working software by a blind agent, and verified deterministically over the real running
page. Where `tip-calculator` proves pure computation, this one proves the next step up —
**state, mutation, and persistence** — still with zero pre-baked code.

---

## Done

All of these are observable and are proven by `## Verify`:

- **One file, no dependencies.** A single file `todo-list.html` exists with no reference
  to any external resource — no `<script src=…>`, no `<link href=…>` to a CDN, no remote
  font, no analytics, no `fetch`/`XMLHttpRequest`. Opening it with the network fully
  disconnected behaves identically. (Inline `<style>` and inline `<script>` are expected
  and fine. `localStorage` is local-only and allowed — indeed required.)
- **Add a task.** A text input with `id="new-todo"` and a button with `id="add-btn"`
  exist. Submitting a non-empty task (clicking `#add-btn` **or** pressing Enter in the
  field) appends a new **active** task to the list and clears the input.
- **Whitespace is rejected.** Submitting an empty or whitespace-only value adds **nothing**
  and does not throw.
- **The list renders with stable hooks.** Tasks live in a container with `id="todo-list"`.
  Each rendered task is an element with `class` containing `todo-item` and an attribute
  `data-completed="true"|"false"`, and contains: a toggle control with class
  `todo-toggle` (a checkbox), the task text in an element with class `todo-text`, and a
  delete control with class `todo-delete`. Tasks render in **insertion order** (oldest
  first, newest at the bottom).
- **Toggle done/undone.** Clicking a task's `.todo-toggle` flips its
  `data-completed` between `"false"` and `"true"` (and visibly marks it done, e.g.
  strike-through). It is reversible.
- **Delete.** Clicking a task's `.todo-delete` removes that task from the list and from
  storage.
- **Live active count.** An element with `id="active-count"` carries a **`data-value`
  attribute** equal to the number of **active (not-completed)** tasks, as a plain integer
  string (e.g. `data-value="2"`). It updates immediately on every add, toggle, delete, and
  clear.
- **Filters.** Three controls exist: `id="filter-all"`, `id="filter-active"`,
  `id="filter-completed"`. The current filter governs what `#todo-list` renders:
  `all` → every task; `active` → only `data-completed="false"`; `completed` → only
  `data-completed="true"`. Switching filters re-renders; `#todo-list` contains **only the
  matching tasks** (matching is by membership in `#todo-list`, not by CSS visibility, so
  it is testable).
- **Clear completed.** A control `id="clear-completed"` removes **all** completed tasks at
  once (from the list and storage); active tasks are untouched.
- **Persistence.** Tasks and their completed-state survive a full page reload
  (`localStorage`). After reload the list, each task's `data-completed`, and
  `#active-count` are exactly as they were.
- **`## Verify` exits 0.** The acceptance harness drives the real rendered page in a
  headless browser and every scenario passes.

---

## Contracts (build to these — they are the spec)

These are FIXED. They are the seed's contract with reality; `## Verify` enforces them.

### Element hooks (ids and classes — spelled EXACTLY)

| role | hook | kind |
|---|---|---|
| New-task text field | `id="new-todo"` | `<input type="text">` |
| Add button | `id="add-btn"` | `<button>` |
| Task list container | `id="todo-list"` | any container; direct children are the task items |
| One task item | `class` contains `todo-item`; `data-completed="true"\|"false"` | per-task element |
| Toggle (per item) | `class` contains `todo-toggle` | `<input type="checkbox">` |
| Task text (per item) | `class` contains `todo-text` | shows the task's text |
| Delete (per item) | `class` contains `todo-delete` | `<button>` |
| Active-task count | `id="active-count"`; `data-value="<int>"` | shows the integer; `data-value` is the source of truth |
| Filter: all | `id="filter-all"` | `<button>` |
| Filter: active | `id="filter-active"` | `<button>` |
| Filter: completed | `id="filter-completed"` | `<button>` |
| Clear completed | `id="clear-completed"` | `<button>` |

### Behavior rules (FIXED)

- **Add:** on `#add-btn` click or Enter in `#new-todo`, if the trimmed value is non-empty,
  append a new task `{ text: <trimmed value>, completed: false }`, persist, clear the
  input, and re-render. If the trimmed value is empty, do nothing.
- **Order:** tasks are kept and rendered in **insertion order** — index 0 is the
  first-added, the newest is last. Toggling/filtering must not reorder them.
- **Toggle:** clicking an item's `.todo-toggle` flips only that task's `completed`,
  persists, and re-renders.
- **Delete:** clicking an item's `.todo-delete` removes only that task, persists, and
  re-renders.
- **Filter:** the active filter is one of `all | active | completed`. `#todo-list` renders
  **only** tasks matching the filter, still in insertion order. The default on first load
  is `all`.
- **Clear completed:** removes every task whose `completed` is `true`, persists, re-renders.
- **Count:** `#active-count` `data-value` is always the number of tasks with
  `completed === false`, regardless of the current filter (it counts the whole list, not
  just the visible rows).
- **Persistence:** the whole task array (text + completed) is written to `localStorage`
  under the FIXED key **`seedlab.todos.v1`** on every mutation, and read back on load. The
  current filter need not persist (it MAY reset to `all` on reload). Storage holds a JSON
  array of `{text, completed}` objects.
- **Render on load:** read storage and render once on load so the page is correct before
  any interaction (empty storage → empty list, `#active-count` `data-value="0"`).

### Non-negotiables (forbids)

- **No external requests of any kind.** The file is the whole app. (`localStorage` is
  local and required; it is not a network request.)
- **No build step / no framework install required.** Plain HTML + inline CSS + inline
  vanilla JS. (If you reach for React/Vue/a bundler, you have over-built this seed.)
- **No reordering** of tasks on toggle/filter/delete — insertion order is stable.
- **The `data-completed` and `data-value` attributes must always reflect true state** —
  they are how `## Verify` reads the app independent of styling.

### Design (intent, not pixels)

Make it look clean and usable — a clear input row at top, the task list below, the filter
buttons and remaining-count visible, completed tasks visibly distinct (e.g. dimmed /
strike-through). Readable on a phone screen. Aesthetics are yours; the contracts above are
not.

---

## Inputs

This seed needs **no secrets, no accounts, no external services** — that is deliberate.
The only input is where to write the file.

| name | required | default | detect | ask |
|---|---|---|---|---|
| `OUTPUT_PATH` | no | `./todo-list.html` | Is a target path already given or implied by the working directory? | "Where should I write the generated app? (default `./todo-list.html` in the current directory)" |

There is **no `WIRE_SAMPLE`** row: this seed crosses no system boundary (no API, no
webhook). All behavior is local and deterministic given a known starting storage state.

---

## Components

What this seed assembles (all already present on a normal dev machine — nothing to vendor):

- **A modern web browser** (Chrome/Edge/Firefox/Safari) — to open and run the file.
- **The generated file** `todo-list.html` — authored by you from the contracts.
- **For `## Verify` only:** a headless browser driver. Preferred: Playwright
  (`npx -y playwright@^1.6` + `npx playwright install chromium`, no project setup needed).
  Any equivalent headless-DOM tool that can load the file, type into inputs, click
  buttons, read element attributes, and reload the page is acceptable — the harness drives
  the **real rendered page**, it does not re-implement the logic.

---

## Steps

> Intent first, commands second. You have reasoning — adapt commands to your OS, but do
> not change the **contracts**.

### Step 0 — Interview (mandatory, the only interactive turn)

Read `## Inputs`, run each `detect`. Send the user ONE message listing what's already
satisfied and anything you need. In practice the only question is the output path, and it
has a sensible default — if the user gave you a directory or said "just build it," skip
straight to building. After this turn, run to completion or to a `BLOCKED_REASON` block;
do not ask further questions.

### Step 1 — Generate the app

Author `todo-list.html` at `OUTPUT_PATH` as a single self-contained file that satisfies
every line of `## Contracts` and `## Done`:
- the input row (`#new-todo`, `#add-btn`) wired to add on click and on Enter;
- a render routine that reads the in-memory task array, applies the current filter, and
  rebuilds `#todo-list` with one `todo-item` element per matching task (carrying
  `data-completed`, a `.todo-toggle`, a `.todo-text`, a `.todo-delete`);
- toggle / delete / clear-completed / filter handlers that mutate state, persist to
  `localStorage["seedlab.todos.v1"]`, and re-render;
- `#active-count` whose `data-value` is recomputed (count of `completed===false`) on every
  change;
- load logic that reads storage and renders once on load.

Keep it small, plain, and dependency-free. Inline the CSS and JS.

### Step 2 — Self-check against the contracts

Before running `## Verify`, sanity-read your own file: are all the ids/classes present and
spelled exactly (`new-todo`, `add-btn`, `todo-list`, `todo-item`, `todo-toggle`,
`todo-text`, `todo-delete`, `active-count`, `filter-all`, `filter-active`,
`filter-completed`, `clear-completed`)? Does `#active-count` carry a correct `data-value`?
Do tasks render in insertion order? Does the storage key match `seedlab.todos.v1`? Fix
before verifying.

### Step 3 — Verify

Run `## Verify`. If a scenario fails, fix the generated file (never weaken the test) and
re-run until all pass. Then report `SEED_RESULT=DONE` with the verdict.

---

## Verify

**The acceptance harness drives the real rendered page in a headless browser and asserts
every scenario below. Exit code is the truth: `0` = Done, non-zero = not Done.** This is
an agent-driven check over real running state — you are reasoning over what the actual page
renders and stores, not over your own source.

The harness must, **before each independent scenario**, start from a **clean storage
state** (load the page, clear `localStorage`, reload — or navigate with storage cleared) so
scenarios do not leak into each other. It then drives the page via real interactions
(type, click, reload) and reads back DOM state.

Helpful primitives (write your own; this is the test contract, not the app):
- `addTask(text)`: fill `#new-todo` with `text`, click `#add-btn` (or press Enter).
- `items()`: the direct children of `#todo-list` (the currently-rendered tasks).
- `count()`: integer value of `#active-count`'s `data-value`.
- `toggleAt(i)` / `deleteAt(i)`: click the `.todo-toggle` / `.todo-delete` of the i-th
  rendered item.

### Acceptance scenarios (must ALL pass — these are the gate)

1. **Empty start.** Clean storage, load. `items().length === 0` and `count() === 0`.
2. **Add three.** Add `"Buy milk"`, `"Walk dog"`, `"Write seed"`. Now `items().length === 3`,
   every item `data-completed === "false"`, the three `.todo-text` values are exactly those
   strings **in that order**, and `count() === 3`. The `#new-todo` input is empty after each
   add.
3. **Reject whitespace.** With those 3 present, `addTask("   ")` (spaces only). Still
   `items().length === 3` and `count() === 3` — nothing added, no error.
4. **Toggle.** Toggle the item at index 1 (`"Walk dog"`). That item now
   `data-completed === "true"`; the other two remain `"false"`; `count() === 2`. Order
   unchanged (texts still `Buy milk, Walk dog, Write seed`).
5. **Filter active.** Click `#filter-active`. `#todo-list` now contains exactly the 2
   active items (`Buy milk`, `Write seed`, in that order); `count()` is still `2`.
6. **Filter completed.** Click `#filter-completed`. `#todo-list` contains exactly the 1
   completed item (`Walk dog`); `count()` still `2`.
7. **Filter all.** Click `#filter-all`. `#todo-list` again contains all 3 in insertion
   order.
8. **Delete.** With filter `all`, delete the item at index 1 (`Walk dog`, the completed
   one). Now `items().length === 2` (`Buy milk`, `Write seed`); `count() === 2`.
9. **Clear completed.** Toggle index 0 (`Buy milk`) to completed → `count() === 1`. Click
   `#clear-completed`. `Buy milk` is gone; `items().length === 1` (`Write seed`,
   `data-completed === "false"`); `count() === 1`.
10. **Persistence across reload.** Starting clean: add `"alpha"`, `"beta"`, `"gamma"`;
    toggle index 1 (`beta`) completed. Reload the page (do NOT clear storage). After reload:
    `items().length === 3`, texts `alpha, beta, gamma` in order, `beta` has
    `data-completed === "true"` while the others are `"false"`, and `count() === 2`.

A passing run prints a short line per scenario (e.g. `[4] toggle → count 2 ✓`) and a final
line such as `VERIFY: 10/10 scenarios passed`, then exits `0`. Any failure prints the
scenario, expected vs observed, and exits non-zero.

### Also confirm (offline / single-file, cheap greps over the generated file)

- No external resource references: the file contains no `http://`/`https://` URL in a
  `src`/`href`, no `fetch(`, no `XMLHttpRequest`, no CDN/font link. (A passing grep for the
  *absence* of these is part of Done — the app must run with the network off.)
- The storage key string `seedlab.todos.v1` appears in the file.

---

## Failure modes

**Symptom: scenario 2 fails — items appear in the wrong order (newest first).**
- Detect: `.todo-text` values come back reversed.
- Fix: append new tasks to the END of the array and render in array order; do not unshift
  or reverse.

**Symptom: scenario 4/9 fails — `#active-count` is wrong after a toggle.**
- Detect: `data-value` counts visible rows, or counts completed instead of active.
- Fix: `#active-count` `data-value` = count of `completed === false` over the **whole**
  task list, recomputed on every mutation — independent of the current filter.

**Symptom: scenario 5/6 fails — filtering hides rows with CSS but they're still in
`#todo-list`.**
- Detect: `items().length` doesn't drop when filtering.
- Fix: filtering must change **what is rendered into `#todo-list`** (only matching tasks
  are children), not merely toggle a CSS `display`. The test counts children.

**Symptom: scenario 10 fails — tasks vanish or lose completed-state on reload.**
- Detect: after reload the list is empty or `data-completed` resets.
- Fix: persist the full `{text, completed}` array to
  `localStorage["seedlab.todos.v1"]` on every mutation, and read+render it on load. Make
  sure the key matches EXACTLY.

**Symptom: `## Verify` can't find an element / reads `null`.**
- Detect: harness throws on a selector.
- Fix: an id/class is misspelled. The hooks are FIXED — see `## Contracts`. Match them
  exactly, including `data-completed` on each item and `data-value` on `#active-count`.

**Symptom: adding `"   "` (whitespace) creates a blank task.**
- Detect: scenario 3 fails.
- Fix: trim the input and reject when the trimmed value is empty.

---

## Cleanup

This seed writes exactly one file. To reset: delete `todo-list.html` (and any throwaway
harness/`node_modules` you created for `## Verify`). To clear app data, the page's tasks
live only in the browser's `localStorage` under `seedlab.todos.v1` for that file origin —
clearing site data or deleting the file removes them. Re-running the seed regenerates the
app from scratch.
