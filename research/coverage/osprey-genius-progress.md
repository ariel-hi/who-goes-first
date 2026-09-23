# Osprey and Genius Games — 2026-09-23

Five more inventory identities have source-checked, approved records: The King Is Dead: Second Edition, Village Green, Cytosis, Periodic and Subatomic. Current totals: **384 researched records**, **363 of 1,320 inventory identities**, **957 pending**, **132 approved catalog entries** and **112 portable random-mix criteria**. The full compendium remains unfinished.

All five complete publisher or publisher-linked PDFs were retrieved and hash-recorded. The **28 listed rendered pages** were opened and inspected alongside the relevant extracted text. This is a review of starting instructions, relevant modes and edition evidence, not a claim to have exhaustively audited every rule in these games.

| Game | Reviewed PDF pages | Decision |
|---|---|---|
| The King Is Dead: Second Edition | 4, 6, 7, 8, 12 | Latest castle visitor takes the first clockwise action/pass turn. Four-player partnerships retain individual turns. The victory tie-break is not an initial-start tie-break. ©2020 credits. |
| Village Green | 2, 4, 14, 16 | Latest plant waterer receives the card and takes the first clockwise turn. Solo play is separate. ©2020 credits. |
| Cytosis | 2, 4, 5, 6, 10, 15, 16 | Latest microscope user receives the marker and places the first flask. Initial ATP and bonus resources are explicit. Later marker claims do not imply automatic rotation. The foreword explicitly identifies the second edition. |
| Periodic | 2, 3, 4, 5, 12 | Latest calcium-carbonate contact determines clockwise order. Chalk and seashells are attributed examples. Energy is 3/4/5/3/4, not an indefinitely increasing sequence. No printing year is inferred. |
| Subatomic | 1, 3, 4, 5, 10, 15, 16 | Latest science experiment determines the first marker holder and actual turn. The PDF is linked from a second-edition product page but does not explicitly identify its own edition; the public label says exactly that. Its unrelated 11-versus-10 starter-deck inconsistency is recorded internally and not repeated as setup advice. |

All five main criteria select an individual actor without game-specific components and passed the separate random-pool review. None of the cited initial instructions provides a tie-break; the random fallback is explicitly a house rule. Approvals record Codex's identity under the owner's 2026-09-22 editorial delegation. No public deployment occurred.

Osprey discovery rejected substring false matches: INK inside Inkling and Tàin inside unrelated longer titles did not become records. Current Button Shy product pages for Tussie Mussie, Skulls of Sedlec and Death Valley yielded no PDF links in this pass; their saved HTML is only a discovery lead. An older Tussie Mussie contest prototype was not substituted for released rules. Other uncompleted discovery leads, including Megaland's failed rulebook link and The Ancient World's edition identity, remain uncounted. These local source difficulties do not block continued research elsewhere.

Evidence:

- `research/osprey-source-queue.json`, `research/genius-source-queue.json`
- `research/source-files/osprey/intake.json`, `research/source-files/genius/intake.json`, cached PDFs and page PNGs
- `research/osprey-genius-reviewed-batch.json`, with individually authored decisions and uncertainties
- `artifacts/osprey-genius-review/prepare.ts` and `apply-review.ts`, preserving original drafts and refusing catalog overwrites
- `artifacts/source-availability-osprey-genius.json`: all five cited URLs returned HTTP 200 at 10:09 UTC; the two Drive URLs are HTML viewers, with their separately retrieved PDFs used for factual review
- `artifacts/osprey-genius-live-check.json`: five articles checked on development and static servers, exact text/source/edition matching, 320px layout, zero axe violations, pool parity, draw/skip, alias search and coverage counts
- `artifacts/osprey-genius-browser/.last-run.json`: affected directory checks across Chromium, Firefox and WebKit

The retained winner scenes were preserved. No application UI code changed in this content pass. Current verification and screenshot locations are in `VERIFICATION.md`.
