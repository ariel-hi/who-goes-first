# Traditional games: starting-rule drafts

Three English editions researched on 2026-09-26. Intake drafts are retained as history; independently reviewed catalog copies are approved as recorded below. None enters the portable mix or transfers its rule to other variants.

| Draft | Primary source and exact passages | Supported opening |
| --- | --- | --- |
| `chess-fide-laws-2023-en` | [FIDE Laws effective 1 January 2023](https://handbook.fide.com/chapter/e012023), Introduction 0.1; Articles 1.1–1.3, 2.1–2.3, 6.5–6.7 | White moves first. The Laws do not select the person receiving White. |
| `backgammon-usbgf-basics-standard-en` | [USBGF Backgammon Basics](https://usbgf.org/backgammon-basics-how-to-play/), standard setup; Movement of the Checkers opening; Optional Rules / Automatic doubles; FAQs Who goes first?, automatic doubles and What is match play? | Each rolls one die; higher roll starts using both original numbers. Both reroll ties. Optional automatic doubles affect stakes and are excluded from match play. |
| `go-bga-tournament-rules-2009-en` | [BGA Tournament rules, 31/03/2009](https://www.britgo.org/files/rules/rulesofplayfull.pdf), printed/PDF pages 1–2; Audience and Purpose; §§1–4 | Black first in even games; White first after handicap placement. No color-selection procedure is supplied. |

## Evidence review

Read the complete relevant HTML passages for Chess and Backgammon, including setup and opening alternatives. HTML sources have section locators and no PDF page references.

The Go source is an eight-page PDF. Its cover and entire printed/PDF page 2 were rendered with Poppler and visually inspected. Page 2 gives the BGA document priority over referenced AGA rules when meanings conflict. Its handicap placement default preserves the stated “unless otherwise stated” alternative.

Ignored evidence copies and extracted text are in `research/source-files/traditional-games/`; the Go page renders are `go-bga-2009-1.png` and `go-bga-2009-2.png`. Each draft records its source SHA-256. These evidence copies are not public/deployment assets.

## Scope and review status

None of the three candidates is blocked. Chess and Go leave assignment of colors outside the cited answer. Backgammon uses an undated federation education page, with retrieval date and standard-game scope in the edition label. Go is specifically the inspected 31 March 2009 BGA ruleset, without a latest-rules claim.

The research drafts retain null approval/publication fields as intake history. Codex independently reopened FIDE and USBGF source passages, checked the Go PDF's extent and hash, and visually inspected its complete cover and opening page. After reviewing every public field, Codex approved three exact catalog revisions under the owner's 2026-09-22 factual-review authorization. The catalog copies use concise source/edition labels; Go's cited page order begins with the opening passage on page 2. No portable-mix entries or deployment were added.

| Approved catalog record | Reviewed revision SHA-256 |
| --- | --- |
| `chess-fide-laws-2023-en` | `38f37f17f6db4b04d36184cc1e23087188a6fc96b9038ab80a08ec565914b2dc` |
| `backgammon-usbgf-basics-standard-en` | `e71544f6d3cd17772bc22e6bd3c5d92bf1f33ad4c8c30b14ad5eba7066664f52` |
| `go-bga-tournament-rules-2009-en` | `8800e38ff754171d50216d0e123f222e84e166e7c9dec4606d0e5566138a2966` |

Chess and Go explicitly set `tieBreakApplicable: false`: their fixed starting roles have no player-selection tie. Backgammon retains its actual tied-opening-dice reroll rule.

## Validation

`npm run content:validate` passed with 861 approved game rules and 864 rule drafts. A separate local reference check passed: three unique IDs/slugs, draft status, null approval/publication fields, all three cached-source hashes, eight Go PDF pages, valid page 1–2 references and the two fixed-role flags. No record was approved in this research task.
