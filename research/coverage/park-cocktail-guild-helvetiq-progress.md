# Deep Print, Cocktail Games, Helvetiq and Horrible Guild — 2026-09-23

Ten source-checked entries bring the local collection to **331 researched edition records**, matching **312 of 1,320 inventory identities**, with **1,008 still pending**. All ten completed editorial review under the owner's standing authorization of 2026-09-22. The catalog has **79 approved entries** and the separate random mix has **73 portable criteria**. Research drafts are retained as evidence. The full compendium remains unfinished; nothing was deployed.

| Game | Rendered source pages used | Review decision |
|---|---|---|
| Renature | PDF/printed 3, 4, 8 | Most recent nature walk; clockwise; initial points preserved. US English manual, copyright 2020. Included in mix |
| Corrosion | PDF/printed 4, 6, 15, 16 | Group chooses; spotting rust is an example, not mandatory. Human begins solo. Directory only |
| Savannah Park | PDF/printed 4, 7, 8 | Most recent animal feeding chooses the first token; everyone moves simultaneously. Youngest-player text concerns children's scoring. Directory only |
| Caldera Park | PDF/printed 3–6, 12 | Latest real-life wild-animal sighting assigns the marmot; initial weather choice comes before its holder chooses the shared action. Solo uses a stack. Directory only |
| Trio | Both PDF sheets; printed panels 2, 3, 6, 7 | Latest avocado eating; clockwise. Same criterion for Simple/Spicy; team adjustments give no replacement. Included in mix |
| Chabyrinthe | PDF/printed 1, 3, 8 | Latest black-cat sighting; clockwise. English summary visibly identifies French source. Included in mix |
| Kawaii | PDF 1, unnumbered English sheet | Latest ice cream for first round; lowest score for later rounds. Capture rock-paper-scissors is not a starter tie-break. Included in mix |
| Kinoko | PDF 3, unnumbered English sheet | Latest mushroom picking; later round begins left of the previous round's caller. Included in mix |
| Potion Explosion | PDF/printed 4, 9 | Latest drink preparation, not consumption; clockwise play, reverse second potion draft. Included in mix |
| Dragon Castle | PDF/printed 3, 5, 18; single-player setup 16 also inspected | Latest dragon sighting excludes this game's own dragons. No real-life qualifier invented. CMON edition identified. Included in mix |

Each batch is manually written in `research/{publisher}-reviewed-batch.json`. The explicit review application is `artifacts/park-cocktail-guild-helvetiq-review/apply-review.ts`; it verifies cached SHA-256 values against each record's evidence, refuses overwrites and separately lists the seven eligible criteria. No blanket approval or automatic random-pool import was used.

Primary source queues and intake files record product-page context and download URLs. Horrible Guild's English rulebook links lead to Dropbox; the original viewer URL remains the citation and `dl=1` is used for retrieval. Potion Explosion exceeded the initial 25 MB retrieval cap. A subsequent complete download under a 60 MB cap succeeded and was parsed, hashed and visually inspected. A successful PDF retrieval is separate from approval.

Trio's English PDF was found on the publisher's host; its current product page does not directly link that English file. No direct-link provenance claim is made. Upload-directory dates and production timestamps were not used as publication dates. Page numbers distinguish physical folding panels from PDF sheets.

All ten cited URLs returned HTTP 200 in the source-link check. The eight direct PDF links returned PDF content types; the two Dropbox citations returned document-viewer HTML. Their actual PDF files were retrieved separately through the publisher-linked download URLs. See `artifacts/source-availability-park-cocktail-guild-helvetiq.json`.

Further unreviewed leads remain: 2F's public German rules catalog includes Fearsome Floors and a Fresh Fish manual, but Fresh Fish requires an edition/identity check before counting against the older inventory entry. Ludonaute's public file depot is another primary-source lead. Neither discovery nor a downloaded-but-unread file counts as a completed rule.
