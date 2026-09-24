# Who Goes First?

An Astro + strict TypeScript site, with one React picker island and static editorial pages. The board game directory lists all 1,320 identities in the collected index. The full starting-rule compendium is still in progress. No public deployment has been made. The owner has authorized Codex to review sources and approve exact content revisions; 516 game rules have completed that pass, with 180 standalone criteria in the random mix. See `CONTENT_REVIEW.md` for the current review process.

## Run

From this project in PowerShell:

```powershell
cd C:\Users\hirsc\Downloads\Antigravity\first
npm ci
npm run dev
```

Open http://127.0.0.1:4321/. Local Game rules navigation opens the searchable draft directory at `/dev/games/`; the 60 published original questions are at `/house-rules/` and `/dev/house-rules/`. Source evidence and revision hashes are at `/dev/review/`. `/dev/coverage/` tracks all 1,320 discovered game identities and explicitly distinguishes missing rules from researched editions. Method pages are `/methods/balloon/`, `/methods/spinner/`, `/methods/cards/`, `/methods/towers/`, `/methods/straws/`, `/methods/dice/`, `/methods/coin/`, and `/methods/shells/`.

Use Node 22.23.2 or a later Node 22 maintenance release. A project-local Node 22 dev dependency supplies the compatible runtime for npm scripts on this machine (the system runtime was 22.16.0). TypeScript 6 is pinned to the compatible major supported by the current Astro checker. npm and `package-lock.json` are authoritative.

## What works

- Four default seats, names edited directly on each piece, optional pasted lists, Unicode, stable duplicate identifiers, explicit validation, and 2–50 participants; animated modes support 2–12. The roster grows with the page and preserves names when its size changes.
- Unbiased secure randomness; immutable outcomes; Instant, Quick, Spinner, Card Draw, Balloon Rise, Towers, Shortest Match, Dice Roll, Coin Flip, and Shell Game; skip and interruption handling; muted-by-default optional synthesized sound. Decorative methods load on use.
- Finished scenes stay visible until another pick, a player edit, or a method change. The editable roster stays visible during every method. Towers share the same starting motion and leave visible fallen blocks; popped balloons leave scraps. Method pages share the home picker's heading and preselect their method.
- Player colors follow their IDs across all methods. Each draw gets fresh balloon timings, overlapping card flips, and varied spinner and coin turns. Shortest Match uses wooden matches with colored heads; its existing `/methods/straws/` URL and saved preference remain compatible.
- Optional local group memory, forget/reset, reduced motion, keyboard controls, and clean sharing with manual fallback.
- Alphabetical static game index, local alias/prefix/typo search, random game-rule draw with skip, edition pages, answer-first source template, and revision-bound editorial approval validation.
- Sixty published original house-rule questions, drawn without repeats until the pool is exhausted, with skip and an explicit random tie-break. The six original research drafts remain in the local review archive.
- About, Fairness, Privacy, true 404, canonical/social metadata, sitemap/robots controls, CSP headers, disabled analytics interface, CI and operational docs.

Public builds contain no unapproved editorial content. All 516 researched rule records have completed editorial approval, alongside 60 published original house questions. The board game directory lists the complete 1,320-game collection and links each game to its sourced editions when available. The random mix contains 180 individually reviewed portable criteria; cooperative role assignments, simultaneous play, component-dependent setup and random-only instructions remain outside it. Distinct Spin Circus, Valley of the Kings, Ticket to Ride: Europe and Incan Gold editions retain their different starting instructions.

The separate 1,320-game discovery inventory contains identities, not imported rules: 494 of those identities have a researched edition; 826 remain. Seventeen researched games are outside that inventory; Spin Circus, Valley of the Kings, Ticket to Ride: Europe and Incan Gold each have two edition records. Perseverance: Castaway Chronicles – Episodes 1 & 2 has two separately researched episode answers under one inventory identity. Explicit identity overrides keep unrelated games such as the Gamewright and Allplay games named Chomp and Big Top separate in coverage counts. Completing source research remains implementation work; the inventory does not satisfy the request for a full compendium. Edition-specific entries distinguish card-assigned or simultaneous starts from rules that call for a random player. Static builds contain the 516 reviewed catalog entries. Preview builds remain non-indexable; approval is separate from public deployment.

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

`npm run verify` runs type checking, lint, unit tests, content validation, build, and artifact audits. Browser tests run against `dist` on port 4322 with actual CSP/headers, and the actual development picker and editorial routes on 4321. Build first. The release test copies the site to an isolated ignored directory; synthetic approval fixtures never enter `src/content/` in this project. With `npm run dev` running, `npm run test:dev-release` verifies a fresh development browser can pick before and after the complete release matrix. Astro and Vite caches are project-local and separated by command, so release fixtures cannot invalidate the running preview's dependency URLs.

To inspect the static output manually: `npm run test:serve`. `npm run preview` is Astro’s ordinary static preview and does not simulate Cloudflare headers. With the dev and static servers running, `npm run screenshots` captures deterministic states in `artifacts/screenshots/` and renders the original social SVG to PNG.

The build also parses every generated HTML page to check metadata, canonical URLs, structured data, internal links, and sitemap coverage. `npm run audit:lighthouse` measures the fresh isolated production fixture from `test:release`; it writes local lab reports under `artifacts/lighthouse/` and does not contact a deployed site.

See `DESIGN_AND_SEO.md` for the visual direction and search implementation, `VERIFICATION.md` for actual results and limits, `CONTENT_REVIEW.md` for the approval process, and `RUNBOOK.md` / `LAUNCH_CHECKLIST.md` for launch and rollback. Deploy only `dist/`, never this repository or the artifacts directory.


Art Decko and Art Robbery add two researched identities; For Sale, Schotten Totten and Time Bomb Evolution finish review. This adds five approved catalog entries and four portable criteria. See `research/coverage/art-mini-progress.md` for sources and the publication-audit correction.

Age of Dirt adds another researched identity; nine existing Czech Games Edition drafts finish review. These ten approvals add four portable criteria, with setup roles and phase priority kept explicit. See `research/coverage/cge-wizkids-progress.md`.

Hardback, both Burgle Bros. games, Clank! and Isle of Trains add five researched identities and five approved entries; four qualify for the random mix. See `research/coverage/skellig-direwolf-trains-progress.md`.

Five existing R&R Games drafts also complete review, with four portable criteria. See `research/coverage/rnr-review-progress.md`.

The latest pass adds Cat Café, Tinderblox, Dice Hospital, Chocolate Factory and The Ancient World second edition, plus approvals for six existing Board&Dice and Ludonova drafts. Seven more criteria qualify for the random mix. The original Ancient World remains pending, and Ceylon's variant setup order has been corrected. See `research/coverage/alley-red-raven-board-dice-ludonova-progress.md`.

