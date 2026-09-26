# Pending eight, part A — source review, 2026-09-26 UTC

Exactly three new research drafts. Each is unapproved, has null approval/publication fields, and has no portable random-pool enrollment. No shared code, identity overrides, count documents or source-leads document was edited by this pass.

## Drafts and source locators

| Draft | Accepted identity | Inspected edition | Main answer locator |
| --- | --- | --- | --- |
| `samurai-fantasy-flight-2015-en` | Q4994200 / BGG 3 | Fantasy Flight English, 2015 | Printed/PDF page 5, Playing the Game / Turn Sequence |
| `shogun-queen-2006-en` | Q2279754 / BGG 20551 | Queen English base game, 2006 | Printed/PDF page 9, Determine Turn Order / Carry Out Actions |
| `john-company-second-edition-wehrlegig-en` | Q122238495 / BGG 332686, P393=2 | Wehrlegig English Second Edition, Second Printing, 2023; without Crown | Printed/PDF page 13, II. Family / Family Action; first-turn context pages 10-11 |

Names use the accepted inventory display labels, with no broad same-title aliases. No matching research or public rule existed for these three identities before drafting.

### Samurai

- Primary URL: [Fantasy Flight rulebook](https://images-cdn.fantasyflightgames.com/filer_public/58/58/5858c0b8-3ceb-49ab-880e-565e9c4eaadc/kn26_rulebook.pdf).
- Complete relevant rendered pages inspected: 4 (setup steps 1-9 and Basic Setup), 5 (turn sequence), 8 (designer and 2015 imprint). Page 5 is first in source references.
- Preserved distinctions: youngest begins regular turns clockwise; standard city/village placement is setup; optional random Basic Setup changes hands and placement.
- Hold: the source supplies no equal-age tie-break. Other printings require review.
- Ignored cached PDF: `research/source-files/pending-eight-discovery/samurai-ffg-2015.pdf`; 8 pages, 16,474,342 bytes.
- SHA-256: `021578b5b57f06b83752f6c5a01403dc1f9b69db69815beb9445d205c7a3b005`.

### Shogun

- Primary URL: [Queen base-game English rules](https://rules.queen-games.com/shogun_en.pdf).
- Complete relevant rendered pages inspected: 4-9 (province setup, round sequence, special-card positions, simultaneous planning, bidding, bid ties and action order), 12 (2006 imprint), 13 (unnumbered Predetermined Starting Setup supplement). Page 9 is first in source references.
- Preserved distinctions: oldest starts province claiming; bidding controls who chooses a special card first; selected positions control regular action order. Shuffled Daimyo cards resolve equal bids. The beginner predetermined setup skips province claiming and applies to the sun side.
- Hold: equal-age setup ties and claim direction are unspecified. Big Box expansions were not used.
- Ignored cached PDF: `research/source-files/pending-eight-discovery/shogun-base.pdf`; 14 pages, 841,801 bytes.
- SHA-256: `3fd95cff5cdd33207eed65432746104575a8854bbf5a2292b8f4de6787a50631`.

### John Company: Second Edition

- Provenance: [Wehrlegig resources](https://wehrlegig.com/pages/resources), John Company Second Edition rules link. Reopened the publisher page and followed its exact [Dropbox manual](https://www.dropbox.com/scl/fi/v1p712l0dkgiqa0jx0vr8/John-Company-Rules.pdf?dl=0&rlkey=xtek9x06fla1cb5d8b8ov3q7b). Download used the same link with `dl=1`.
- Complete relevant rendered pages inspected: 1-2 (edition title and Crown Handbook scope), 4-5 (scenario/office setup and Draft Variant), 10-11 (phase sequence and first-turn exception), 13 (Chairman begins Family action), 43-44 (Crown setup and Player Button context), 48 (Second Printing 2023 imprint). Page 13 is first in source references.
- Preserved distinctions: first turn skips London Season; Chairman begins the first Family action clockwise; scenario setup and optional setup-card drafting allocate offices; later phases have their own procedures.
- Hold: solo/two-player Crown answers need the separate handbook review. No first-edition rule transfer. `tieBreakApplicable:false` reflects an assigned role for this scoped opening step.
- Ignored cached PDF: `research/source-files/pending-eight-discovery/john-company-second.pdf`; 48 pages, 64,606,888 bytes.
- SHA-256: `29fdc157234951b517190c82298ea578a543d25f183224e9fa86c1ca8c470dd0`.

## Evidence integrity and lifecycle

All three official sources were freshly fetched on 2026-09-26 and matched their cached PDF hashes byte for byte. PDF context was read using extracted text and complete Poppler page renders, following the PDF skill. Relevant image files remain under the ignored source-files directory. The FFG PDF was too large for the web extractor; direct official HTTPS retrieval succeeded. No BGG page, API or bulk data was fetched.

Checks passed: `npm run content:validate` and `npm run content:review`. An independent read-only check confirmed unique IDs/slugs, draft status, null approval/publication fields, exact source hashes and valid PDF page bounds. The runtime coverage resolver maps each draft exactly once to its intended identity: Samurai 3, Shogun 20551 and John Company Second Edition 332686. No override was needed.

Exact content revisions for root editorial review:

| Draft | Content revision |
| --- | --- |
| `samurai-fantasy-flight-2015-en` | `08c423ce7f1721839c8a5e6d34fa776d6d1158794d38160dc90302391689329c` |
| `shogun-queen-2006-en` | `14d33d1b1ec2e042924acfe15322968273e3fb2f3f6398bcc38f492f58225196` |
| `john-company-second-edition-wehrlegig-en` | `67385d691c1e0caaae75450f9f651f88e9476d70da0599e944a491b9a23e29a1` |

Root owns any editorial approval, public projection and release gates. Crown modes, unspecified demographic ties and other printing/expansion transfers remain outside these drafts.
