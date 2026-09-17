# The style stack

Which rules the advocate chair follows, and what happens when they disagree.

## Precedence

Highest wins.

1. **The project's own conventions.** `.docs-assist/config.yml` and `.docs-assist/style.md`, plus what the existing docs already do consistently.
1. **Docs Assist house style.** `tone-and-voice.md`.
1. **The Google developer documentation style guide.**
1. **The GitLab documentation style guide.**

A project that has decided something has decided it.
Never correct a project's committed convention toward an external guide.

## When layers 3 and 4 disagree

Prefer the more restrictive option, and **record the conflict as a project style decision** in `.docs-assist/style.md`.

Recording matters as much as resolving.
A project that gets written for accumulates its own resolved style guide as a byproduct, which is better than adopting one guide wholesale or hand-authoring conventions up front.

Write the record as the decision plus its reason, not as a citation:

```markdown
- Semicolons: avoid, split into two sentences instead.
  Google permits them; GitLab forbids them. Resolved toward the stricter rule.
```

## Known conflicts

Seeded so the chair does not rediscover them.

| Question       | Google                                                  | GitLab                                             | Resolution                                          |
| -------------- | ------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| Em dashes      | Permitted, with guidance                                | Forbidden outright                                 | House style forbids. GitLab concurs.                |
| Semicolons     | "If possible, avoid using semicolons"                   | Forbidden outright                                 | Both discourage. Split the sentence.                |
| Active voice   | Near-absolute                                           | Passive allowed when product-as-subject is awkward | Follow GitLab. The exception is better engineering. |
| Contractions   | Recommends them, including negations, for informal tone | Actively encouraged                                | No conflict. Use them.                              |
| Serial commas  | Use them                                                | Use them                                           | No conflict.                                        |
| Pre-announcing | Do not pre-announce anything                            | No future promises, for legal reasons              | Strong agreement. Treat as a hard rule.             |

Two notes on this table, both learned by checking rather than recalling.

The em dash case is worth keeping in mind: the house style's ban, which could read as a personal preference, has a major style guide standing behind it.

The semicolon row was wrong until it was verified.
It said Google "permits" semicolons, which made the row look like a genuine conflict resolved toward the stricter guide.
Google actually says to avoid them where possible, so the two guides broadly agree and the resolution never rested on a precedence rule at all.
A table of conflicts that invents a conflict is worse than no table, because it teaches the chair that the guides disagree more than they do.

A topic-types row was also removed.
GitLab does organize its documentation around topic types, and "mandated" against Google's "implicit" was an assertion made from memory rather than from either guide's text.
It is not a punctuation-level rule that belongs in a conflict table, and `content-types.md` already owns the subject.

## What both guides agree on

Promote these to hard rules rather than treating them as suggestions.

1. **Second person.** "You," not "we" and not "the user."
1. **Active voice**, with GitLab's product-as-subject exception.
1. **Sentence case headings.**
1. **Present tense.** No "will."
1. **No pre-announcing.** Never promise future functionality.
   GitLab's reasoning is legal, Google's is editorial, and both land in the same place.
1. **Descriptive link text.** Never `click here` and never a bare URL.
1. **Serial commas.**
1. **Numbered lists for sequences, bulleted for everything else.**

## GitLab rules worth borrowing

Distinctive enough to name, and good.

1. **Do not write "GitLab allows you to."** Address the reader directly: "use merge requests to compare code," not "GitLab allows you to compare code." The permission framing puts the product between the reader and the task.
1. **Documentation is the single source of truth.** When an answer exists in the docs, link to it rather than restating it.
   Restating is how two versions of the same answer start drifting.

## Where this applies

The advocate chair, every pass.
The main conversation, when making a quick inline edit without running the loop.

It is one file precisely so those two cannot drift apart.
