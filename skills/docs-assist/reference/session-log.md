# Session Log

A long engagement (`init` into `audit` into `plan` into `health` into `setup-lint`, or any run that spans many turns and files) generates a second kind of record besides the docs themselves: what was found, what was decided, and why a call was made one way and not another. That record has nowhere to live today, and without a designated place for it, it leaks into whatever file happens to be open, usually `docs/plan.md`, mixing forward-looking content plan with after-the-fact narrative until neither reads cleanly.

## What It Is, and Isn't

`.docs-assist/session-log.md` is an append-only running narrative: a dated entry per session, noting which commands ran, what was found, and why a nontrivial call went the way it did (a lint rule disabled and why, a convention treated as provisional pending confirmation, a scope decision). It is not:

- **The content plan** (`docs/plan.md`): forward-looking, describes what to write and in what order. The session log is backward-looking, describing what already happened.
- **A polished artifact**: no heading discipline, no voice pass, no second-opinion review. It is scratch narrative for whoever picks up the work next, not a document a reader outside the engagement is meant to consume.
- **A replacement for commit messages or PR descriptions**: those already carry the "why" for a shipped change. The log is for the parts of an engagement that never become a commit, like a rejected approach or a question still open.

## When to Keep One

Offer it, the same way the intake loop offers a running notes file (see "Persist as You Go" in `intake.md`): at a natural pause, when a session is already spanning more than one docs-assist command, or when the contributor says something that signals a multi-sitting engagement. Don't default to writing it for a single command run; a one-shot `/docs-assist:health` check has nothing worth logging.

## How to Use It

- Append, don't rewrite. Each entry is dated and short: what ran, what it found, what was decided.
- Read it back in before continuing a long engagement in a new session, the same way a notes file gets checked for at the start of a drafting command.
- Offer to clear or archive it once the engagement's work has landed (docs published, plan executed), the same lifecycle rule the intake notes file follows.
