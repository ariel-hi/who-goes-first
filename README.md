# Who Goes First?

Pick a starting player for game night, find your board game's starting rule, or try an original question for the table. Free to use in your browser, with no account or app installation.

**[Open the first-player picker →](https://whogoesfirst.fun/)**

## For your next game night

| What you need | Open |
| --- | --- |
| A random starting player | [First-player picker](https://whogoesfirst.fun/) — use 2–50 numbered seats or names; every entry gets the same chance. |
| Your game's starting instruction | [Sourced game rules](https://whogoesfirst.fun/games/) — search by game and edition, with rulebook citations. |
| A playful question for the table | [Original house-rule questions](https://whogoesfirst.fun/house-rules/) — skip any prompt and use a random tie-break when needed. |
| A shortcut for club or café tables | [Printable QR table cards](https://whogoesfirst.fun/printable-game-night/) — download a one-page PDF with two cards. |
| Help choosing a method | [Three ways to choose who goes first](https://whogoesfirst.fun/choose-who-goes-first/) — a game's own rule, an equal-chance pick, or a house question. |

The rule directory is growing. Answers identify the reviewed edition, cite their sources, and distinguish official instructions from interpretation or a house fallback. A game appearing in the wider board-game index does not mean its rule has been reviewed yet.

Sharing copies a clean link without your player list or pick. Analytics is optional; you can use the site and download the cards without allowing it. See [Privacy](https://whogoesfirst.fun/privacy/) and [How the picker works](https://whogoesfirst.fun/fairness/).

## Development and content coverage

An Astro + strict TypeScript site, with one React picker island and static editorial pages. This checkout lists 5,006 discovered game identities; the [public site](https://whogoesfirst.fun/) may be on an earlier release. The full starting-rule compendium is still in progress: 947 identities have researched editions and 4,059 await primary rule research. The owner has authorized Codex to review sources and approve exact content revisions; this checkout has 957 approved edition records, with 370 standalone criteria in the random mix and 60 house prompts. The initial public release had 762 rules and 339 random-mix criteria. See [the growth integration checkpoint](research/coverage/growth-merge-sep26.md) for the combined branch scope and `CONTENT_REVIEW.md` for the current review process, [the latest Amigo and Quick-result checkpoint](research/coverage/sep26-amigo-and-quick-progress.md) and [the preceding picker continuity checkpoint](research/coverage/sep26-picker-result-continuity-progress.md) for source limits.

## Run

From this project in PowerShell:

```powershell
cd C:\Users\hirsc\Downloads\Antigravity\first
npm ci
npm run dev
```

Open http://127.0.0.1:4321/. Local Game rules navigation opens the searchable draft directory at `/dev/games/`; the 60 published original questions are at `/house-rules/` and `/dev/house-rules/`. Source evidence and revision hashes are at `/dev/review/`. `/dev/coverage/` tracks all 5,006 discovered game identities and explicitly distinguishes missing rules from researched editions. Method pages are `/methods/balloon/`, `/methods/spinner/`, `/methods/cards/`, `/methods/towers/`, `/methods/straws/`, `/methods/dice/`, `/methods/coin/`, and `/methods/shells/`.

Use Node 22.23.2 or a later Node 22 maintenance release. A project-local Node 22 dev dependency supplies the compatible runtime for npm scripts on this machine (the system runtime was 22.16.0). TypeScript 6 is pinned to the compatible major supported by the current Astro checker. npm and `package-lock.json` are authoritative.

## What works

- Four default seats, names edited directly on each piece, optional pasted lists, Unicode, stable duplicate identifiers, explicit validation, and 2–50 participants; most visual modes support 2–12, while Dice Roll and Coin Flip support up to 24. The roster grows with the page and preserves names when its size changes.
- Unbiased secure randomness; immutable outcomes; Instant, Quick, Spinner, Card Draw, Balloon Rise, Towers, Shortest Match, Dice Roll, Coin Flip, and Shell Game; skip and interruption handling; muted-by-default optional synthesized sound. Decorative methods load on use.
- Finished scenes stay visible through next-method preferences and unchanged list disclosures, until another pick or an actual player edit. The editable roster stays visible during every method. Towers share the same starting motion and leave visible fallen blocks; popped balloons leave scraps. Method pages share the home picker's heading and preselect their method.
- Player colors follow their IDs across all methods. Each draw gets fresh balloon timings, overlapping card flips, and varied spinner and coin turns. Shortest Match uses wooden matches with colored heads; its existing `/methods/straws/` URL and saved preference remain compatible.
- Optional local group memory, forget/reset, reduced motion, keyboard controls, and clean sharing with manual fallback. Restored roster and count become editable together, preserving immediate count edits. Keyboard draws retain the same action button through the reveal; completion preserves a user's Tab destination.
- Alphabetical static game index, local alias/prefix/typo search, random game-rule draw with skip, edition pages, answer-first source template, and revision-bound editorial approval validation.
- The public directory finds accepted native identities by their validated alternate titles, including Cyrillic and Japanese names. These search terms do not transfer edition rules.
- Home lookup, public directory and rules searches survive reload, Back and bookmarks. An unchanged cached home lookup preserves its focused result link. Long alphabet shelves have native pagination above and below the list; Privacy has a direct return to the picker.
- Sixty published original house-rule questions, drawn without repeats until the pool is exhausted, with skip and an explicit random tie-break. The six original research drafts remain in the local review archive.
- About, Fairness, Privacy, true 404, canonical/social metadata, sitemap/robots controls, CSP headers, optional GA4 page views, CI and operational docs.

Public builds contain no unapproved editorial content. All 957 researched rule records in this checkout have completed editorial approval, alongside 60 published original house questions. The board game directory lists all 5,006 accepted discovery identities and links each game to its sourced editions when available. The random mix contains 370 individually reviewed portable criteria in this checkout; cooperative role assignments, simultaneous play, component-dependent setup and random-only instructions remain outside it. Distinct Spin Circus, Valley of the Kings, Ticket to Ride: Europe and Incan Gold editions retain their different starting instructions.

The discovery inventory contains identities, not imported rules: 947 of its 5,006 identities have a researched edition in this checkout; 4,059 remain. All 957 approved rule records link to an inventory identity, including the [18 popular-game additions](research/coverage/popular-thirty-progress.md). Spin Circus, Valley of the Kings, Ticket to Ride: Europe and Incan Gold each have two edition records. Perseverance: Castaway Chronicles – Episodes 1 & 2 has two separately researched episode answers under one inventory identity. The Ancient World and Rebirth have separate answers for their distinct editions or maps. Explicit identity overrides keep unrelated games such as the Gamewright and Allplay games named Chomp and Big Top separate in coverage counts, and distinguish the two unrelated games named Vienna. Completing source research remains implementation work; the inventory does not satisfy the request for a full compendium. Edition-specific entries distinguish card-assigned or simultaneous starts from rules that call for a random player. Static builds from this checkout contain the 957 reviewed catalog entries. Preview builds remain non-indexable.

## Checks

Ten further records use official Dized references: Big Monster, Blood Rage, Champions of Midgard, Coup, Flamme Rouge, New York Slice, Schrödinger's Cats, The Grimm Forest, Volcano (Fiesta Caldera), and boop. Six enter the random mix. Setup roles, simultaneous starts and the Volcano variant remain explicit. A Balloon Pop title match was rejected because it identified a different game. See `research/coverage/dized-followup-progress.md`.

```powershell
npm run check
npm run lint
npm test
npm run content:validate
npm run content:coverage
npm run build
npx playwright install chromium firefox webkit
npm run test:browser
npm run test:release
npm run test:dev-release
npm run screenshots:dev
npm run screenshots:methods
npm run audit:lighthouse
npm run links:check
```

`npm run verify` runs type checking, lint, unit tests, content validation, build, and artifact audits. Build before running browser tests. The browser suite starts its own static server on port 53222 and development server on port 53221. Set `STATIC_PORT` and `DEV_PORT` to different free ports to override these defaults; all browser tests use the same settings. The release test copies the site to an isolated ignored directory; synthetic approval fixtures never enter `src/content/` in this project. With `npm run dev` running, `npm run test:dev-release` verifies a fresh development browser can pick before and after the complete release matrix. Astro and Vite caches are project-local and separated by command, so release fixtures cannot invalidate the running preview's dependency URLs.

To inspect the static output manually: `npm run test:serve`. `npm run preview` is Astro’s ordinary static preview and does not simulate Cloudflare headers. With the dev and static servers running, `npm run screenshots` captures deterministic states in `artifacts/screenshots/` and renders the original social SVG to PNG.

The build also parses every generated HTML page to check metadata, canonical URLs, structured data, internal links, and sitemap coverage. `npm run audit:lighthouse` measures the fresh isolated production fixture from `test:release`; it writes local lab reports under `artifacts/lighthouse/` and does not contact a deployed site.

See `DESIGN_AND_SEO.md` for the visual direction and search implementation, `VERIFICATION.md` for actual results and limits, `CONTENT_REVIEW.md` for the approval process, and `RUNBOOK.md` / `LAUNCH_CHECKLIST.md` for launch and rollback. Deploy only `dist/`, never this repository or the artifacts directory.


Art Decko and Art Robbery add two researched identities; For Sale, Schotten Totten and Time Bomb Evolution finish review. This adds five approved catalog entries and four portable criteria. See `research/coverage/art-mini-progress.md` for sources and the publication-audit correction.

Age of Dirt adds another researched identity; nine existing Czech Games Edition drafts finish review. These ten approvals add four portable criteria, with setup roles and phase priority kept explicit. See `research/coverage/cge-wizkids-progress.md`.

Hardback, both Burgle Bros. games, Clank! and Isle of Trains add five researched identities and five approved entries; four qualify for the random mix. See `research/coverage/skellig-direwolf-trains-progress.md`.

Five existing R&R Games drafts also complete review, with four portable criteria. See `research/coverage/rnr-review-progress.md`.

The latest pass adds Cat Café, Tinderblox, Dice Hospital, Chocolate Factory and The Ancient World second edition, plus approvals for six existing Board&Dice and Ludonova drafts. Seven more criteria qualify for the random mix. The original Ancient World remains pending, and Ceylon's variant setup order has been corrected. See `research/coverage/alley-red-raven-board-dice-ludonova-progress.md`.

Pergola, Pyramido, Pyramido: Forgotten Treasures, Spring Meadow and Wondrous Creatures add five more sourced inventory games, with four portable criteria. See `research/coverage/rebel-synapses-bad-comet-progress.md`.

Marco Polo II, Oh My Goods!, Praga Caput Regni, Silver & Gold, Overboss, Space Explorers, Tucano and Stockpile add eight more sourced inventory games. Four criteria join the random mix; the others preserve their starting role, simultaneous play, thematic suggestion or financial question. See `research/coverage/mixed-publisher-sept24-progress.md`.

Rebirth adds separate Scotland and Ireland answers; The Fuzzies and Doodle Dungeon add two more sourced identities. Two Rebirth criteria enter the random mix. See `research/coverage/rebirth-fuzzies-doodle-progress.md`.

Zoo Vadis, Trogdor!!, Wilmot’s Warehouse, Wonderland’s War and the original Yedo add five more sourced identities. Zoo Vadis and Wonderland’s War provide two portable criteria. See `research/coverage/zoo-trogdor-wilmot-wonderland-yedo-progress.md`.

Regicide, On Tour, Rock Hard: 1977 and Split Stone Games’ Mycelia add four more sourced identities. Rock Hard and Mycelia contribute portable criteria. See `research/coverage/regicide-on-tour-rock-mycelia-progress.md`.

Paperback, Petrichor, Herbaceous, Foothills, Rumble Nation and Megaland add six more sourced identities and six portable criteria. See `research/coverage/paperback-petrichor-herbaceous-foothills-rumble-megaland-progress.md`.

Kenny G: Keepin' It Saxy Game, Mapmaker: The Gerrymandering Game, Monster Crunch! The Breakfast Battle Game, Roll for Adventure, Victorian Masterminds and Villages of Valeria add six more sourced identities and six portable criteria. See `research/coverage/kenny-mapmaker-monster-roll-victorian-villages-progress.md`.

Bob Ross: Art of Chill Game, Bob Ross: Happy Little Accidents, The Brigade, Firenze, Inuit: The Snow Folk, My Happy Farm, Trellis and Veggie Garden add eight more sourced identities. Seven contribute portable criteria; Happy Little Accidents assigns a host before everyone draws simultaneously. See `research/coverage/bob-brigade-firenze-inuit-farm-trellis-veggie-progress.md`.

Container: 10th Anniversary Jumbo Edition!, The King's Guild, Lisboa, SteamRollers, Super Motherload, That's Pretty Clever, and VivaJava Dice add seven more sourced identities. Five contribute portable criteria; the last two use a random selection or game-specific dice. See `research/coverage/container-kings-lisboa-steam-super-clever-vivajava-progress.md`.

