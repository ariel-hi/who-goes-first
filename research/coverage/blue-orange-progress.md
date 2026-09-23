# Blue Orange source batch — 2026-09-23 UTC

The official US [rules index](https://www.blueorangegames.com/games/download-rules) and European [rules index](https://blueorangegames.eu/en/resources/game-rules/) yielded 18 PDF manuals matching 12 distinct titles in the discovery inventory. All 18 downloaded successfully. Alternate manuals are not counted as extra game identities.

13 edition-specific records are now under `research/games/`. The starting instructions were inspected visually; contextual text distinguishes initial roles, simultaneous actions and variants. All are drafts without any human approval or publication. Source pages, actual check dates and downloaded-file hashes are included. The records are available in local search and the random-rule draw.

| Game | Primary file / one-based PDF page | Research result |
|---|---|---|
| Cloud City | US folded file, 1–2 | Playful head-in-the-clouds criterion; not an inferred height rule; starting tile 1 begins play |
| Color Flush | English six-page file, 2 | Most colors worn |
| Disc Cover | US bilingual file, 2–3 and 5–6 | Most recent music listener becomes Leader in the competitive variant; cooperative instructions differ |
| Lost Seas | French four-page file, 2, printed page 6 | Most recent person to go to sea; English summary explicitly identifies the French edition |
| Mech A Dream | Bilingual file, 2 | Most recent dream about robots |
| Neoville | US-linked file, 2 | Most recent time spent in nature; Equity tile 1 |
| Next Station London | English 20-page file, 2 and 4 | Recent Underground traveler controls card reveals; everyone draws simultaneously |
| Next Station Tokyo | Folded two-page file, 2, printed pages 2 and 4 | Recent subway traveler controls card reveals; everyone draws simultaneously |
| Spin Circus, US | Four-page bilingual file, 1 | Recent acrobat sighting |
| Spin Circus, UK | Two-page English file, 1 | Recent stage sighting; explicitly differs from the US file |
| Volto | English six-page file, 2 | Most cunning player |
| Wilson & Shep | US folded file, 2 | Recent sheep sighting assigns Wilson; distinguish Wilson's swap from the left neighbor's first Shep move |
| Wonder Woods | English four-page file, 2 | Recent mushroom picking |

The two Spin Circus entries cite both inspected manuals so the edition comparison is reviewable. The Lost Seas link labeled “Rules” on the English resource page returned a French PDF; the record does not pretend an English source was inspected. PDF text extraction returned no text for several files, so absence of a keyword was never treated as absence of a rule.

`scripts/research-blue-orange.py` retrieves publisher-hosted PDFs with three workers, HTTPS/host/redirect checks, 25-second timeouts, a 35 MB limit per manual and a maximum 250-file batch. Its default matches the discovery inventory; `--all` has not been used. Machine-extracted leads stay in ignored `research/source-files/blue-orange/`. They are not approvals.

`research/blue-orange-batch.json` contains the manually written research inputs. `scripts/prepare-source-batch.py --intake research/source-files/blue-orange/intake.json --batch research/blue-orange-batch.json --publisher "Blue Orange"` creates missing drafts after checking source hashes, page ranges and overwrite safety. Existing drafts must be edited explicitly. Run `npm run content:validate` after any data operation; neither this script nor intake establishes human approval.

The collection is still incomplete: 117 rule records cover 103 of the 1,320 inventory identities, leaving 1,217 without researched answers. Thirteen additional researched games sit outside the inventory, and one game has two edition records. Continue primary-source research; missing content is agent implementation work, not solely a launch approval item.
