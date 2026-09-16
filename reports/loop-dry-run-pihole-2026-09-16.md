# Loop dry run: the Pi-hole install and configure journey

A manual run of the three-chair loop against real, tested, already-good documentation.

Source: `edwardangert.github.io`, `src/content/docs/pi-hole/install-configure.mdx` (555 lines) and `pihole-install.mdx` (276 lines).
Both carry `<Verified date="2026-08" method="tested" />`.

Run 2026-09-16.
Companion to [the rice recipe dry run](loop-dry-run-rice-2026-09-16.md), which tested the same mechanism on a short non-software procedure.

## Why this is the harder test

The recipe was unpolished by design.
These two pages are the opposite: tested, verified, security-conscious, with explicit checkpoints, forward and backward links, per-platform tabs, and failure notes already written in.

The question is whether the loop finds anything real in documentation that is already good, without manufacturing severity to justify itself.

## Casting

1. **Where does the truth live?** Outside the repository. Pi-hole, Raspberry Pi OS, `nmcli`, UFW, Fail2Ban, and unbound are all things this project documents and does not vendor.
1. **What does the reader need?** To do something.

**SME and technical writer**, with the authority chair requiring web reach.

That requirement is not incidental.
Two of the findings below cannot be reached from inside the repository at all, which is the field report's `doc-auditor` gap reproducing itself independently on live material.

Two documents in sequence, so the continuity chair is in play.

## What passed

Worth recording, because a review that only reports problems is not calibrated.

1. `pi-admin` and `pi-hole` are used consistently across both pages.
1. Port `5335` for unbound is consistent everywhere it appears.
1. Placeholder style (`YOUR-PI-IP`, `YOUR-GATEWAY-IP`, `YOUR-OLD-PI-IP`) is consistent and deliberately fails closed, which is a genuinely good safety choice.
1. `shell` against `shellsession` is used correctly: the prompt-and-output block is the one marked `shellsession`.
1. UFW allows OpenSSH *before* `ufw enable`, with the reason stated. The lockout trap is handled.
1. The OS-resolver-against-Pi-hole-upstream distinction is called out explicitly at `install-configure.mdx:436`, which most guides get wrong silently.
1. **Every file a reader is told to edit is named by absolute path**, on the block itself: `/etc/ufw/applications.d/pihole`, `/etc/fail2ban/jail.local`, `/etc/unbound/unbound.conf.d/pi-hole.conf`, `/etc/ssh/sshd_config.d/60-disable-x11-forwarding.conf`. Not one "add the following to your config file."
1. The journey's prerequisites are stated on the overview page, with the gateway IP connected to the router access the reader already needs, and the microSD card specified with a size.

The file-path pattern deserves more than a checkmark.
It is the single most common failure in configuration documentation, it is trivially avoidable, and it is done here without exception across both pages.
I noted `shellsession` against `shell` in the first draft of this report and missed this, which is a reviewer finding what is easy to see rather than what matters.

**It became a design rule.** See below.

**Pass 1 produced almost nothing.** Nothing factually wrong, no missing prerequisite that blocks a step, no dangerous command.

That null result is itself a validation signal.
A loop that returned a pile of critical findings against tested, verified documentation would be evidence it was confabulating to justify its own cost.
The findings that did surface are pass 2 and pass 3 tier, which is what should happen here.

## Continuity findings

These are the ones neither page could produce alone, and they are the strongest argument in this run.

### The privacy claim is undercut by a setting made on the previous page

`install-configure.mdx:456` sets the Pi's own OS-level resolver:

```text
ipv4.dns "1.1.1.1"
```

`pihole-install.mdx:95` then says of unbound:

> This means no single upstream provider sees all your DNS queries.

That claim is true of client queries flowing through Pi-hole.
It is not true of the Pi itself, whose own lookups (`apt`, `curl`, the installer) continue going to Cloudflare because of a value set on the previous page.

The first page even anticipates the distinction and explains it well.
It just never closes the loop on the second page, where a privacy-motivated reader acts on it.

This is a **pass 3, true-but-misleading** finding, and it exists only in the gap between two documents.
No single-document review reaches it.

### The slugs read backwards

`install-configure` is the Raspberry Pi OS setup and comes *first*.
`pihole-install` is the Pi-hole installation and comes *second*.

The titles are correct and unambiguous.
The URLs are not: a reader arriving from search at `/docs/pi-hole/install-configure/` expecting to install and configure Pi-hole lands on SD card formatting.

An information architecture finding, and the kind that is expensive to fix later because the URLs are already indexed and cited.

### Stance is inconsistent across the set

`pihole-install.mdx:57` pipes a remote script to a shell:

```shell
curl -sSL https://install.pi-hole.net | bash
```

That is the official install method and it is not wrong.

It is notable because of what surrounds it.
These pages disable X11 forwarding, harden SSH with Fail2Ban, set UFW defaults to deny, enable unattended security upgrades, offer key authentication over passwords with the reasoning spelled out, and explain why a flat ban beats an escalating one.
A document set that careful, saying nothing at all about trusting a piped installer, reads as an unexplained gap in its own posture.

**This produced a design change.** See below.

## Ledger findings

What the advocate chair would add that the packet does not contain.

### Verified: the DNSSEC comment overstates what the directive does

`pihole-install.mdx:127`:

> `harden-dnssec-stripped` enables DNSSEC validation - unbound rejects responses that fail cryptographic signature checks, protecting against DNS spoofing.

Checked against the unbound manual.
`harden-dnssec-stripped` requires DNSSEC data for trust-anchored zones, and marks a zone bogus when that data is absent.
Validation itself depends on trust anchors, configured through `trust-anchor`, `trust-anchor-file`, or `auto-trust-anchor-file`, and the manual states plainly that trust anchors must also be set for validation to be useful.

The configuration block shown contains no trust anchor directive.
It very likely works anyway, because Debian's unbound package ships `root-auto-trust-anchor-file.conf` separately, but a reader copying this block onto a system without that default would believe they have validation they do not have.

The fix is a comment change, not a configuration change.
This is the clearest possible example of a finding that requires web access: nothing in the repository could have caught it, and the claim is about a third party's behavior.

### Question, not a correction: the port 53 caution may describe the wrong moment

`pihole-install.mdx:183` explains the `port 53: Address in use` conflict, attributing it to installing unbound without stopping it immediately.

At that point in the journey Pi-hole is already installed and holding port 53, so a freshly installed unbound should fail to bind, and the error should surface in unbound's log.
The FTL error quoted is what appears when FTL cannot bind because something else already holds the port, which is the post-reboot ordering case.

I am not confident enough to call this wrong, so under the design's own rule it becomes a question for the human rather than an applied edit.
That rule firing here, on real material, is the mechanism behaving correctly rather than confabulating a correction.

### Retracted: the language tag was deliberate

`install-configure.mdx:383` tags an `sshd_config` snippet as `java`.

I reported this as a mechanical defect and proposed a script to catch its whole class.
It is a considered choice: `java` was the closest available highlighting for `sshd_config` syntax, which has no dedicated grammar in the highlighter.

The proposed `code-block-lint.mjs` would have fired on this, on the first real document it ever ran against, against an author who had already thought about it harder than the check had.

This plugin has learned this lesson twice already.
`leverage` was pulled from `MarketingLanguage.yml` because it collided with the plugin's own vocabulary.
`just` was pulled from `Weasel.yml` entirely after it flagged ordinary restrictive English in over a dozen files.
A bare existence match cannot tell a defect from a deliberate accommodation, and language tags are the same shape of problem: the set of "correct" tags for a given syntax is defined by what the highlighter supports, not by what the content is.

**Rescoped.** A language-tag check is only safe in the narrow form: flag a block with *no* tag at all, and flag a tag the configured highlighter does not recognize. Both are unambiguous. "The tag does not match the content" is not, and it does not ship.

## Retracted: the prerequisites finding was wrong

This section originally claimed five requirements were discovered mid-procedure.
Four of the five were false, and the error is more useful than the finding would have been.

`index.mdx` is the first page of the journey, and it has an explicit `## Prerequisites` section covering:

1. **Router configuration access**, with common router IPs linked, and the sentence "This is usually your gateway IP."
1. **A Raspberry Pi**, with a note that another always-on device or a VPS also works.
1. **A microSD card, 8 GB or larger, with a way to plug it into your computer.**
1. **Familiarity with a terminal**, with the reassurance that most commands are copy-paste.

The gateway IP, the item I called out as buried 480 lines deep, is named in prerequisites and connected to the router access the reader already needs.
The microSD card is specified more completely there than the procedure page does, including a size.

Only one item survives: **a monitor and keyboard** as lockout recovery at `install-configure.mdx:490`, and even that is arguably a recovery path rather than a precondition.
One weak finding out of five claimed.

### How the error happened, which is the point

The prerequisites hypothesis arrived from the rice dry run, where it was correct.
I carried it into this run, looked at the two pages named in the request, found no prerequisites section on either, and confirmed it.

The journey starts at `index.mdx`, one click away, linked as `prev` from the first page I read.
I was running what I called a continuity check across a journey while treating two of its pages as the whole set.

The requirement is not buried in the guide.
It was buried in my reading.

### The design change this forces

**The continuity chair loads the journey, not the document.**

Its constitution must resolve the full navigational neighborhood before making any claim about absence: `prev` and `next` chains, the index or overview page, and any page the document links to as a prerequisite.
A claim that something is missing is only valid against the set the reader actually traverses.

This matters more for absence findings than for anything else the loop produces.
Presence can be verified from one file. **Absence cannot**, and absence findings are exactly where a reviewer sounds most authoritative and is most likely to be wrong.

Add to the continuity contract: **never report something as missing without first naming where you looked.**

## What this run got right about time

There is no stated duration anywhere, on a journey spanning SD formatting, imaging, a boot, five package installs, a network reconfiguration, and a reboot.
Individual waits are called out well (`10 to 20 minutes` for the upgrade), but a reader cannot tell whether to start this before dinner.

Stated separately from the retracted section above because this one was checked against `index.mdx` before being claimed.

## What this changed in the design

### 1. Continuity covers stance, not just values

The continuity chair's remit was example values, naming, and sequencing.

The piped-installer finding fits none of those.
It is a **consistency of posture** issue: a documentation set that argues for caution in six places and is silent in a seventh, where the silence is load-bearing.

A reader feels that inconsistency without being able to name it, and no per-page review surfaces it, because on its own page nothing is wrong.
That is the same shape as every other continuity finding, so it belongs to the same chair.

**Add stance to the continuity chair's remit**, alongside values, naming, and sequencing.

### 2. The prerequisites row is confirmed, not a recipe artifact

Five discovered-mid-procedure requirements in one document, one of them roughly 480 lines in and requiring the reader to leave the guide entirely.

The schema change stands, and the emitting rule should be stricter than "list what you need": **anything the reader must obtain from outside the document belongs in the prerequisites row, no matter which step first needs it.**

### 3. Language-tag validation joins the Phase 1 scripts

Cheap, deterministic, and it caught something real on the first document it ran against.

### 4. External verification is confirmed as load-bearing, on live material

The DNSSEC finding is the one that matters most in this run, and it was unreachable from inside the repository.
It is a correct-looking comment about a third party's software, in a tested document, that survived review.

Every argument for granting the authority chair web reach is now backed by a real finding rather than a hypothetical.

## The rule this run produced: name the file

If a document tells a reader to edit a file, it names that file, by full path, on the block itself.

No "add the following to your config," no "edit your SSH configuration," no path buried in prose three sentences up.
The path goes where the content goes, because that is where the reader's eye and their copy-paste both land.

This is not a style preference.
A reader who cannot tell which file to edit cannot complete the step, and unlike most documentation failures this one has no workaround and no partial credit.
It is also the cheapest possible fix, which is what makes its frequency remarkable.

The rule belongs in three places:

1. **The packet schema.** A step that modifies a file carries the path as a required field, so the authority chair cannot emit the instruction without it.
1. **The advocate chair's contract**, every pass, not just the precision pass. A file reference without a path is a blocking finding, not a polish item.
1. **A deterministic check.** A code block whose content is file contents rather than commands, with no path on the block and no path in the surrounding prose, is mechanically detectable and belongs in Phase 1 in place of the language-tag check that did not survive this run.

## Verdict, corrected

Seven findings claimed. Two substantially wrong.

| Finding                                            | Status                             |
| -------------------------------------------------- | ----------------------------------- |
| DNSSEC comment overstates the directive             | Stands, verified against the manual |
| Privacy claim undercut by the previous page         | Stands                              |
| Slugs read backwards                                | Stands                              |
| Stance inconsistency on the piped installer         | Stands                              |
| Port 53 caution may describe the wrong moment       | Stands, correctly routed as a question |
| Five prerequisites discovered mid-procedure         | **Retracted.** Four were in `index.mdx` |
| Language tag does not match content                 | **Retracted.** Deliberate choice     |

A review tool with a two-in-seven false positive rate does not get used twice, and the two failures share a cause: I reported what I expected to find rather than what I had checked.

The prerequisites claim came from the previous dry run, where it was true.
The language tag claim came from pattern-matching a defect without asking whether the author had already considered it.

Both are the failure mode this design has to be built against, not an accident of one run.

## What still stands

Three of the five surviving findings are cross-document, which remains the clearest evidence in either dry run that the continuity chair earns its seat.

Pass 1 finding nothing on tested documentation is still the result that makes the rest credible, and it is worth more now than it was before the retractions.
