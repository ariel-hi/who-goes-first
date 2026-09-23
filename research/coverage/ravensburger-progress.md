# Ravensburger source review — 2026-09-23

Eight new records bring the collection to 321 researched editions, covering 302 of the 1,320 discovery identities. Another 1,018 identities need primary-source research. The complete-compendium objective remains unfinished.

The owner's 2026-09-22 instruction in task **Reload localhost** delegates factual review to Codex and permits approval after that review. The actual user message was read; this is not an approval inferred from a downloaded document. Each of these eight records was reviewed against the rendered primary-source pages before its exact revision was approved. Original research copies remain in `research/games/`. The approved catalog now contains 69 entries and the separately reviewed random mix contains 66 portable criteria. No deployment occurred.

| Game | Source pages inspected | Scope retained |
|---|---|---|
| ALIEN: Fate of the Nostromo | Printed/PDF 2–3; credits also inspected | Dutch source despite an EN download label; latest cat hiss, with oldest-player fallback |
| Disney Hocus Pocus: The Game | Printed/PDF 2–3, 6 | Last candle lighting; oldest when in doubt; later rounds start left of the previous last player |
| Chronicles of Light: Darkness Falls – Disney Edition | Printed/PDF 3–5, 8 | Most recent Disney movie selects a Leader; there are no individual turns. Directory only, excluded from the random mix |
| Coco Crazy | PDF 1, 4; printed 4 | German monkey-face criterion; other language wording is not substituted |
| Labyrinth | Two unnumbered PDF pages | English board-game rules, copyright 2017; treasure-hunt criterion, not an age rule from another edition |
| Star Wars Villainous: Power of the Dark Side | Printed/PDF 3, 19; PDF 20 | Force joke or oldest as an unconditional alternative; starting Credits depend on order |
| The Quest for El Dorado | Printed/PDF 5–6, 12 | First seated at the table; two-player starting positions remain distinct; copyright 2023 |
| Horrified | PDF 1, 5, 15–16; printed 5, 15 | Italian Universal Monsters source, copyright 2021/IT01; garlic criterion and separate solo setup |

The manually written batch is `research/ravensburger-reviewed-batch.json`. Intake and PDF hashes are under ignored `research/source-files/ravensburger/`. `artifacts/ravensburger-review/apply-review.ts` records the explicit reviewed selection and verifies source hashes before applying approval; it refuses overwrites. The random-mix addition is an explicit seven-record set, not automatic inclusion of every researched rule.

The Horrified PDF was found on the publisher's file host. A UK product page linked a different Horrified title, so that page is not used as provenance for this Italian manual. The ALIEN product page's language label likewise does not override the actual source language. The non-English summaries visibly identify the source languages.

Asara remains held. The English manual hosted by Rio Grande delegates initial setup to a separate crib sheet that is absent from the retrieved file. Its Caliph's-patronage instruction controls the next year, not initial selection. The German indexed manual also refers to a separate overview sheet. No first-player answer has been inferred.

During rendering, the C drive reached zero free space. Only regeneratable PNG copies from thirteen earlier `*-rendered` source-cache directories were removed after verifying their paths. Original PDFs, evidence hashes, all application code, content and website screenshots remain. The 260 removed files reclaimed 273,822,625 bytes; their paths and hashes are recorded in `artifacts/source-render-cache-cleanup.json`. PDF rendering then succeeded. Storage remains constrained.

Browser verification exposed cached development paths for newly approved records: the directory updated while `/games/[slug]/` returned 404. The existing draft route was already dynamic. Reviewed game routes now also read current approved records per request in local development; production still uses static generation. A regression test adds, revises and removes an explicitly synthetic approved fixture without restarting the server.
