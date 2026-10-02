# Queued Pinterest rule-copy accuracy repair

Prepared October 1, 2026 (America/Los_Angeles). This repair concerns six future campaigns, not a new publishing batch. Deployment and live verification are handled by the normal release procedure; this preparation does not prove a Pin was published or acquired a visitor.

## Factual mismatch

The generated game-campaign description previously appended a fair picker recommendation for ties, and every art card used “Full rule + fair picker.” Six approved rules explicitly exclude a picker or first-player tie-break because play is simultaneous. Their landing pages already omit that recommendation.

[Gamewright's official Sushi Go! rulebook](https://gamewright.com/pdfs/Rules/SushiGoTM-RULES.pdf), Playing a Round on PDF page 2, confirms simultaneous card selection and reveal. Its later scoring tie rules concern points and the winner, not choosing a starting player. The [live edition-labelled answer](https://whogoesfirst.fun/games/sushi-go-2014-en/) preserves that distinction.

## Scope

`src/lib/pinterest-pins.ts` now checks the approved `pickerSuggestionApplicable` and `tieBreakApplicable` fields. Ineligible campaigns keep their rule answer, edition and source wording, omit the picker-for-ties suffix, and use “Full rule + source” in their rendered artwork. Eligible campaigns retain their previous copy.

| Queued campaign | Original release date |
| --- | --- |
| `game-sushi-go-2014-en` | 2026-10-04 |
| `game-7-wonders-2020-en` | 2026-10-05 |
| `game-spot-it-blue-orange-original-en` | 2026-10-06 |
| `game-sushi-go-party-gamewright-en` | 2026-10-10 |
| `game-spirit-island-gtg-en` | 2026-10-13 |
| `game-6-nimmt-amigo-2024-en` | 2026-10-13 |

No campaign IDs, GUIDs, release dates, destinations, attribution labels or approved rule records change. The existing renderer receives the corrected CTA; no new visual system or distribution schedule is introduced. Existing published entries stay unchanged.

## Verification

The focused unit check covers the actual queued campaigns against their approved eligibility fields and preserves the five already-released October 1 identities and copy. The accuracy, campaign-consent and Google-tags unit files passed together (14 tests); focused lint and whitespace checks passed.

The before/after comparison confirmed 114 entries with identical IDs, dates, destinations and campaign labels. Only the six future descriptions and artwork CTAs changed; the other 108 entries remained identical. The ignored comparison receipt is `artifacts/pinterest-accuracy/queue-comparison.json`.

Rendered `artifacts/pinterest-accuracy/sushi-go-after.png` through the existing portrait renderer and visually checked the 1000 × 1500 result. The simultaneous-play answer and “Full rule + source” CTA fit and remain readable without clipping or overlap. The source answer, title, palette, layout and illustrations stay unchanged. The local before image is available beside it for comparison.

The complete local verification passed: Astro diagnostics, lint, 267 unit tests, production build, and the 1,550-page / 45,550-link artifact audit. Deployment verification will compare the exact release marker and all six public artwork files against the verified build. No new Pin was sent or published during preparation, and no traffic lift is claimed from corrected wording alone.
