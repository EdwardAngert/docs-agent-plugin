# Running a doc's steps

How the plugin runs a procedure's steps to prove they work, shared by the edit step (`commands/edit.md`) and the standalone verify workflow (`commands/verify.md`).

Load this before running anything a doc tells a reader to run.

## Choose the engine

Default to what the project already uses, and depend on none of it.

`.docs-assist/config.yml`'s `verify.tool` can force `doc-detective`, `docs-assist`, or the default `auto`.
On `auto`, or when the key is absent, look for [Doc Detective](https://docs.doc-detective.com/) first:

- A `.doc-detective.json` or `doc-detective.config.json` at the repo root, a `doc-detective` entry in `package.json`'s dependencies, or `doc-detective` resolving on `PATH` (`doc-detective --version`) or through `npx doc-detective --version`.
- Found, and `verify.tool` is not `docs-assist`: run it against the doc with the scratch workspace as its working directory, and translate its per-step results into the classifications below.
  It can drive browser and HTTP steps that `doc-verifier` does not attempt; say so when telling the user what will run, since that widens what runs.
- Not found, or `verify.tool: docs-assist`: use the `doc-verifier` subagent.
  Never ask the user to install anything for this.

## Prepare the workspace

- A scratch directory outside the repository's working tree, so a run can never dirty the user's checkout.
  When the procedure operates on this repository itself, work on a disposable copy.
- Set up only what the doc's prerequisites say, plus what the docs they link to as prerequisites say.
  Anything else a step needs (the tool itself installed or on `PATH`, a running service, a file from elsewhere) is supplied, reported as a missing prerequisite, and named in the brief so the runner can tell the doc's setup from yours.
  The doc may be right to assume it; the report says so and the contributor decides, but it is never supplied silently.
- Note the environment for the report: the OS and the versions of the tools the steps depend on.
  A step that fails here and works on the doc's stated platform is a finding about the doc's prerequisites, not proof the doc is broken.

## Say what will run, before it runs

One short message, before the first command:

> "Running the 9 steps in Restore a backup, in a scratch folder.
> Two won't run: step 4 needs admin rights, and step 7 changes a real server.
> I'll report after each section."

Name what will not run and why, every time.
If most of a procedure lands in the never-run tier, say so up front: the user should know most of the procedure won't run before waiting on the rest.

## Show progress while it runs

A subagent's result reaches the conversation only when it finishes, so one long run is silence.
Run a procedure in chunks, one per section of the doc, or one per five or so steps when a section is longer.
Before the first launch, put the chunks on the session's task list, one task per chunk, when the session has a task tool, and mark each one in progress and done as it goes (see "Show where the work is" in `SKILL.md`).

1. Launch `doc-verifier` for the first chunk, with the scratch workspace, in the foreground: wait for it, never run it in the background.
   A background run returns control with nothing to report, and the user is back to watching a silence.
   Launch one chunk per message: two launches in one message run side by side, with no progress line between them and no chance to stop the second when the first fails.
1. When it returns, post one line per step, then a line saying what is next:

   > "Steps 1 to 3 passed.
   > Step 4 not run: needs admin rights.
   > Next: Restore the files, steps 5 to 7."

1. Launch the next chunk in the same workspace.
   Brief it with the steps already run and their commands, so it can re-establish anything a fresh shell loses, such as an environment variable an earlier step exported.
   Files the earlier chunks created are already there.
1. Stop chunking when a step fails and later steps depend on it: report them as blocked rather than launching more runs.

A short procedure, three steps or fewer, runs as one chunk.
Anything longer is always chunked, even when it would be faster as one run: a single run of a whole doc leaves the user nothing to see but "still running".
A journey, several docs that chain into one outcome, runs in one shared workspace with the same chunking, one doc at a time.

## Classify every step

| Classification | Meaning                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `pass`         | Ran, and the output and effect match the doc                              |
| `divergence`   | Ran, and the output or effect differs from the doc; show both             |
| `fail`         | Ran and errored; show the error                                           |
| `blocked`      | Unreachable because an earlier step failed                                |
| `unverified`   | Not run: credentials, admin rights, real services, destructive, opted out |
| `skipped`      | Not executable, such as expected output or data                           |

The safety tiers in `agents/doc-verifier.md` decide what runs.
They are instructions to an agent, not an operating-system sandbox; a project that needs hard isolation should run the whole session in a container or a disposable VM, and it is fine to say so.

## Turn results into the next move

- **A missing prerequisite** the run had to supply is the assumption gap, made concrete.
  Fix the doc's prerequisites with what the run proved was needed.
- **A divergence or failure** where the doc and the code agree on intent: fix the doc to match what actually happened.
- **A failure that could be the doc or could be the code** becomes a question for the person who knows, with the evidence attached:

  > "Step 3 failed here with `unknown flag: --force`.
  > Did the flag change, or does this step need something set up first?"

  Never rewrite a doc to match what may be a bug.
- **Unverified steps** stay listed with their reasons, so a partial run is never read as a full one.

## Record it

- A doc runs clean when every step that could safely run ran and passed.
  Steps not run for safety (admin rights, credentials, real services) don't count against it, and the summary names them: "Runs clean; the two `sudo systemctl` steps weren't run, by design."
  A step that could not run because the doc gives nothing to run (a placeholder, "use your own procedure", a check with no command) means the procedure is incomplete, so the doc does not run clean: say which steps stand in the way.
  For a journey, say which docs the run reached cleanly.
  Tell the contributor in those words; the plugin writes no date or mark into the doc.
- Note in the branch's journal, per `journal.md`: what ran, where, and the result, in one line per doc, replaced by the next run of the same doc; and each divergence left unresolved, as a question for whoever can answer it.
- Steps marked `<!-- docs-assist:no-verify -->` by the doc's author are skipped and say so.
