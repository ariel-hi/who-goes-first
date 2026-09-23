# Gamelyn official Dized references — 2026-09-23

Six more inventory identities now have individually researched and approved English records: Tiny Epic Dinosaurs, Kingdoms, Quest, Vikings, Western and Zombies. Totals: **369 researched records**, **348 of 1,320 inventory identities**, **972 pending**, **117 approved catalog records**, and **101 portable random-mix criteria**. The entire-compendium objective remains unfinished.

All six official Dized indexes identify Gamelyn Games as publisher and state that the rules are publisher-maintained. The complete public HTML was downloaded, with SHA-256 hashes. All **52 selected rule-section bodies** were read in full, covering setup, actual turn order, applicable variants and credits. These are HTML references: no PDF pages or physical printing date were invented. The six index snapshots and all selected sections remain private research artifacts.

| Game | Review decision |
|---|---|
| Tiny Epic Dinosaurs | Latest natural-history-museum visitor, with an official own-method alternative. Simultaneous resource collection precedes the first Rancher assignment. Seat bonuses and the solo Rival's first turn are explicit. Included in random mix. |
| Tiny Epic Kingdoms | Latest sword swing, or official random choice. The active player chooses and acts before others respond clockwise. Five-player clearing skips a later action; it does not change initial setup. Included in random mix. |
| Tiny Epic Quest | Latest scavenger-hunt participant, or a group-selected token holder. The holder moves first in the Day Phase and starts the Night Phase. Clockwise token passing and solo omission are explicit. Included in random mix. |
| Tiny Epic Vikings | Latest island visitor takes the first action turn after drafting. Initial boat placement runs in reverse and is not confused with gameplay. Later-era Rune comparison and its tie-break are distinct from the initial criterion. Human starts solo eras. Included in random mix. |
| Tiny Epic Western | Latest horse sighting or official random selection assigns the Dealer, who also makes the first Posse placement. Clockwise passing and the human-before-Rival solo exception are explicit. Included in random mix. |
| Tiny Epic Zombies | Latest mall visitor or agreed method. Human turns and Zombie responses are distinct. The Human-only application in a player-controlled-Zombie mode is labeled interpretation because the criterion sentence itself is unqualified. Directory only; excluded from the portable mix. |

Exact revision approval follows the owner's standing delegation from “Reload localhost” on 2026-09-22. The assistant reviewer is named honestly; drafts are preserved separately. Approval does not authorize public deployment.

Evidence:

- `research/gamelyn-dized-source-queue.json`, `research/gamelyn-dized-section-queue.json`
- `research/source-files/gamelyn-dized/index-intake.json` and `sections-intake.json`
- `research/gamelyn-dized-reviewed-batch.json`
- `artifacts/gamelyn-dized-review/prepare.ts` and `apply-review.ts` recheck cached file hashes before writing
- `artifacts/source-availability-gamelyn-dized.json`: all **28 cited section URLs** returned HTTP 200 on a separate HEAD check at 09:31 UTC. Availability is not factual verification.
- `artifacts/gamelyn-dized-live-check.json`: six articles checked on development and static servers, exact answers/source links/clarifications, 320px fit, zero axe violations, random-pool parity and draw/skip, alias search, coverage counts
- `artifacts/gamelyn-dized-retained-home-live-check.json`: current Spinner, Card Draw and Balloon Rise retain the same scene through completion, replay and skip; long/duplicate names, twelve players and desktop checked

The initial preparation command stalled with the default tsx cache; only those task-owned stalled processes were stopped. The preparation succeeded with `TSX_DISABLE_CACHE=1`. The first article check failed with an execution context destroyed during navigation; its fresh retry passed without changing the application. The cause of that navigation interruption was not established. Neither failed attempt is counted as a pass.

Held and uncounted leads from this pass: five Lookout URLs returned HTTP 403; Tycoon/Gamelyn product discovery yielded no direct manuals; the IELLO Tussie Mussie PDF failed through the web fetcher. None produced a fabricated record. The Dized reference path supplied usable primary content for the six Gamelyn games.

No application UI changed in this batch. The finished deciding scenes already remain visible with their winners; the current pass verifies that behavior again. Actual build and browser results, screenshots and limitations are in `VERIFICATION.md`. No public deployment occurred.
