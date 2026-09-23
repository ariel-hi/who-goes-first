# Snowdale, Rietburg and Steve Jackson Games research — 2026-09-23

Six new individually checked records are approved under the owner's 2026-09-22 factual-review delegation. Totals are 417 researched records, 396 of 1,320 inventory identities covered, 924 pending, 165 approved catalog entries and 137 portable criteria. The full compendium is unfinished. No deployment occurred.

| Entry | Source scope and decision |
|---|---|
| Dale of Merchants | Original game, ©2021, English file 6.0. Earliest waking today; a previous loser starts consecutive games. Clockwise turns. Catalog only, preserving the prior-game branch. |
| Dawn of Peacemakers | ©2018 campaign file 1.1 short. Latest avoided conflict, or officially random. The public source is an eleven-page opening excerpt, not the full campaign or Skirmish rules. Later rounds pass the token rightward; turns within a round run clockwise. Included in the mix. |
| The Liberation of Rietburg | Thames & Kosmos ©2020, printed code 691746-02-181019. Most heroic player, without invented numerical ranking or character priority. Included in the mix. |
| Zombie Dice | Version 1.0, March 2010. Previous winner or expressive brains call. The final-score tie round is separate. Catalog only. |
| Dino Hunt Dice | Version 1.0, January 2013. Previous winner or best dinosaur sound; play passes left. Final-score tie rounds are separate. Catalog only. |
| The Stars are Right | Version 1.0, July 2009. The zodiac sentence explicitly explains its criterion as next birthday; clockwise turns. Included in the mix. |

The source queues are `research/snowdale-blueprints-rietburg-source-queue.json` and `research/sjgames-classics-source-queue.json`. Complete bytes of six publisher-hosted or publisher-linked files were cached with SHA-256 hashes. All 22 listed renders in their `render-plan.json` files were opened and inspected after reading the relevant text. Dawn's publisher FAQ/errata was also read and cached; its corrections do not alter the opening rule. `research/snowdale-rietburg-sjgames-reviewed-batch.json` records the individually authored answers and decisions. Original drafts remain in `research/games/`.

Blueprints is held: the `images.zmangames.com` download failed hostname verification, and the attempted newer CDN route was inaccessible to the web tool. No TLS check was disabled and no answer was invented. Arboretum's previously failed Squarespace source was not retried without a new route. The Kosmos index's Aquarium, Circus, Robin Hood and other superficial title matches were rejected as different products; only the exact Rietburg identity was added.

Actual checks: `npm run verify` passed (33 tests; 179 static pages and 2,261 internal links audited). The six new articles returned 200 from both local servers, with exact content and source links, no 320px overflow, zero axe violations and no reported runtime errors. The live directories contain 417 local/165 approved records and exactly 137 allowlisted choices. Draw/skip, Rietburg alias search and coverage search passed. Nine affected browser checks passed across Chromium, Firefox and WebKit in 1.4 minutes. All six source HEAD requests returned HTTP 200 with PDF content types at 11:47 UTC.

Reports: `artifacts/snowdale-rietburg-sjgames-live-check.json`, `artifacts/source-availability-snowdale-rietburg-sjgames.json`, and `artifacts/snowdale-rietburg-sjgames-browser/.last-run.json`. Five newly captured screenshots listed in the live report were opened and visually inspected. No UI code changed; the earlier retained-scene verification remains applicable.

Continue with the remaining inventory and the unapproved researched records. Original house-prompt publication remains a distinct owner action under the handoff; the local prompt experience is usable.
