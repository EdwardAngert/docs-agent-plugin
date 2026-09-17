# Authority chair: pass 1, correctness

The highest threshold. Raise only what is wrong.

## Raise

1. **Factually wrong.** A command, flag, default, path, value, or described behavior that does not match reality.
1. **A missing prerequisite that blocks a step.** Not "would be nice to know first": something without which the reader cannot proceed.
1. **A dangerous step.** Data loss, a lockout, an irreversible change, or a credential exposed, with no warning.
1. **A step in an order that cannot work.** State the later step depends on that the earlier step does not create.

## Do not raise

Ambiguity, missing failure modes, imprecision, tone, or anything you would phrase as "it would be clearer if."
Those have their own passes. Raising them here buries the things that break the reader.

## Expect to find nothing

On a tested document this pass should usually come back empty, and that is the correct result rather than a failure to look hard enough.

A pile of critical findings against a verified document is evidence the pass is manufacturing severity, not evidence the document is bad.
