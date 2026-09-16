# Loop dry run: the rice recipe

A manual run of the three-chair loop against a non-software procedure, to test whether the mechanism produces real findings or just plausible motion.

Source: Edward's rice recipe, `drafts-research/LinkedIn.md`.
His own post makes the analogy explicitly ("if you've ever transcribed a recipe, you've tried technical writing"), which is what makes it a fair test.

Run 2026-09-16.
Design under test: [The ideal documentation plugin](ideal-plugin-design-2026-09-16.md).

## Casting

1. **Where does the truth live?** In observable behavior. The rice, the pot, the physics of steam.
1. **What does the reader need?** To do something.

Top left: **subject matter expert and technical writer**.

Worth noting on its own: the casting matrix resolved cleanly on an artifact from a completely different domain.
Weak evidence, but evidence, that the two axes are describing something real rather than something software-shaped.

## Pass 0: the packet

The source is already close to a packet, which is itself a finding.
Left as written, it carries three advocate-chair moves that should not be in a packet: the orienting first sentence about yield and time, the parenthetical calibration on the oil quantity, and "no peeking."

Restated cold:

```text
YIELD    4-6, as a side or base
TIME     ~45 min claimed

INGREDIENTS
  rice           2 cups
  olive oil      1/3 cup
  coriander      1 tsp
  water          2.5 cups
  salt           1 tsp
  bay leaves     2, dried

EQUIPMENT
  strainer
  wide pot with tight-fitting lid
  fork

STEPS
  1  rinse rice until water mostly clear
  2  oil into pot, medium-high heat
  3  oil moves easily -> add rice, agitate 2-3 min
  4  add coriander, agitate, toast 1 min
  5  add water, stir, add salt and bay leaves
  6  boil, then reduce to simmer
  7  cover immediately, simmer 20 min
  8  heat off, wait 15 min, do not open
  9  fluff with fork, remove bay leaves

PROVENANCE   SME experience throughout. No external source.

UNKNOWNS
  rice variety unspecified
  coriander form unspecified (ground or seed)
  "medium-high" is stove-relative
  no failure mode stated
```

## Pass 1: what the advocate chair adds, and the ledger

The ledger is everything in the shaped prose with no antecedent in that packet.

| Entry                                              | Type                 | Routes |
| --------------------------------------------------- | -------------------- | ------ |
| "long-grain white rice"                             | Implied fact          | Always |
| "ground coriander"                                  | Implied fact          | Always |
| "drain the rice well before adding it to the oil"   | Structural claim      | Yes    |
| "cover immediately after reducing the heat"         | Structural claim      | Yes    |
| "removing the lid releases the steam"               | Implied fact          | Always |
| Section headings, transitions                       | Connective prose      | No     |
| "See also: adapting for brown rice"                 | Relation              | Low    |

Three of these are worth walking through, because they are the ones that justify the mechanism.

### Rice variety

The packet says "2 cups of rice."
A 1.25:1 water ratio with a 20 minute simmer and a 15 minute rest describes long-grain white rice.
It does not work for brown rice, which wants roughly twice the water and twice the time.

Any competent writer shaping this will write "long-grain white rice," because the ratio demands it.
That is an inference, the packet never said it, and a reader holding a bag of brown rice follows this recipe and gets crunchy rice.

This is exactly the failure the ledger exists to catch: a claim that is almost certainly right, that reads like it came from the expert, and that nobody would question in a finished draft.

### Drain before oil

Step 1 rinses. Step 3 adds rice to hot oil.
Wet rice in hot oil spits.

The packet never says to drain.
The writer either adds it, which is an inference, or omits it, which burns someone.
Either way the human should see the decision, and in a finished draft nobody would.

### The lid mechanism

The packet says the steam finishes the cooking.
The writer wants to explain *why* not to peek, which means asserting a mechanism the expert did not state.

Small, and still a fact the advocate chair invented.

## Pass 2: unstated assumptions

Lower threshold, different findings.

1. **No failure mode anywhere.** What does it look like when this goes wrong? Water still standing at twenty minutes, or a scorched layer on the bottom? The expert knows both. The packet contains neither, and a reader who opens the lid to a problem has nothing to do next.
1. **"Tight-fitting" is load-bearing and unexplained.** The packet specifies it and never says why, or what to do without one.
1. **The boil is untimed.** Step 6 says boil then reduce; step 7 says cover immediately. Immediately after the boil, or after the reduction? How long is the boil?
1. **The stated total excludes prep.** Toasting and resting sum to about 39 minutes before rinsing, heating oil, or reaching a boil. Forty-five is tight.

## Pass 3: precision, and the pass that produced an oscillation

At the lowest threshold the advocate chair goes after imprecise language and finds:

1. "until the water is **mostly** clear"
1. "move it around **a bunch**"
1. "when the oil **moves around easily**"

The first two are real. The third is a mistake, and it is the most useful thing this dry run produced.

The advocate chair wants to replace an unmeasurable cue with something precise: a temperature, or "about two minutes."
The authority chair rejects it.
Home cooks do not have oil thermometers, pot mass and stove output vary enough that a fixed time is wrong more often than the cue is, and "moves around easily" is a genuine observable that works on any stove.

**The sensory cue is better documentation than the number would be.**

If the advocate chair reverts it on a later pass, that is an oscillation, and the design says to stop and hand it to the human rather than let the chairs thrash.
Here that fires correctly, on a real judgment call, over something a style-focused reviewer would have quietly "fixed."

## What this changed in the design

Four things, three of them concrete.

### 1. The procedure packet needs a prerequisites row

The schema was steps, code, citations, flat statements, and unknowns.
"Wide pot with a tight-fitting lid" has nowhere to go, so it lands inside step 2, which is precisely the bug: the reader discovers a hard equipment requirement in the middle of the procedure, after committing.

The software case is identical.
A required environment variable, a minimum version, an account that takes a day to provision: all of them currently land mid-procedure for the same reason.

**Add an explicit prerequisites and environment row, emitted before the steps.**

### 2. Provenance must be typed, and "SME experience" is a legitimate value

The schema called for citations.
This recipe has none, and none are possible. The expert's own practice is the source.

A required citation row makes the authority chair either fabricate or refuse.
Type it instead: a code reference, an external source, or SME experience.

The distinction carries real weight.
In a software procedure, an uncitable claim is a warning sign.
In a craft domain it is the normal case, and it should route into the attested-claims ledger rather than being treated as a defect.

### 3. The precision rulebook needs a cue-protection rule

`pass-3-precision.md` must say: do not replace an observable or sensory cue with a numeric one unless the authority chair confirms the number is reliable across the reader's likely conditions.

Without that rule, the precision pass actively degrades procedures, and it does so in a way that looks like an improvement in review.

### 4. Time arithmetic is a deterministic check

Stated duration against the sum of step durations is a script, not agent work.
The software analogue is any quickstart promising five minutes.

Another Phase 1 candidate, alongside literal clustering.

## Verdict

The mechanism produced findings a linter cannot reach, on a document where the expert is genuinely expert.
Rice variety and drain-before-oil are both real reader failures, both invisible in a finished draft, and neither is a style issue.

The escalation gradient produced different findings per pass rather than more of the same, which was the thing most at risk of being theater.

The oscillation guard fired once, correctly, on a genuine disagreement, and protected the best sentence in the document.

The packet schema was wrong in two places, and a fifteen minute dry run on a recipe found both.
That is a good argument for building the Phase 2 eval harness before the loop rather than after.
