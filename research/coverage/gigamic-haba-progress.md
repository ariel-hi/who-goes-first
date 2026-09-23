# Gigamic, publishing partners and HABA — 2026-09-23 UTC

Seventeen source-reviewed drafts were added: five Gigamic, three Sorry We Are French, one Funnyfox and eight HABA. The local total is 221 researched records, covering 203 of 1,320 discovery identities; 1,117 remain pending. There are still zero human approvals. The complete-compendium objective is unfinished.

Gigamic's five-page English all-games catalog, plus its family, party, strategy and modern-classics categories, produced 101 distinct product links and ten exact pending inventory matches. Product pages provided explicit manual download links. IKI's English file was linked by the Sorry We Are French product page. Quetzal's English manual was found on Gigamic's official companion site. Sources and local SHA-256 hashes are recorded in `research/source-files/gigamic/intake.json`; explicit retrieval URLs are preserved in `research/gigamic-source-queue.json`.

HABA's public instructions hub and both pages of HABA USA's games collection were inspected. English instructions were downloaded from the Shopify CDN links on HABA USA's own product pages. The initial HABA hub downloads were retained for review, but the eight new records use the publisher-linked English files. See `research/haba-source-queue.json` and the ignored `research/source-files/haba/intake.json`.

All starting passages were rendered with PDFium and visually inspected before drafts were prepared. Quetzal has an image-only PDF, and IKI has a garbled text layer; neither answer was inferred from automatic text extraction. The Gigamic download for Hiroba is French, despite being linked from an English product page: its record is explicitly an English summary of the 2022 French Funnyfox edition.

Material details retained:

- Akropolis: the most recent hill climber receives the Chief Architect marker. The separately cited official solo supplement explicitly makes the human first player.
- IKI: the recent Japan visitor starts with three or four players, with random selection if nobody has visited. Two players randomly receive Sun/Moon tokens and Sun starts. This is the first choice of Ikizama position; chosen positions determine subsequent action order.
- Quetzal: the recent island explorer receives the marker; meeple rolling precedes placement. In two-player games the Automaton's meeples are placed before the human placement turns.
- In the Footsteps of Darwin: recent ship travel determines the starter. If nobody has traveled by ship, choosing a preferred method is an official fallback.
- Animal Upon Animal: the English file specifies 29 animals and two to four players, with a flamingo-balance criterion and youngest-player fallback. The HABA hub's `4911` file instead describes **Small and Yet Great!**, a 13-animal two-player game with a bear-roar criterion. That different game is not used to satisfy the base game's inventory identity.
- Animal Upon Animal: Christmas Edition uses ownership of the warmest winter hat. Rhino Hero uses a recent good deed with youngest-player fallback; Super Battle uses the best climber. These are separate identities and answers.
- First Orchard's youngest-child fallback is official. Honga's fire marker stays with its initial holder. Unicorn Glitterluck: Cloud Crystals, Dancing Eggs, Looot, Ganymede, Verso and The Hanging Gardens each retain their actual publisher criterion.

Held or unresolved leads:

- Hellapagos's English product-page PDF link returned HTTP 404. Its export product sheet and companion overview do not establish an initial-player answer. No draft was fabricated.
- HABA USA's On the Hunt for Dinos product page had no PDF link. The junior Animal Upon Animal and Rhino Hero XXL products were not silently merged into their base-game inventory identities.
- The Hanging Gardens solo supplement was read, but does not explicitly allocate the initial marker in its setup changes. The record is labeled multiplayer; no unsupported initial Automaton instruction was added.
- Ravensburger and Z-Man catalog requests returned HTTP 403. Public search surfaced publisher-hosted PDF leads, but none was counted as reviewed in this batch.
- Previously pending IELLO downloads remain unresolved; their failures do not block research on other publishers.

The new drafts automatically appear in `/dev/games/`, random-rule selection and `/dev/review/`. Their evidence, internal review notes, discovery inventory and cached manuals remain excluded from static public artifacts. No factual publication, external account change or public deployment occurred. Keeping the finished picker presentation visible remains queued after compendium completion.
