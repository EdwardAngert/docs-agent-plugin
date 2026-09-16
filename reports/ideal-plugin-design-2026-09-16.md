# The ideal documentation plugin: a clean-sheet design

Written 2026-09-16, at Edward's request, setting aside what the plugin currently does.
Nothing here is implemented.
This is a design to react to, not a plan to execute.

The last section maps it back to the existing plugin, including what I would drop.

## Three corrections that turned into principles

Edward raised three specific objections to the current direction.
Each generalizes past its own case, and together they point at one thesis.

### Trust signals are recommendations, not mechanics

Verification badges, dates, and methods should not be something the plugin does on its own or automatically.
They should be something it *offers*, with the reason attached: this is how a reader decides whether to trust a page, and this is how a retrieval system decides whether to cite it.

The difference matters because an imposed convention is a tax and a recommended one is a service.
A plugin that silently writes `last-verified` into every page has made a decision on the project's behalf.
A plugin that says "this page makes twelve claims about a vendor's behavior and carries no freshness signal, which costs you with both human readers and AI tools, want me to add one?" has done something useful and left the project in charge.

### Expensive whole-set work belongs behind one deliberate gate

Generating `llms.txt` and `llms-full.txt` should not happen at the end of every workflow.
The plugin should *remind*, and the generation itself belongs in an explicitly human-initiated preparation stage, triggered by some version of "let's get this ready to merge."

Full linting plausibly belongs there too.
The general rule: any operation whose cost scales with the whole docs set, rather than with what just changed, runs at the gate and nowhere else.

### The docs stay portable, and the plugin keeps its own records

Frontmatter cannot carry the plugin's state.
Different site generators accept different frontmatter schemas, and assuming a site generator at all is already too much.
On top of that, frontmatter only pays off once a reader has landed on the page, at which point the page itself is in view and more useful than its metadata.

So: metadata the *plugin* needs lives in the plugin's own store under `.docs-assist/`.
Metadata the *site* needs is the site's business, and the plugin offers to wire it up when a site exists.
The markdown files stay plain, portable, and free of anything a given project did not ask for.

### The thesis

All three say the same thing.
**The plugin should behave like a consultant, not a framework.**
It recommends with reasons, it explains tradeoffs, and it does work on request.
It does not impose conventions on files it does not own, and it does not spend the project's money without being asked.

Everything below follows from that.

## Organize around failure modes, not commands

The current plugin is organized around workflows: draft, audit, plan, verify, health, and ten more.
That is a command surface, and it is the wrong skeleton, because it describes what the tool does rather than what goes wrong.

Expert-written documentation fails in four ways.

1. **It never gets written.** The activation energy is too high, and the expert has a day job.
1. **It assumes what the reader does not know.** The curse of knowledge. The single hardest problem, and the one an expert structurally cannot solve alone, because you cannot un-know a thing.
1. **It is not true, or stops being true.** Drift, in the docs or in the world they describe.
1. **Nobody finds it, or nobody trusts it.** Distribution and credibility.

Every capability should map to one of these.
The current plugin is strong on 1 and 3, mechanical on 4, and barely attempts 2.

Failure 2 is where the value is.
It is also the one the SME is least able to fix by trying harder, which is exactly what makes it worth automating.

## The centerpiece: a three-chair loop

Edward's proposal, and the best idea in this design.
Content passes between an AI subject matter expert built for the repo and an AI technical writer built for a style stack, over several passes.

Two of the chairs are adversarial and one is not.
The authority and advocate chairs are in productive tension over the same document.
The continuity chair is not arguing with either of them; it is representing everything outside the document, which neither of the other two is looking at.

### Why two opposed agents and not one reviewer

Because their failure modes are opposed, and a single reviewer averages them into mush.

An SME reviewing alone produces documentation that is correct and unreadable, with the hard parts skipped because they are obvious.
A writer reviewing alone produces documentation that is clear, well-shaped, and subtly wrong, with the hard parts smoothed over because they were confusing.

Two agents with opposed biases catch what either alone would miss.
The tension is the mechanism, so the design has to protect it rather than resolve it.

### The division of labor is the whole trick

Generally there is an **authority chair** and an **advocate chair**, and which roles get seated depends on the document.
A subject matter expert and a technical writer are the default cast; see "The chairs are cast, not fixed" below.

The single most important rule in this design:

1. **The authority chair may not comment on prose.** Not word choice, not structure, not heading style. It has no opinion about commas.
1. **The advocate chair may not assert facts.** It can say a claim is unclear, unsupported, or missing; it cannot say what is true.

Without this, both agents drift toward doing everything, agree with each other politely, and produce a confident average.
With it, each is forced to work in the register where it actually has signal.

### The SME goes first, and does not write prose

The loop opens with the SME chair emitting a **raw packet**: steps, code, and citations, with as little prose as it can manage.

1. **Prerequisites and environment.** Everything the reader must already have before step one: tools, versions, access, accounts, anything that takes time to obtain. The emitting rule is strict: **anything the reader must obtain from outside the document belongs here, no matter which step first needs it.**
1. **Steps.** Imperative and numbered, with no connective tissue. "Run this. Expect that."
1. **Code, commands, and configuration.** Verbatim, with real values or explicitly marked placeholders. **Any step that modifies a file carries that file's full path as a required field.** A reader who cannot tell which file to edit cannot complete the step, there is no workaround and no partial credit, and it is the cheapest failure in documentation to prevent. The path belongs on the block, where the reader's eye and their copy-paste both land, not in prose three sentences up.
1. **Provenance, typed.** Where each claim comes from: a code reference, an external source, or the expert's own experience. All three are legitimate. In a software procedure an uncitable claim is a warning sign; in a craft domain it is the normal case, and it routes to the attested-claims ledger rather than being treated as a defect.
1. **Flat statements.** When a concept has to be explained, one declarative sentence per fact, plainly and coldly.
1. **Limits.** What cannot be done, and what looks like it should work and does not.
1. **Unknowns.** Marked as such rather than smoothed over. "I do not know what happens when the token expires mid-run."

The prerequisites row exists because of a specific failure it prevents.
Without it, a hard requirement lands inside whichever step first needs it, and the reader discovers it after committing.

Two dry runs confirmed this independently.
In [the rice recipe](loop-dry-run-rice-2026-09-16.md), "a wide pot with a tight-fitting lid" had nowhere to go but step 2.
In [the Pi-hole journey](loop-dry-run-pihole-2026-09-16.md), five requirements landed mid-procedure, including the router's gateway IP roughly 480 lines in, which the reader can only get by leaving the guide and logging into a router.

Explicitly not in the raw packet: transitions, motivation, audience address, analogies, hedges, and editorializing headings.

Those exclusions are not stylistic fussiness.
Every one of them is a *writer's* decision, and if the SME chair makes them, the boundary between ground truth and framing is already blurred before the writer sees the material.
Keeping the packet cold is what makes the next step mechanical.

### A third chair sits between them: continuity

The packet does not go straight to the advocate chair.
Between them sits a **continuity chair**, whose entire job is the documentation set as a system rather than this document as an artifact.

The closest real-world analogue is a film continuity supervisor: the person who notices that the coffee cup changed hands between shots.
Nobody working on an individual scene catches those, because within one scene nothing is wrong.
They are only visible, and they are glaring, when you watch the whole thing end to end.
Documentation has exactly this problem, and nothing in the loop as described so far would catch it.

Its responsibilities:

1. **Load the journey, not the document.** Resolve the full navigational neighborhood before making any claim: `prev` and `next` chains, the overview or index page, and anything the document links to as a prerequisite. **Never report something as missing without naming where you looked.** A claim of absence is only valid against the set the reader actually traverses, and absence is where a reviewer sounds most authoritative and is most often wrong.
1. **Survey the existing set for related examples.** What has already been demonstrated, where, and with what values.
1. **Reconcile the packet's values against what is already in use.** If the packet says `api.example.com` and every other page says `example.com/api`, that is a continuity break and the packet is not automatically right.
1. **Design the examples as a series, not as one-offs.** Whether this document's example should build on the previous guide's, and what the reader is assumed to already have standing from earlier steps.
1. **Point at reuse.** When a good worked example already exists, link it rather than write a second one that drifts from the first.
1. **Bind new canonical values.** Anything genuinely new that this document introduces becomes the value future documents inherit.
1. **Keep the set's stance consistent.** A documentation set that argues for caution in six places and is silent in a seventh, where the silence is load-bearing, reads as incoherent even to a reader who cannot name why. Stance is a continuity property, not a page property, and no per-page review reaches it. See [the Pi-hole dry run](loop-dry-run-pihole-2026-09-16.md), where a set that hardens SSH, configures a firewall, and enables unattended upgrades also pipes a remote installer to a shell without comment.

This chair is the owner of the reference registry.
The current plugin has `.docs-assist/reference.yml` with `example-variable` and `pointer` entries, and it is a passive lookup table that workflows consult.
Giving it an agent turns it into something that is actively maintained and actively enforced, which is the difference between a convention and a rule.

### What continuity may and may not do

The same discipline applies as to the other two chairs.

1. **It may not assert technical facts.** That belongs to the authority chair.
1. **It may not shape prose, pick a content type, or decide architecture.** That belongs to the advocate chair.
1. **It may change example values, naming, and sequencing, and nothing else.**

One rule matters more than the rest: **any substitution that could change behavior goes back to the authority chair as a question, not applied as an edit.**

Continuity can lie.
Harmonizing a port number across two pages is a continuity win and a correctness loss if the two products genuinely default differently.
Consistency pressure applied without a guard will flatten real differences into a tidy set of pages that do not work, and that failure is worse than the inconsistency it fixed, because it is invisible until someone runs the commands.

So the continuity chair emits a **substitution list** alongside the augmented packet: every value it changed, what it changed from, and why.
The authority chair reviews that list the same way it reviews the ledger.

### The cheap version of this chair is a deterministic check

Most of the "same variables" requirement does not need an agent at all.

Extract every literal from every code block across the docs set, cluster by role (hostname, port, token, username, resource name, path), and flag any cluster holding more than one value.
That is mechanical, cheap, and catches the majority of real drift.

Ship that regardless of whether the loop ever gets built.
The chair earns its cost on the part that is genuinely judgment: whether an example should *continue* from the previous guide rather than restart, and whether a reader arriving at page four has what page four assumes they have.

### Continuity runs twice

Once at pass 0, designing the examples before the advocate chair shapes anything.

Then again at the preparation gate, checking that the finished set still coheres, including against documents written after this one.
A page can be perfectly consistent on the day it ships and be the odd one out a month later, and only a whole-set pass catches that.
This is the same argument that put bundle generation and full linting at the gate: the cost scales with the set, so it runs where set-scale work belongs.

There is a pleasing symmetry worth noting.
The continuity chair designs a journey's examples at authoring time.
Execution verification runs that same journey as one continuous sequence and proves the examples actually work.
One designs the coherence, the other tests it, and a docs set that passes both is one a reader can actually work straight through.

### The ledger is a diff, not a self-report

This is what the raw packet buys, and it is the reason to structure the loop this way.

The writer chair takes the packet, as continuity left it, and shapes it into a document.
The assumption ledger is then **everything in the prose that has no antecedent in the raw packet**.

That is a derivable quantity rather than a matter of introspection.
An earlier version of this design had the writer report what it thought it had assumed, which is a self-report, and language models are not reliable self-reporters.
Defining the ledger as the delta between two artifacts removes that dependency: any claim in the prose that cannot be traced back to a line in the packet is a ledger entry by construction.

The ledger should be **typed**, because additions are not equally risky, and only some of them are worth an expert's attention:

| Type                   | Example                                                | Routes to SME |
| ---------------------- | ------------------------------------------------------- | -------------- |
| Connective prose        | Topic sentences, transitions                            | No             |
| Link or relation        | "See also the authentication concept page"              | Low priority   |
| Audience calibration    | Assuming the reader already knows containers            | Yes            |
| Structural claim        | "This is a prerequisite," "do this before that"         | Yes            |
| Implied fact            | "Because the daemon restarts, you need to re-authorize" | Always         |

Implied facts are the dangerous category and the reason the ledger exists.
They are where a fluent writer fills a gap with something plausible, and they are invisible in a finished draft because they read exactly like everything around them.

The SME chair reviews only the rows that route to it, marking each **confirmed**, **corrected**, or **unknowable**.
Corrections become prose changes on the next pass.
Unknowables become either an explicit caveat in the document or an item on the human's list.

### What the writer chair actually contributes

The writer is not a prose polisher applied at the end.
It owns every decision the SME chair is deliberately not making:

1. **Framework and content type.** Whether this is a tutorial, a how-to, a reference page, a concept, or troubleshooting, and what that choice implies about shape. The SME does not pick this and should not be asked to.
1. **Information architecture.** Where the document belongs, what it sits beside, what order its parts go in, and whether the packet is honestly one document or three.
1. **Links.** What existing documentation this should connect to, in both directions.
1. **Relation questions.** What *else* this implies should exist: a concept page standing behind the procedure, a troubleshooting entry for the failure mode mentioned in passing, a reference table the steps keep gesturing at. These go back to the SME chair as questions, and the ones it cannot answer go to the human.

The relation questions are worth protecting as a distinct output.
They are how a documentation set grows coherently instead of accreting one page at a time, and they are exactly the thing an expert writing alone never produces, because they require standing outside the material.

### The raw packet is also the durable artifact

Prose gets rewritten.
The packet is what survives, and it is worth persisting on its own.

It is also the one format a *human* expert can produce or correct directly without pain.
Asking an SME to review a draft is asking them to do a writer's job badly.
Asking them to check a list of steps, commands, and citations is asking them to do their own job, which they will actually do.

One artifact, two possible producers, and the rest of the loop does not care which one filled it in.

### The chairs are cast, not fixed

A subject matter expert and a technical writer are the right pair for a procedure.
They are the wrong pair for a page explaining why a system works the way it does.

A conceptual document should be passed between **a professor of the topic** and **an instructional designer with a technical writing background**.
That is a different pairing along a different axis, and it matters, because the failure modes are different.

The SME and writer pair trades **truth against clarity**.
The professor and instructional designer pair trades **depth against learnability**, which is not the same problem.
A professor's failure mode is teaching at their own level and digressing into what is interesting rather than what is needed.
An instructional designer's contribution is prerequisite sequencing, cognitive load, and knowing when an analogy helps and when it quietly lies.

Two axes decide the cast:

1. **Where the truth lives.** In the system's observable behavior, or in the domain's concepts.
1. **What the reader needs.** To complete a task, or to understand something.

|                         | Reader must do                          | Reader must understand                  |
| ----------------------- | ---------------------------------------- | ---------------------------------------- |
| Truth in the system      | SME and technical writer                 | SME and instructional designer           |
| Truth in the domain      | Professor and technical writer           | Professor and instructional designer     |

How-to and troubleshooting pages land top left.
Tutorials land top right, because a tutorial is a procedure in the service of learning.
Concept and explanation pages land bottom right.
The bottom left cell is real but uncommon: implement-this-correctly material, where the authority is theoretical and the output is still a task.

Reference material is the content type where this loop earns least.
Completeness and consistency are its failure modes, and those are better served by generation and mechanical checks than by two agents talking.

### The concept packet

The raw packet changes shape with the cast, and the discipline holds: the authority chair emits cold material, and the advocate chair does the shaping.

A professor's raw packet:

1. **The model.** What entities exist and how they relate.
1. **Claims.** Flat declarative statements, one fact per line.
1. **Causal chains.** X causes Y, because Z. This is the substance of most "why does it work this way" pages.
1. **Invariants and constraints.** What must always hold, and what can never happen.
1. **Boundaries.** What this is not, and what it gets confused with.
1. **Rationale.** Why it was built this way, and what was rejected.
1. **Known misconceptions.** The wrong mental models people actually arrive with.
1. **Citations, unknowns, and genuinely contested points.**

Known misconceptions are the highest-value row and the one only a teacher produces.
Knowing which wrong model a learner shows up holding is what teaching a subject for years buys you, and dismantling it is most of what a good concept page does.

Explicitly not in the packet: analogies, motivation, pedagogical ordering, and audience calibration.
Same logic as before.
Those are the instructional designer's decisions, and a professor supplying the analogy makes it impossible to tell load-bearing truth from teaching scaffolding.

### The ledger types change with the cast

The ledger is still the diff between packet and prose.
What it catches is different:

| Type                 | Example                                    | Routes to professor |
| -------------------- | ------------------------------------------- | -------------------- |
| Connective prose      | Transitions                                | No                   |
| Pedagogical ordering  | Teaching A before B                        | No                   |
| Analogy               | "Think of it like a mailbox"               | Always               |
| Simplification        | A caveat dropped for clarity               | Always               |
| Implied causation     | "So X must happen before Y"                | Always               |
| Audience calibration  | Assuming the reader knows linear algebra   | Yes                  |

Analogy is the row that justifies the whole apparatus.
An analogy is a factual claim that two things are alike in some respect, wearing a teaching costume, and it is where conceptual writing goes wrong most often.
The professor chair signs off on every analogy, and specifically on **where it breaks**, which is the part that belongs in the document.

Simplification is the other one worth protecting.
The instructional designer will want to drop a caveat to reduce load, and will frequently be right to.
Putting it in the ledger turns that from a silent loss into an approved one.

### Casting happens before pass 0, and can be redone once

A short casting step reads the request and the available material, places it on the two axes, and seats the chairs.

The writer chair may conclude at pass 1 that the cast was wrong, most often that something framed as a how-to is really a concept page with steps attached.
Allow exactly one re-cast, with the authority chair re-emitting its packet in the new shape.

Casting also gives a falsifiable test for a judgment the current plugin makes by feel.
"Know when one is many" is presently a heuristic about dump size and story count.
A better test: **if the material needs two different casts, it is two documents.**
A request to explain how authentication works and how to set it up wants a professor and an SME, which is the signal to propose a concept page and a how-to rather than one page doing both badly.

### The real output

Not the polished document.

**A short list of what genuinely needs the human.**

That is the deliverable that respects an SME's time: the loop turns "please review this draft" into "please answer these four questions."
Four questions with context attached is a ten-minute task an expert will actually do.
A full draft review is a thing that sits in a tab for three weeks.

## The escalation gradient

Edward asked whether the personas should get grouchier or stricter with each pass.
The instinct is right and the axis needs adjusting.

**Grouchiness is the wrong variable.**
An LLM instructed to be grouchy writes grouchy-sounding prose, which is noise, and it does not read more carefully.
Tone is the output, not the cause.

**The right variable is the tolerance threshold.**
Each pass, lower the bar for what counts as worth raising.
That is mechanically what "keen-eyed" means, and it produces finer findings instead of a worse mood.

Continuity acts at pass 0 and at the preparation gate, so it does not appear in the columns below.

| Pass | SME chair                                                      | Writer chair                                               |
| ---- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| 0    | Emits the raw packet. Cold, cited, prose-free.                  | Shapes what continuity hands over. Content type, architecture, links, relations. |
| 1    | Wrong, missing prerequisite, dangerous step                     | Missing section, wrong shape, unanswered relation question   |
| 2    | Unstated assumption, missing failure mode, works-on-my-machine   | Ambiguity, undefined term, wrong reader level                |
| 3    | True but misleading, the edge case that will bite at 2am         | Imprecise verb, hedging, heading that no reader would type   |
| 4    | Anything they would mark in a real review                        | Rhythm, parallelism, link text                               |

From pass 1 onward the SME chair is reading the ledger, not the prose.
The threshold that descends is the one it applies to ledger entries: at pass 1 it corrects what is false, and by pass 3 it is flagging entries that are technically true and will still mislead someone.

Pass 4 is optional and off by default.

There *is* something real in the escalation idea, and it is worth keeping in a specific form.
What rises across passes is not irritation but **permission to be pedantic**.
By pass 3 the persona is explicitly told that nothing is too small to raise, which licenses findings it would otherwise suppress as nitpicking.
That is the useful half of "grouchier," with none of the theater.

## Nothing in the loop needs to find something

The most dangerous failure mode in this design is not a missed finding.
It is a chair that believes an empty pass means it did not do its job.

A reviewer who needs to produce findings will produce them.
It will promote trivia to defects, it will report what it expected rather than what it checked, and it will flag deliberate choices it did not recognize as choices.
Every one of those erodes trust faster than silence ever would, because a reader who gets one bad finding starts discounting the good ones.

So this is structural, stated in every chair's contract, and not left to tone:

1. **An empty pass is a successful pass.** Returning nothing is a valid and common outcome, recorded as a completed pass rather than a failure. Convergence already rewards it mechanically by ending the loop early; the contract must say so explicitly, or the chair reads its own success as being fired.
1. **There is no minimum count and no target.** Never a "top five," never a quota, never a framing that implies a number exists to be filled.
1. **Severity is never inflated to make a finding worth reporting.** A trivial finding reported as trivial is fine. A trivial finding dressed as important is a failed pass, even when the underlying observation is correct.
1. **The test before reporting anything is whether it would have mattered to a reader.** Not whether it is technically suboptimal, not whether a stricter document would have done it differently.
1. **A finding that exists only because someone was looking for it is not a finding.**
1. **A hypothesis carried in from another document is not evidence.** It has to be checked against this one before it can be claimed.
1. **Absence claims carry their search.** "This is missing" is only valid once the chair names where it looked. Presence can be established from one file; absence cannot.

The last two are not hypothetical.
Both dry runs were run by hand, and [the Pi-hole run](loop-dry-run-pihole-2026-09-16.md) produced two false positives out of seven findings.
One was a prerequisites gap that was documented on the journey's overview page, claimed because the same finding had been true in the previous dry run.
One was a language tag flagged as a defect that was a considered accommodation for a highlighter with no grammar for that syntax.

Neither came from a gap in the mechanism.
Both came from wanting the review to have produced something.

If a design this explicit about the risk still produced them by hand, the chairs will produce them too unless their contracts forbid it in these terms.

## Termination, which is where loops like this usually fail

An adversarial loop can always find something.
Three stopping conditions, all required.

1. **Hard cap.** Three passes by default, four maximum.
1. **Convergence.** Stop early when a pass produces nothing at or above the current threshold.
1. **Oscillation escalation.** If a pass reverses a change the previous pass made, stop immediately and hand it to the human.

The third is the one worth dwelling on.
An oscillation is not a bug in the loop, it is the loop correctly detecting a genuine judgment call that neither chair can settle.
That is precisely the thing an expert's scarce attention should be spent on, and it should be routed there rather than thrashed on.

Cost is also a stopping condition in practice.
The loop should report what it spent and let the human halt it at any pass boundary.

## Building the personas

### The SME chair is built from evidence, not invented

"A personality built for the user's repo" should be literal, and it is derivable:

1. **Vocabulary.** Identifiers, error strings, config keys, and the domain nouns the project actually uses.
1. **Behavior.** What the code does, so the chair can contradict the draft with something other than vibes.
1. **Prior explanations.** The maintainers' own words, harvested from issue replies, pull request review comments, and commit message bodies.
1. **Assumed baseline.** What the existing docs already take for granted about their reader.

The third item is where the personality genuinely comes from.
If the project's maintainers answer issues in four terse lines with a code pointer, the persona is terse and points at code.
That is a repo-specific personality built from real signal, rather than a costume.

**Do not debias this chair.**
Its tendency to assume too much is the bias the writer chair exists to catch.
An accommodating SME persona that patiently explains everything has destroyed the thing that made the pairing work.

### The writer chair is built from a style stack with explicit precedence

Four layers, highest wins:

1. The project's own committed `.docs-assist/style.md` and config.
1. The plugin's opinionated house style.
1. The Google developer documentation style guide.
1. The GitLab documentation style guide.

**Conflict rule:** when layers 3 and 4 disagree and nothing above them resolves it, prefer the more restrictive option and *record the conflict as a project style decision*.
Over time a project accumulates its own resolved style guide as a byproduct of being written for, which is a better outcome than either adopting one wholesale or hand-authoring one up front.

The two guides genuinely do conflict, and the seeded cases are concrete:

| Question       | Google                                    | GitLab                                        | Resolution                                    |
| -------------- | ------------------------------------------ | ---------------------------------------------- | ---------------------------------------------- |
| Em dashes      | Permitted, with guidance                   | Forbidden outright                              | House style already forbids; GitLab concurs     |
| Semicolons     | Permitted                                  | Forbidden outright                              | More restrictive wins; record the decision      |
| Active voice   | Near-absolute                              | Passive allowed when product-as-subject is awkward | GitLab's exception is better engineering        |
| Contractions   | Conversational and friendly                | Actively encouraged for friendly tone            | No conflict                                     |
| Pre-announcing | "Don't pre-announce anything"              | No future promises, for legal reasons            | Strong agreement; promote to a hard rule        |
| Topic types    | Implicit                                   | Mandated                                        | Maps onto the plugin's existing content types   |

The em dash case is worth noting: the house style's ban, which currently reads as a personal preference, has a major style guide standing behind it.

## What else the ideal plugin does

Organized by the failure mode each attacks.

### Against "it never gets written"

**Harvest, do not request.**
The single biggest lever on activation energy.
The expert has already explained this thing, three times, in issue replies and pull request comments and commit bodies.
Mine that, and bring a draft *to* them: "you explained this in three issues last month, here is a draft, is it right?"

Reacting to a wrong draft is vastly easier than facing a blank page, and it inverts who does the work.
This is the same corpus the SME persona is built from, so it comes nearly free once that exists.

**Keep dump-first intake, and point it at the raw packet.**
It is the best thing in the current plugin, and the loop gives it a cleaner target.
A human dump and the SME chair's raw packet are the same artifact filled in by different hands, which means intake stops being a separate workflow and becomes one of two ways the packet gets populated.

It also lowers what intake asks of a person.
"Tell me everything, do not worry about order or polish" is already the right instruction, and the packet format makes good on it: steps, commands, citations, and flat statements are all a person has to produce, and the prose is explicitly not their problem.

### Against "it assumes what the reader does not know"

**The three-chair loop.** Described above.

**The explain-it-back test.**
A cold agent with no repository access reads only the finished doc, then states what it would do and what it expects to happen.
Divergence from ground truth means the doc failed to transfer, and *where* it diverged names the paragraph at fault.

This is cheap, and it measures something nothing else here measures.
Execution verification asks whether the steps work.
This asks whether a human reading the page would understand what to do, which is a different question and closer to the actual job.

**Curse-of-knowledge tells.**
A named, checkable list rather than a vague instruction: imperatives with unstated preconditions, terms used before definition, assumed-installed tooling, and the hedge words that paper over a gap the writer did not want to explain.

**Reader-language evidence.**
Headings should match what a frustrated person types into a search box, not the author's mental model of the system.

**Negative results as a first-class finding.**
"You cannot do this, here is the mechanism" is the highest-value and most underproduced content in technical documentation, because it is less satisfying to write than "here is how."

### Against "it is not true"

**Execution verification stays the flagship.**
Running a procedure in an isolated workspace and reporting divergence is the strongest correctness signal available, and it should be central rather than a side command.

**Claim tracing, local and external.**
Local claims trace to code.
External claims need web reach, and any docs set about something the project does not vendor is otherwise unauditable.

**Drift detection for any hand-maintained bundle**, parameterized rather than assuming one site generator's syntax.

### Against "nobody finds it or trusts it"

**One preparation gate.**
`llms.txt` and `llms-full.txt` generation, full lint, link checking, cross-document consistency, and drift checks all live here.
Human-initiated, never automatic.
The plugin may remind; it may not spend.

**Trust and retrieval signals offered as a service.**
Freshness markers, structured data, and descriptive titles, each explained in terms of what it buys with both audiences, and each added only on a yes.

## Cross-cutting

**The plugin owns its records; the docs stay portable.**
State lives in `.docs-assist/`, not in the markdown.

**Measure outcomes, not artifacts.**
Coverage, freshness, and consistency are properties of files.
Execution verification and the explain-it-back test are properties of whether the documentation worked.
A health score should be built from the second kind.

**Fewer front doors.**
Roughly four entry points and a conversation: see where things stand, write something, check something is still true, get ready to ship.
Everything else is reachable by asking.

## What I would drop or change

1. **Frontmatter as load-bearing.** Move plugin state to the sidecar store. Offer site-facing frontmatter as a wiring service when a site generator is actually present.
1. **Verification markers as a workflow step.** Demote to a recommendation with a stated benefit.
1. **Automatic close-out linting.** Move to the preparation gate.
1. **Fourteen commands.** A product whose stated principle is that you never need to know a command name ships fourteen of them. Those two facts are in tension, and the commands are the part that should give.
1. **Audit as a separate mode from drafting.** In this design the loop *is* the audit, and it runs on new and existing documents alike.

## How this maps onto plugin primitives

Two questions get confused here, and separating them answers most of this section.

1. **Where does the behavior text live?** An authoring and distribution question.
1. **Where does execution happen?** An isolation question.

The chairs need isolated execution.
That says nothing at all about where their instructions are written, and the two answers are independent.

**The constitutions belong in skill reference files.**
The agent file is a thin execution wrapper: a name, a routing description, a tool grant, and a pointer to the constitution it loads.
The substance lives in the skill and is loaded by path.

This is not a new pattern for this plugin.
`doc-auditor` is already exactly this: a subagent whose real content is `reference/audit-methodology.md`, `content-types.md`, and `tone-and-voice.md`, read at `${CLAUDE_PLUGIN_ROOT}` paths at run time.
The chairs should work the same way.

Four reasons this is the right split, beyond consistency:

1. **Single-sourcing.** The style stack governs the advocate chair, the main conversation doing a quick inline edit, and any future reviewer. Inlining it in an agent file creates a second copy of the rules, which is the maintenance antipattern the plugin warns about by name.
1. **It is the tuning surface.** A reference file is prose that a non-programmer edits, that the repo reviews and lints, and that a project can override. Treating skills as where behavior gets tuned is the correct instinct, and it is how the rest of this plugin already works.
1. **Progressive disclosure.** A full constitution is long. Loaded from a file, a chair reads the part its current pass needs instead of carrying all of it on every spawn.
1. **Composability.** The same rules should be able to govern a subagent, the main thread, and a command, and only a skill file can serve all three.

So the corrected shape: **one skill holding every constitution, thin agent files providing isolation and tool grants, scripts for anything mechanical, and few commands.**

### When something deserves its own skill

The useful rule is about *how it gets loaded*.

1. **Loaded by description**, because a user request should route to it automatically: that needs to be a skill with its own trigger description.
1. **Loaded by path**, because something already decided to use it: that is a reference file.

Nothing routes to a chair by description.
The orchestrator knows which chair it is seating and tells it what to read.
Making each constitution its own skill would add trigger surface that competes for user requests, with no benefit and a real mis-routing risk, which is the opposite of what guide-never-gate wants.

That is why this stays one skill with more reference files, rather than five skills.

### The chairs must be subagents, and isolation is the reason

This is the load-bearing implementation decision in the whole design.

If the three chairs are sequential roleplay inside one conversation, **the ledger-as-diff is theater.**
A single context that produced the packet has already seen the reasoning behind it, so "this claim has no antecedent in the packet" becomes unverifiable: the model knows things it did not write down, and it cannot reliably tell which of its own claims came from where.

Separate contexts make that boundary real.
The advocate chair genuinely receives only the packet, so anything it adds genuinely originates with it.
The isolation is not a context-window optimization. It is what makes the mechanism sound.

The same argument makes the explain-it-back reader the purest subagent in the design: its entire value comes from *not* having the repository, and it can only be implemented as something that cannot reach it.

### Two agent files, not four

The casting matrix suggests four authority and advocate variants.
It should be two agent definitions.

The *contract* is identical across casts: the authority chair emits a cold packet and never touches prose; the advocate chair shapes and never asserts facts.
What differs is the packet schema and the persona, and both are briefing-level inputs.
A professor and an SME are the same role with a different brief.

So: `chair-authority`, `chair-advocate`, `chair-continuity`, plus `cold-reader` and a harvester.
Packet schemas live in reference files that the agent reads by `${CLAUDE_PLUGIN_ROOT}` path, the way `doc-auditor` already reads `audit-methodology.md`.

Net agent count stays roughly flat, because the chairs subsume existing ones.
The advocate chair is what `doc-drafter` becomes.
The loop is what `doc-auditor` becomes, since the audit and the draft are the same mechanism pointed at different inputs.

### A chair is three layers, and they resolve like config

"A personality built for the user's repo" cannot be one file, because part of it ships with the plugin and part of it cannot exist until a repo does.

1. **The constitution.** A skill reference file. What an authority chair *is*, always, in every project: its contract, its forbidden moves, the packet schema it owes. Shipped, versioned, reviewed, linted.
1. **The persona overlay.** A project file under `.docs-assist/personas/`. Repo-specific vocabulary, the assumed reader baseline, and the voice harvested from the maintainers' own prose. Generated once, persisted, and editable by hand when it is wrong.
1. **The brief.** Runtime only. This document, this cast, these artifact paths, this pass number and threshold.

This is the same layering `reference/config-resolution.md` already defines for everything else: plugin defaults, then committed project configuration, then the conversation.
Personas are not a new concept to invent, they are the existing resolution order applied to behavior instead of formatting.

That also answers where tuning happens.
Editing the constitution changes the role everywhere, for every project.
Editing the overlay changes it here.
Neither requires touching an agent definition.

### Artifacts are files, and the orchestrator passes paths

Subagents return text to whoever called them.
If the packet, ledger, draft, and substitution list all come back as return values, the orchestrator accumulates every one of them in the main conversation, which defeats the purpose of having isolated the work.

So the chairs read and write files, and the orchestrator passes paths.

```text
.docs-assist/
  loop/<doc-slug>/
    packet.md          authority chair
    substitutions.md   continuity chair
    draft.md           advocate chair
    ledger.md          advocate chair
    review.md          authority chair's verdicts
    questions.md       accumulated, for the human
  personas/
    authority.md
    advocate.md
```

Main-thread context then stays flat regardless of document size, and the loop becomes **resumable**, which matters because three passes can outlast a session.
It also makes every intermediate step inspectable, which is most of how anyone will debug this.

This is the same decision as Edward's frontmatter correction, applied to the loop: plugin state lives in `.docs-assist/`, never in the documents.

### Deterministic first, always

Nothing should spend a token on what a script can decide.

The cross-document literal clustering check belongs in `assets/ci/`, alongside `check-facts.mjs` and `docs-decay.mjs`.
Run it *before* the continuity chair, so the chair is briefed with the mechanical findings and spends its pass on judgment instead of rediscovering them.

The same pattern applies throughout: existing claim and fact checks run first and brief the authority chair, rather than duplicating its work.

### Implement the escalation gradient as rulebook selection

This is the best argument for constitutions-as-files, and it solves a problem the design had left open.

Telling a model to be stricter on pass three is a weak instruction, and it is the mechanism most likely to degrade into tone rather than rigor.
Handing it a *different rulebook* is not.

Split each constitution by threshold:

```text
skills/docs-assist/reference/chairs/
  advocate/
    contract.md      loaded every pass: forbidden moves, artifact contract
    pass-1-shape.md  content type, structure, missing sections
    pass-2-clarity.md  ambiguity, undefined terms, reader level
    pass-3-precision.md  imprecise verbs, hedging, heading language
  authority/
    contract.md
    pass-1-correctness.md
    pass-2-assumptions.md
    pass-3-misleading.md
```

The chair loads `contract.md` plus the one file for its current pass.
"More keen-eyed" stops being a personality instruction and becomes a fact about which rules are in context, which is far more reliable and much easier to tune.

`pass-3-precision.md` carries one rule that a dry run showed is load-bearing: **do not replace an observable or sensory cue with a numeric one unless the authority chair confirms the number holds across the reader's likely conditions.**
A precision pass left to itself will trade "until the oil moves around easily" for a temperature or a fixed time, which is worse documentation that looks better in review.
Without the rule, the lowest threshold degrades procedures instead of sharpening them.

It also fixes the cost problem in the same move.
A pass-one spawn never loads the fine-grained precision rules, so the constitution's total length stops being a per-spawn tax.

### What genuinely cannot move into a skill

Two things, both small, both in the agent file:

1. **The tool grant.** `tools: Read, Grep, Glob` is the only *enforceable* boundary available. A constitution saying "you never edit files" is a request; withholding `Write` is a guarantee. Where a forbidden move can be expressed as a missing tool, express it there and let the constitution explain the reasoning.
1. **The routing description.** Small, and only matters for selection.

That split is worth stating plainly, because it is the honest version of the forbidden-moves idea.
The authority chair's "may not comment on prose" is behavioral and lives in the constitution.
The reviewing chairs' "never edits files" is structural and lives in the tool grant.

### Commands stay few

The ones that survive are the ones a human genuinely initiates.
The preparation gate is the clearest case, because being explicitly invoked is its entire point.

The loop itself should be reachable by conversation, not command, which is what guide-never-gate demands.

### The honest limitation

Agent frontmatter grants tool *types*, not path scopes.
`tools: Read, Write, Grep, Glob` cannot express "may write only `packet.md`."

So the chairs' write boundaries are a prompt-level contract rather than an enforced one.
Mitigate it three ways: give `Write` only to chairs that produce large artifacts, keep the reviewing chairs on `Read, Grep, Glob` the way `doc-auditor` already is, and have the orchestrator check after each pass that only the expected path changed.
That last one is cheap and catches the real failure.

### Cost

Three passes at two or three chairs each is up to nine subagent runs per document, which is a real number and the main practical objection to the whole design.

Four mitigations, in order of effect:

1. Deterministic checks first, so agents never spend a pass on mechanical findings.
1. Convergence, so most documents stop at pass one or two.
1. A single-pass mode for short documents, matching how the second-opinion pass is already skipped for short entries.
1. Fan-out across documents. The loop is sequential within a document and embarrassingly parallel across them, so a plan stage still runs many loops at once, exactly as `doc-drafter` fan-out works today.

## Risks and open questions

1. **Cost.** The loop multiplies the token spend per document by roughly the number of passes. It needs a budget ceiling, a visible running cost, and a cheap single-pass mode for short documents.
1. **Two agents can agree confidently and be wrong.** Neither chair has ground truth. Mitigation: the SME chair must cite repository evidence for every correction it applies, and an uncited assertion becomes a human question rather than an edit.
1. **Persona theater.** Personality that becomes cosplay will degrade output. Mitigation: these are constrained roles defined by what each is forbidden to do, not characters with backstories.
1. **The explain-it-back test needs ground truth.** For a procedure it is clean: state the steps and the expected outcome, and compare. For a concept page the equivalent is asking the cold reader to predict behavior in a case the document never mentions, which tests whether the model transferred rather than whether the words were memorable. That is the better test and the harder one to score, so procedures likely come first.
1. **Oscillation detection could over-trigger** on trivial reversals, such as a word swapped back and forth. It probably needs a materiality threshold.
1. **Harvesting reads issue trackers**, which can contain customer data and security detail. It stays opt-in, summarizes rather than quotes, and never persists raw source.

## How this relates to what exists

Most of it is reachable from here, which is the encouraging part.

Surviving unchanged: dump-first intake, execution verification, guide-never-gate, solo-with-team-rigor, the reference registry, single-sourcing.

Reframed: frontmatter, verification markers, the close-out gate, the command surface.

Genuinely new: the three-chair loop, the assumption ledger, the explain-it-back test, harvested intake, and personas built from repository evidence.

The continuity chair is the one piece that is half-built already.
`.docs-assist/reference.yml` is the right data structure sitting there without an owner, and the cross-document literal check described above is shippable on its own, well before any of the rest of this exists.

The loop subsumes several things the current plugin does separately.
The second-opinion pass is a one-shot, one-sided version of it.
Claim verification is what the SME chair does to the ledger.
The audit is what the loop does to an existing document rather than a new one.
Consolidating those into one mechanism is most of the simplification this design buys.
