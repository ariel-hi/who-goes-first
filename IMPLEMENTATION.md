# Implementation checklist

- [x] Read both briefs completely; inspect the empty project and ancestor instructions.
- [x] Implement and test uniform selection, roster validation, frozen outcomes, storage.
- [x] Finish Instant, Quick, and lazy Balloon Rise; keyboard and reduced-motion behavior.
- [x] Build static rules, search, approval gate, local review preview, and house rules.
- [x] Add supporting pages, SEO, privacy boundaries, build audits, and CI.
- [x] Research a bounded draft batch from primary sources; later owner authorization permits honest assistant editorial review.
- [x] Run type/lint/unit/build and Chromium/Firefox/WebKit checks; inspect screenshots.
- [x] Perform a separate skeptical review and fix defects; rerun affected checks.
- [x] Deliver operational docs, captured screenshots, and actual verification results.

The later owner request expands scope beyond the original handoff: compact soft styling, inline names, no inner roster scrollbar, Spinner/Card Draw/Towers, random board-game rules, and the full compendium.

- [x] Replace the wordy front page with the tool and two directory links; move guidance to supporting pages.
- [x] Implement nine methods with the same locked selection; let the roster reflow as its count changes.
- [x] Edit names directly, retain names on count changes, wrap long names without clipped text.
- [x] Add random game-rule selection, skip, source navigation, and secure-RNG failure handling.
- [x] Track all 1,320 discovered game identities separately from source-checked rules.
- [ ] Complete starting-rule research across the full collection. There are now 417 researched records, covering 396 of the 1,320 inventory identities. The other 924 identities remain; no claim of full coverage is made.
- [x] Keep all seven animated views visible after the reveal, alongside the winner announcement. Existing workspace implementation was preserved. The final compact-Spinner regression run passed 30 checks across Chromium, Firefox and WebKit, including completion, replay, skip, editing, reduced motion and 320px layout. Evidence: `artifacts/retained-compact-spinner-final-browser/.last-run.json` and `artifacts/eagle-retained-home-live-check.json` (2026-09-23 08:16 UTC).
- [x] Verify this refinement and refresh screenshots; actual results and remaining full-compendium work are recorded in `VERIFICATION.md`.
- [x] Compact the retained Spinner result with a name-and-color legend, preserving duplicate-name suffixes and player editing. Contain the rotating SVG bounds to prevent narrow-screen horizontal overflow.
- [x] Apply the owner's delegated editorial review to eight Ravensburger entries, preserving the existing 61 reviewed records. That checkpoint had 69 catalog approvals and 66 separately reviewed random-mix criteria; Chronicles of Light is directory-only.
- [x] Fix newly approved development routes returning 404 until restart. Fifteen final directory/live-update checks pass across Chromium, Firefox and WebKit; the isolated release matrix and before/after development checks pass.
- [x] Restore a clear disabled-Balloon fallback, verified in its built fixture with Quick selection, working pick controls, mobile reflow and zero axe violations.

- [x] Add and review ten Deep Print, Cocktail Games, Helvetiq and Horrible Guild records from rendered primary manuals. That checkpoint had 79 approved entries and 73 portable random-mix criteria; three of that batch remained directory-only.

- [x] Add and review ten Eagle-Gryphon, Ludonaute and 2F-Spiele edition records. That checkpoint had 89 approved entries and 76 portable random-mix criteria. Incan Gold editions retain their simultaneous play; On Mars and Escape Plan distinguish setup order from action order.

- [x] Add and review ten more records from Eagle-Gryphon, Libellud, Rebel Studio, Keymaster and Mindclash. That checkpoint had 99 approved entries and 85 portable criteria. Separate Perseverance episodes count as one inventory identity; Trickerion’s setup choice is distinguished from random play order.

- [x] Add and review twelve ThunderGryph and Sinister Fish records from rendered publisher manuals. That checkpoint had 111 approved catalog entries and 96 portable criteria. Cat-a-comb stays directory-only because its opponent starts after the latest cat-comber handles setup. Moon preserves its production/construction and two-player distinctions.

- [x] Add and review six Gamelyn English records from official Dized references. That checkpoint had 117 approved entries and 101 portable criteria. Zombies remains directory-only because its Human/Zombie qualification requires an explicit interpretation.

- [x] Add and review ten more official Dized records. That checkpoint had 127 approved entries and 107 portable criteria. Separate setup roles and simultaneous play remain explicit; Volcano is labeled Fiesta Caldera. Reject the unrelated Balloon Pop title match. Correct four duplicated official alternatives that visual inspection found under the house-rule label.

- [x] Add and review five Osprey and Genius Games records after inspecting 28 rendered source pages. That checkpoint had 132 approved entries and 112 portable criteria. Preserve the Subatomic edition limitation and Cytosis/Periodic starting-resource context.

- [x] Add and review seven Capstone and Atlas records after inspecting 25 rendered source pages. That checkpoint had 139 approved entries and 116 portable criteria. Preserve Curious Cargo’s phase priority, Joan of Arc’s solo exception, Gloom’s all-equal tie-break and Once Upon a Time’s required Story Card.

- [x] Add and review six Renegade, North Star and Thunderworks records after inspecting 36 rendered source pages. That checkpoint had 145 approved entries and 121 portable criteria. Preserve Nature’s simultaneous variant, Goblin Vaults’ automated opponent timing, Lotus’s actual copyright year, and Terror Below’s reverse setup order.

- [x] Add and review seven Underdog, Thunderworks and Next Move records after inspecting 35 rendered source pages. That checkpoint had 152 approved entries and 127 portable criteria. Keep FlipToons’ simultaneous opening separate from its first Market turn; preserve Beez’s reverse setup order and Trekking’s edition-specific criteria. Recheck the retained Spinner, Card Draw and Balloon Rise scenes in the running homepage.

- [x] Add and review Canvas, Dinosaur Island and five Adventure Games titles after inspecting 32 rendered source pages. That checkpoint had 159 approved entries and 134 portable criteria. Preserve official fallbacks, original-edition context, individual starting criteria and solo distinctions. Verify all seven new articles, directory search and random-pool parity in the running application.

- [x] Add and review Dale of Merchants, Dawn of Peacemakers, The Liberation of Rietburg, Zombie Dice, Dino Hunt Dice and The Stars are Right after inspecting 22 rendered source pages. The catalog now has 165 approved entries and 137 portable criteria. Preserve previous-game branches, official random alternatives and campaign/edition scope. Verify all six articles, directory search and pool parity in the running application.
- [x] Complete editorial review of the fourteen existing Rio Grande and Zoch drafts after re-inspecting 20 rendered source pages. The catalog now has 179 approved entries and 143 portable criteria. All fourteen articles passed live source, content, layout and accessibility checks. Fresh homepage checks passed for all seven retained animated scenes, replay and skip, plus the 12-player spinner at 320px. Research coverage remains 417 records / 396 inventory identities; 924 identities still need research.

- [x] Complete editorial review of thirteen existing core-game drafts using twelve fresh publisher PDFs and the live official Wingspan reference. That checkpoint had 192 approved records and 145 portable criteria. Clarify Cascadia wildlife and Tiny Towns simultaneous play. All thirteen articles and nine affected cross-browser checks passed after correcting outdated test expectations. Coverage remained 417 records / 396 inventory identities; 924 awaited research.
- [x] Research Art Decko and Art Robbery and approve those plus For Sale, Schotten Totten and Time Bomb Evolution after inspecting 19 rendered source pages. That checkpoint had 419 researched records, 398 inventory identities, 922 pending, 197 approved records and 149 portable criteria. Five live article checks and nine cross-browser directory tests passed.
- [x] Fix shared-answer false positives in the publication audit while rejecting unauthorized game routes independently of generated-page existence. Five new regression tests pass; the full 38-test verification and isolated release/dev-cache regression pass.
- [x] Research Age of Dirt and approve it plus nine existing CGE drafts after inspecting 27 rendered source pages. Totals: 420 researched records, 399 inventory identities, 921 pending, 207 approved catalog records and 153 portable criteria. All ten articles passed live content, layout and accessibility checks; nine cross-browser directory checks passed. Preserve setup roles, simultaneous starts, phase order, solo exceptions and official alternatives.

- [x] Research and approve Hardback, Burgle Bros., Burgle Bros 2, Clank! and Isle of Trains after inspecting 30 rendered source pages. That checkpoint had 425 researched records, 404 inventory identities, 916 pending, 212 approved entries and 157 portable criteria. All five live articles and nine cross-browser directory checks passed. The component-dependent Isle of Trains rule stays outside the random mix.
- [x] Approve five existing R&R Games drafts after inspecting ten rendered source pages. Totals: 425 researched records, 404 inventory identities, 916 pending, 217 approved entries and 161 portable criteria. All five live articles passed source, content, layout and accessibility checks. The fresh live-home check verified all seven retained scenes, replay, skip and the 12-player spinner at 320px.
