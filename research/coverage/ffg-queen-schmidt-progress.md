# Fantasy Flight Games, Queen Games and Schmidt Spiele source review

Reviewed 2026-09-23 UTC. Fifteen new drafts: four Fantasy Flight Games, six Queen Games and five Schmidt Spiele. Total: 236 researched records, 218 of 1,320 inventory identities covered, 1,102 pending, zero human publication approvals. The complete-compendium objective remains unfinished.

## Evidence

- `research/ffg-source-queue.json`: four manuals linked by the publisher's public document archive. Direct archive fetching was blocked, but the web tool exposed the publisher's links and all four PDFs were retrieved successfully.
- `research/queen-source-queue.json`: six English manuals from the publisher's `rules.queen-games.com` index. Its 738 distinct PDF links include translations, supplements and editions; these are not 738 researched games. Candidate name matching was reviewed manually to reject false matches such as Farmageddon/Armageddon and Castell/Castelli.
- `research/schmidt-source-queue.json`: five manuals from the publisher's instructions catalog. Spaces and the registered-sign character in the DOG Kids path are percent-encoded from the observed UTF-8 URL. An initial incorrectly decoded path returned 404; the corrected publisher URL returned the PDF. All five PDFs were retrieved.
- Each cached intake includes a source hash, exact URL and page count. Relevant pages were rendered and opened under the ignored `research/source-files/queen-schmidt-rendered/` directory before creating the drafts.
- Manually written inputs are `research/ffg-batch.json`, `research/queen-batch.json` and `research/schmidt-batch.json`. All generated records have `status: draft` and null approval/publication fields.

## Details preserved

| Game | Starting instruction and scope |
|---|---|
| Black Gold | Latest car refueling; official random alternative if players cannot recall or do not want the criterion. Market-price die identifies the round starter. |
| Black Sheep | Loudest moo. This is Knizia's plastic-animal game. Scoring tie-breaks do not resolve starting ties. |
| Blue Moon City | The Fantasy Flight English rules simply ask the group to select a starter. No colorful criterion or random requirement is invented. |
| Journey to Mordor | Most recent reader of The Lord of the Rings. No film-watching substitution or never-read fallback is stated. |
| Chef Alfredo | Most recently helped cook a meal. |
| Kobold | Latest kobold sighting; youngest if the group cannot agree. |
| Push a Monster | Latest monster sighting; youngest if the group cannot agree. |
| Speculation | Most recent stock-share purchase; first action uses a Trade tile. This is Dirk Henn's Queen edition. |
| Super-Vampire | Latest vampire meeting, youngest if nobody met a real vampire. This assigns the first Super-Vampire role. |
| Vienna | City Collection 5, by Stefan Feld. The most recent Vienna visitor receives the crest; the source also mentions being closer to Vienna without elaborating. Cards are assigned simultaneously before the first action turn. The advanced setup retains the initial instruction. |
| Auf Achse | Farthest distance driven this month. English summary of the German article 49090 manual. |
| DOG Kids | Loudest bark. German article 40554, three dogs per player and 88 cards; separate travel edition not substituted. |
| Tempel des Schreckens | Latest gold-treasure finder. The source's immediate-loss sentence if nobody qualifies and its youngest-player alternative are both preserved. |
| The Quacks of Quedlinburg | Most recent cook holds/reads the fortune-teller deck. Potion brewing remains simultaneous. English summary of the German base-game manual. |
| Quacks & Co.: Quedlinburg Dash | Latest donkey sighting. The children's animal race has its own entry, distinct from potion brewing. |

The Vienna identity override maps this record only to BGG 368974. The older Schmidt dice-placement game, BGG 171492, remains pending. Text extraction duplicated material across facing pages of the Queen PDF: the actual starting instruction is visibly on page 5, and action order on page 7. The answer's page references follow those rendered pages.

## Remaining leads

Queen's unmatched English filenames and all catalog links remain in the ignored publisher cache for further alias research. Schmidt's catalog has many German titles that may require verified alias matching; substring hits such as Labyrinth / Das magische Labyrinth and Hens / Wissenssachen were rejected. The older Vienna was not in the current Schmidt catalog. A third-party manual mirror was found but has not been represented as publisher-hosted verification.

NSV's accessible instructions index exposes per-game pages but gave no exact remaining identity matches in the first pass. dV Giochi's public category pages remain useful discovery leads. Previously queued IELLO downloads and the still-pending inventory remain implementation work.

The owner's request to keep picker visuals visible with the result remains queued after compendium completion. No picker presentation code changed in this batch.
