# Full collection research

The owner requested the entire starting-rule compendium, not a named starter list. That objective remains unfinished.

`discovery-index.json` records all 1,320 distinct game identities observed in First Player Fun's public collection on 2026-09-22. It contains names, BGG IDs and discovery links only; no competitor rule prose, images, application code, or inferred publisher verification. This is a useful research inventory, not an exhaustive definition of all board games. No reusable license for that site's rule prose was established in the inspected repositories.

Run `npm run content:coverage` or open `/dev/coverage/` to compare the complete inventory with researched editions. At this checkpoint there are 532 researched rule records in total; 510 inventory identities match a researched edition and 810 still need primary-source research. Matching a title does not prove every edition agrees. The owner has delegated editorial review to Codex. All 532 researched exact revisions are approved for the catalog; 193 portable criteria are eligible for the random mix. Research coverage, approval and deployment remain separate.

`identity-overrides.json` records known ambiguous names. An override's inventory IDs replace title matching for that rule; an empty list means the rule does not represent any inventory identity. Unknown rule IDs, unknown inventory IDs and duplicate override records are errors. Gamewright's Chomp! is excluded from the unrelated Allplay Chomp identity, which now has its own researched answer.

The older Schmidt Spiele Vienna and newer Queen Games Vienna have separate answers and explicit inventory identities. Skulls of Sedlec uses Button Shy's visually checked print-and-play rules. The complete Dranda Games rulebook for Isle of Trains: All Aboard does not name an initial player, so its catalog answer reports that omission and labels random selection as a house rule.

The Z-Man Games Archaeology: The New Expedition rulebook supplies a separate first-turn criterion for its optional Beginner's Luck variant. The publisher-linked Thames & Kosmos manual identifies the Anno 1800 starter, and Aporta Games' Bad Company manual assigns the opening boss role. All three cited editions were visually checked.

Rebel's Blossoms rules, Blam!'s Chakra rules and Restoration Games' Berried Treasure rules add three more checked editions. Blossoms and Berried Treasure state different ways to choose the starter for later games or rounds. The random mix now validates every saved revision against the actual public rule, so the listed count matches the prompts visitors can draw.

Allplay and its publisher partners add another 16 drafts. The Big Top identity correction keeps Gamewright's recognition game separate from Allplay's auction game. See `allplay-partners-progress.md` for provenance, edition details and held sources. Current coverage includes 17 researched games outside the inventory and four games with two edition records each, plus two Perseverance episode answers under one combined-box identity.

AMIGO and Brain Games add eight further answers, with player-count differences, cooperative role assignment and ICECOOL's catcher/first-move distinction preserved. ICECOOL uses the publisher's English download, corroborated by the German AMIGO source, and is counted once. See `amigo-brain-games-progress.md` for evidence and the pending IELLO downloads.

CGE, R&R Games, Board&Dice and Ludonova add twenty more sourced entries, including the separately researched original and revised Trismegistus. See `cge-rnr-board-dice-ludonova-progress.md` for provenance, variant distinctions and the bounded large-manual retrieval option. The revised Trismegistus is outside the original inventory identity.

Gigamic and its publishing partners add nine more answers, and HABA adds eight. IKI keeps its two-player Sun/Moon rule separate; the 29-animal base Animal Upon Animal is not confused with the 13-animal mini game. See `gigamic-haba-progress.md` for these distinctions and held sources.

Fantasy Flight Games, Queen Games and Schmidt Spiele add fifteen more answers. Quacks preserves simultaneous brewing, Black Gold includes the official random alternative, and a Vienna identity override keeps Stefan Feld's City Collection game separate from the older dice-placement game. German-language Schmidt sources are labeled as English summaries. See `ffg-queen-schmidt-progress.md`.

dV Giochi and Hutter Trade add thirteen further answers. The records distinguish opening judges, readers and dealers from ordinary turns, preserve official alternatives and identify language-specific editions. Terra remains pending because the inspected Italian and German files do not select the initial starter. See `dv-hutter-progress.md`.

ABACUSSPIELE adds seven more records, including an English Leo source after an earlier publisher link failed. Longest hair selects its starter; shortest hair selects its clock keeper. STOP retains its rule-reader criterion and out-of-turn exception. See `abacus-progress.md`.

Looney Labs and Pegasus add 24 further records. Character difficulty, official random alternatives, opening roles, solo context and source-language differences remain explicit. Incomplete downloads prompted a bounded streaming fix with four offline regression checks. See `looney-pegasus-progress.md`.

Renegade, Wizards of the Coast and Z-Man add nine more records, preserving official alternatives, round order and solo context. Piatnik name matches and unavailable Arboretum sources remain held. See `renegade-zman-progress.md`.

Days of Wonder adds nine edition records for eight more identities. Two Ticket to Ride: Europe manuals have different starting criteria; Small World of Warcraft distinguishes the base game from its team variant. The refreshed Europe download's incomplete overall page count remains explicit in review notes. See `days-of-wonder-progress.md`.

The 2026-09-23 UTC Gamewright batch retrieved 91 publisher-hosted manuals covering 88 distinct inventory titles. It produced 86 researched drafts, with two titles held for clarification rather than guessed. See `gamewright-progress.md`. The intake script only retrieves manuals and extracts possible passages; it does not approve or automatically infer their rules. Written answers were checked against the source instructions, including image-only manuals.

Continue across this inventory rather than stopping at the product plan's old candidate list. For each game, locate a publisher rulebook, identify the actual edition, inspect the opening instruction and any stated tie-break, and create a separate draft under `research/games/`. The development directory includes valid drafts; the random mix requires a separate review of whether each criterion can select one player without game-specific components. Never fill a missing answer with a guess or count an identity as a rule. The owner's later authorization permits Codex to perform the editorial review and approve exact revisions for `src/content/games/`; it does not bypass source verification or authorize deployment.

Death Valley, Council of Verona, 3 Wishes and 10′ to Kill add four visually checked publisher-authored English instructions preserved by game archives or retailers. Costa Rica and 20th Century use indexed text of their publisher-hosted PDFs; direct retrieval was denied or returned 404 on 2026-09-23, and the review notes state this limit. These six entries preserve optional starting methods, official tie rules, later-round changes and the distinction between a required instruction and a thematic example.

Dinosaur Island: Rawr 'n Write, Distilled and Dinner in Paris add three more visually checked English publisher rulebooks. Their records preserve the dinosaur joke's official random alternative, Distilled's distillery-visitor or random selection and round-to-round marker pass, and Dinner in Paris's clockwise order.

Dinosaur World, Dungeon Roll, Dreadful Circus, Dungeons & Dragons: The Yawning Portal, Deep Regrets, Divinity Derby, Defenders of the Realm and Demon Worker add eight more English publisher-authored rulebooks. Role-based openings, later-round marker movement, and explicit random or dice alternatives remain in the relevant records.

Fudacoma, Blue Orange and Artipia add three researched editions, all now approved. The Artipia 13 Ghosts record cites the publisher rulebook and records the matching rendered booklet used for visual review. See `fudacoma-blue-orange-artipia-progress.md`.

A Thief's Fortune, Ceres, Briefcase and WordCraft add four more Artipia editions. Their publisher-linked English PDFs establish the opening criteria and relevant later-round or mode rules. See `artipia-followup-progress.md`.

Agent Avenue adds one Nerdlab English rulebook edition. Its two-player starter and separate team-variant setup were checked on rendered publisher pages; only the confirmed two-player answer is published.

Android and A Game of Thrones: B'Twixt add two Fantasy Flight editions. Publisher-hosted English setup pages were rendered and checked; the Android board game is kept distinct from Android: Netrunner and B'Twixt from the other Game of Thrones games.

Sid Meier's Civilization: The Board Game and A Column of Fire add two more publisher-manual editions. The original Civilization game is kept separate from A New Dawn; the A Column of Fire starter is fixed for the entire game.

Agatha Christie: Death on the Cards, Ankh: Gods of Egypt, Archeos Society, Aquatica and Alpaca add five more publisher-manual editions. Death on the Cards retains its coin-flip tie rule; Ankh retains both official options; Archeos Society distinguishes its first season from later seasons; Alpaca's joke about an absent alpaca petter is not treated as a practical fallback.

Alubari, 890 Anno Domini, 7: The Sins, Birdie, Squeaky, Blueprints, Beyond Baker Street and Bears vs Babies add eight further researched editions. Alubari uses an archived copy of its original English rulebook; the other seven use publisher-linked manuals. Birdie's second-round starter and Blueprints' later-round starter are recorded separately from their first-round criteria. Beyond Baker Street distinguishes introductory play from Character-card play. Bears vs Babies' 2023 instructions offer optional example criteria, not a mandatory one.

The Blue Orange batch adds 13 records for 12 further inventory identities, from 18 retrieved publisher manuals. Two Spin Circus editions have different answers and separate entries. Image-only manuals were read visually, and the French Lost Seas manual is clearly labeled as an English summary of that edition. See `blue-orange-progress.md`.

Thames & Kosmos, AEG and Allplay add 29 more records. These include official starting fallbacks, simultaneous-play roles, separate Valley of the Kings editions and the distinct dinosaur Chomp game. See `thames-kosmos-progress.md` and `aeg-allplay-progress.md`. The Chomp identity correction reduces older name-matched coverage totals by one before counting new research.

Rio Grande and Zoch add another 14 records, covering 14 further inventory identities. Official random alternatives and tie-breaks are kept distinct from house fallbacks; opening setup roles are distinguished from ordinary turns. See `rio-grande-progress.md` and `zoch-progress.md`.

Other research leads inspected: [Rulebook](https://github.com/mohitagw15856/rulebook) has CC BY 4.0 game descriptions but a much smaller collection; [MeepleLM](https://github.com/leroy9472/MeepleLM) has transformed rulebooks, which are not primary publisher verification. Neither has been represented as a completed or verified import.

The inventory, coverage route and source files are private development material and are excluded from static deployment artifacts. `npm run build` audits that exclusion.

Eagle-Gryphon, Ludonaute and 2F-Spiele add ten reviewed edition records for nine more identities. The two Incan Gold editions share simultaneous decisions but differ in Guide-selection wording. Mercado de Lisboa was checked visually because its PDF has no extracted text. On Mars, Escape Plan, Bot Factory and Inventions preserve their phase/player-count distinctions. See `eagle-ludonaute-2f-progress.md`.

The mixed-publisher and Mindclash batches add ten reviewed records for nine identities. Rococo Deluxe, Harmonies, Meadow and original PARKS are followed by Anachrony Essential Edition, Astra, Trickerion, Septima and both Perseverance episodes. Their source and mode distinctions are recorded in `mixed-mindclash-progress.md`.

ThunderGryph and Sinister Fish add twelve reviewed records for twelve further identities. Personal-history criteria, optional variants, solo order and setup-versus-first-turn distinctions remain explicit. Eleven rules join the portable mix; Cat-a-comb remains directory-only. See `thundergryph-sinister-progress.md`.

Gamelyn adds six reviewed English records from its official Dized references. Five enter the random mix; Tiny Epic Zombies remains directory-only with its role interpretation explicit. All 52 selected source sections were read in full. See `gamelyn-dized-progress.md`.

Ten further official Dized references add ten researched identities and six portable criteria. The complete 72 selected section bodies for those games were read. Volcano's variant is explicit; Big Monster's sequential variants retain their unspecified initial selection method. A Balloon Pop title match was rejected as a different game. See `dized-followup-progress.md`.

Osprey and Genius Games add five more reviewed records from complete publisher-linked manuals. All five are portable starting criteria. See `osprey-genius-progress.md` for page references, edition distinctions and held discovery leads.

Capstone and Atlas add seven reviewed records from complete publisher-linked manuals. Four join the random mix. See `capstone-atlas-progress.md` for page references, variant and tie-break distinctions, and held discovery leads.

Renegade, North Star and Thunderworks add six reviewed entries and five portable criteria. See `renegade-northstar-thunderworks-progress.md` for edition, turn-order and variant details and the remaining Underdog source leads.

Underdog, Thunderworks and Next Move add seven reviewed entries and six portable criteria. See `underdog-thunderworks-progress.md` for edition, opening-phase and setup-order distinctions.

Canvas, Dinosaur Island and five Adventure Games titles add seven reviewed entries and seven portable criteria. See `canvas-dinosaur-adventures-progress.md` for source, edition and initial-turn distinctions.

Snowdale Design, The Liberation of Rietburg and three Steve Jackson Games titles add six reviewed records and three portable criteria. See `snowdale-rietburg-sjgames-progress.md`.

Art Decko and Art Robbery add two researched identities. Three previously researched mini-games complete approval. See `art-mini-progress.md` for source checks, edition distinctions and held IELLO leads.

Age of Dirt adds one researched identity; nine existing CGE drafts complete approval without increasing research coverage. See `cge-wizkids-progress.md` for all ten reviews, 27 inspected source pages and portable-mix decisions.

The Fowers, Dire Wolf and Isle of Trains batch adds five researched and approved records, four portable, after inspection of 30 rendered source pages. See `skellig-direwolf-trains-progress.md`.

The R&R Games pass approves five existing drafts, four portable, after inspection of ten rendered source pages. Pyramid Poker retains its setup-phase instruction in the catalog. See `rnr-review-progress.md`.

Alley Cat and Red Raven add five reviewed records; six Board&Dice and Ludonova drafts complete review. Seven criteria join the portable mix. The Ancient World second edition is explicitly excluded from original-edition coverage. See `alley-red-raven-board-dice-ludonova-progress.md` for the 39 inspected pages, corrected Ceylon variant setup and held sources.

Hats, Havalandi and Helios add three further researched identities and three portable criteria. The Hats criterion comes from the publisher's multilingual rulebook; Havalandi and Helios use publisher-authored English manuals mirrored by rulebook hosts. The exact pages, publisher credits and source-file hashes are recorded in their research drafts.

Indian Summer and Into the Blue add two further researched identities and portable criteria. The publisher-authored English manuals were read on their setup and gameplay pages; the PDF credits identify Edition Spielwiese and Funnyfox respectively.

Half-Pint Heroes, It Happens and Horse Fever add three researched identities. The first two are portable criteria; Horse Fever's six-color table requires its Sprint Die and box, so it stays in the game directory only. It Happens rotates the starter each round, and Horse Fever applies its family-mode selection in board-game mode too.

Ice and the Sky and Himalaya add two more researched identities and portable criteria. Their first-player roles pass left in later generations or turns; the English sources are publisher-authored, with Ice and the Sky hosted by Jeux Opla.

