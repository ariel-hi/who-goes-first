# Official Dized follow-up — 2026-09-23

Ten more inventory identities have researched and approved English records. Current totals: **379 researched records**, **358 of 1,320 inventory identities**, **962 pending**, **127 approved catalog entries**, and **107 portable random-mix criteria**. The entire-compendium objective remains unfinished.

The ten accepted game indexes identify their publishers and describe their references as official publisher-maintained rules. All **72 selected rule-section bodies** for these ten games were read in full, including relevant setup, turn, role and variant sections. HTML snapshots and SHA-256 hashes are retained. These are online references; no PDF-page inspection or physical printing date is claimed.

| Game | Review decision |
|---|---|
| Big Monster | Standard three-to-six-player play starts simultaneously. Two-player and special three-player modes are sequential, but the cited sections do not select their initial starter. The article states that omission and labels its random suggestion as a house rule. Directory only. |
| Blood Rage | Farthest-north birthplace selects the first Action turn after drafting. The first-game draft omission and end-of-Age token passing are separate. Portable. |
| Champions of Midgard | Latest glory earned in battle, or official random choice. Leader selection runs in reverse; worker placement starts with the marker holder clockwise. The undefined thematic criterion is not narrowed. Portable. |
| Coup | Previous game's winner or official random choice. Two-player starting coins differ. Not generalized to the most recent winner of any game. Directory only under this pool review. |
| Flamme Rouge | Latest bicycle rider places both cyclists first; youngest resolves a placement tie. Energy selection is simultaneous, then riders move by position. Directory only. |
| New York Slice | Latest winner of any game is the Slicer. The left-hand neighbor chooses the first portion; the Slicer takes the last. Directory only, preserving the role distinction. |
| Schrödinger's Cats | Latest documentary watcher is both dealer and initial Active Scientist. No subject restriction is invented. Portable. |
| The Grimm Forest | Latest bacon eater takes the Starting Player token and first Build turn after shared Gather choices. Clockwise order and the two-player Prince Regal exception are explicit. Portable. |
| Volcano | Closest travel to molten lava, or official random choice. Explicitly the Fiesta Caldera variant, not silently the original setup. Portable. |
| boop. | Latest cat petter or official random choice. Opening kitten placement and the introductory variant are distinct from later Cat play. Portable. |

Visual inspection caught four duplicated official random alternatives under the generic House rule heading. Champions of Midgard, Coup, Volcano and boop. now retain the official alternative in their main answers without that misleading duplicate. Drafts and approved copies were corrected together; the exact four catalog approvals and three existing random-pool fingerprints were reviewed again. This did not change their source claims.

The title match for **Balloon Pop!** was rejected: Dized covers Lautapelit.fi's Mikko Punakallio game, while inventory ID 212027 identifies Andy Van Zandt's Tasty Minstrel Games/Arclight dice game. No rule or coverage match was created for it. The five retrieved but unrelated rule-section bodies are excluded from the 72 reviewed sections. Identity references and Big Monster's unresolved variant selection are recorded in `research/dized-followup-held.json`.

Evidence:

- `research/dized-followup-source-queue.json`, `research/dized-followup-section-queue.json`, `research/dized-followup-extra-queue.json`
- `research/source-files/dized-followup/{index,sections,extra}-intake.json` and cached HTML
- `research/dized-followup-reviewed-batch.json`
- `artifacts/dized-followup-review/prepare.ts`, `apply-review.ts`, and `correct-fallback-label.ts`
- `artifacts/source-availability-dized-followup.json`: all **44 cited URLs** returned HTTP 200 in the separate 09:50 UTC HEAD check; availability is not factual verification
- `artifacts/dized-followup-live-check.json`: final ten-article inspection at 09:52 UTC, development and static responses, exact answers, source links, clarifications, editions, 320px fit, zero axe violations, random-pool parity, draw/skip, alias search and held identity
- `artifacts/dized-followup-browser/.last-run.json`: the affected Chromium, Firefox and WebKit directory matrix

Preparation was observed running through several tool observation windows, then completed with exit code zero. It was not restarted or killed. The per-command `TSX_DISABLE_CACHE=1` setting was already in use; no cause for its delay is established. No shared server or cache was removed.

All ten approvals use the assistant's identity under the owner's standing 2026-09-22 editorial delegation. No public deployment occurred. The retained winner scenes remain implemented and were unchanged in this content pass. Current results and representative screenshots are in `VERIFICATION.md`.
