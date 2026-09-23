# Looney Labs and Pegasus research — 2026-09-23 UTC

This pass adds 24 researched drafts, reaching 280 records and 262 of the 1,320 discovery identities. Another 1,058 identities still need research. No publication approvals were created.

## Looney Labs: seven answers

The publisher's game index yielded seven exact pending title matches. Each product's rules page linked its primary PDF. All seven opening passages were inspected on rendered pages before creating the drafts in `looney-batch.json`.

- Chrononauts: closest guess of the current time; solo mode kept separate.
- Star Trek Chrono-Trek: uniquely highest character difficulty pips; otherwise most recent Star Trek episode viewer.
- Homeworlds: less experienced player, with an official coin flip for evenly matched skills.
- Aquarius: longest hair in the identified 100-card v3.0 edition.
- Just Desserts: latest person to serve dessert to the group, not the latest eater.
- Nanofictionary: shortest name for the initial brainstorming turn; later storytelling uses Number-card order.
- Back to the Future: The Card Game: latest movie viewer, with the official total-viewings tie-break.

The first Just Desserts and Nanofictionary responses were incomplete and could not be parsed or rendered. Complete replacement downloads succeeded. The source cache now reads until EOF within its byte limit, requests identity encoding, and rejects a Content-Length mismatch before saving a file. Four offline Python regression checks cover partial reads, absent lengths, incomplete responses and oversized files. Original failed intake evidence remains in the ignored source cache; `looney-reviewed-intake.json` selects the complete replacements.

## Pegasus: seventeen answers

The shop's normal pagination URLs returned identical first-page HTML. Its publicly exposed listing endpoint returned the actual pages: 24 pages, 576 distinct product links and 18 exact pending inventory matches. Seventeen products supplied usable rulebooks; Munchkins & Mazes had no linked PDF and remains pending. This scan covers that current catalog, not every historical Pegasus game or translated title.

`pegasus-source-queue.json` records the observed CDN URLs. `pegasus-batch.json` holds the manually written summaries. All seventeen opening passages and cited mode context were rendered and inspected.

- The Vale of Eternity: latest reptile sighting.
- Sagrada: latest Barcelona visit in the German file; reverse-order second pass and solo play preserved.
- Takenoko: head highest above the ground; every player's first turn skips weather.
- Raccoon Robbers: biggest raccoon belly, with no invented measurement.
- First Rat: latest cheese eater; human starts the solo game against Greg.
- Carnegie: most daring; counterclockwise setup choices distinguished from the first Timeline choice, including solo context.
- KuZOOkA: latest zoo visitor receives the Megaphone and first communication turn.
- Port Royal: latest harbor visitor, original 120-card English edition.
- Memo Mission: latest fairy-tale reader. Source-link review caught an import filter selecting the German file instead of the available English file; the draft now uses the inspected English manual. The publisher labels were correct.
- Snack Happens: latest fridge raid.
- Hopp hopp Häschen: longest ears, English booklet.
- Schotten Totten: latest visit to Scotland or nearby; alternating starts in its multi-round variant.
- Tower Up: highest residential floor.
- Revive: quantum randomness with an explicit official alternative; no claim that the site uses quantum hardware.
- Everdell: the German genügsamste criterion, translated as most easily contented. Printed page 5 is PDF page 6.
- Cat in the Box: latest black-cat encounter; initial trick, later rounds and two-player context distinguished.
- Symbiose: latest frog sighting; simultaneous setup reveal distinguished from turns; duel/team modes keep the criterion.

Pegasus is the source host/publisher or distributor, as applicable; editions are identified in each record. The queue and cached links provide discovery provenance, not permission to publish. German sources remain visibly labeled as English summaries.

## Continuing work

Continue with pending catalog aliases, archived products and other publishers. Munchkins & Mazes requires another primary source. These catalogs do not resolve the previously held Terra criterion. The owner's request to retain finished picker visuals remains queued after compendium work.
