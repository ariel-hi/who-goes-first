# Pending eight: part B source review and drafts

Reviewed on 2026-09-26 UTC. These three records are research drafts for independent editorial review. Each has `status: draft` and null approval, revision, publication, and material-update fields. No portable mix membership, published content, identity inventory, or application code was changed.

## Publisher provenance and source integrity

All three official publisher links were reopened. Each live PDF download returned HTTP 200 and matched the cached file's bytes and SHA-256. Cached originals remain in `research/source-files/pending-eight-discovery`.

| Game | Official publisher provenance | Reviewed PDF | Bytes | SHA-256 |
| --- | --- | --- | ---: | --- |
| Summoner Wars: Second Edition | [Plaid Hat Games product page](https://www.plaidhatgames.com/board-games/summoner-wars/) → rulebook link | [ph3600-rulebook-v1_2.pdf](https://media.plaidhatgames.com/filer_public/7d/07/7d075572-2254-4248-bdb5-464ef4b97180/ph3600-rulebook-v1_2.pdf) | 26,681,489 | `560161fb72f4c36f3dc6e23259061ab51ce480bd6acc4dbf19575ff96cb8bb50` |
| London: Second Edition | [Osprey Board & Card Games resources](https://www.ospreypublishing.com/uk/discover/gaming-resources/board-card-games/) → London: Second Edition rulebook | [london_rulebook_web.pdf](https://www.ospreypublishing.com/media/hgkdrmhp/london_rulebook_web.pdf) | 1,380,997 | `3d9a0507f453dcc20b2251a8818af0c1d16417f3e2b70e9df9a77f11b7f709db` |
| The Game | [Pandasaurus Kwanchai Moriya edition product page](https://pandasaurusgames.com/products/the-game-kwanchai-moriya-edition) → Rulebook | [P_TG_Rulebook_Print.pdf](https://www.dropbox.com/scl/fi/rux1sfbevshr8x593n0a2/P_TG_Rulebook_Print.pdf?dl=1&rlkey=6bbw1wlsych1lrxznas12g6ty&st=sn56zvzr) | 1,075,755 | `50f458a3d4d7950cf85287fb6dad9884443a84bec640c05a6cd88691d4d52aa5` |

The Pandasaurus link uses `dl=0` for viewing; changing that flag to `dl=1` downloaded the same stable file. The transient `dropboxusercontent.com` redirect is not used as the draft source.

## Complete rendered page evidence

Full extracted manuals were searched for starting-player, turn-order, tie, and alternative-play context. The following complete rendered pages were inspected visually, including surrounding text and edition information. New review renders were kept outside the repository in the temporary `pending-eight-part-b-review` directory.

### Summoner Wars: Second Edition

- **PDF page 1:** cover identifies Second Edition **v1.2**.
- **Printed/PDF page 5:** setup steps 3–5 cover faction/custom decks, starting cards and five-card hands. Step 6 randomly chooses the starting player, who starts at **2 magic**; the opponent starts at **3 magic**.
- **Printed/PDF page 6:** players alternate full turns; after the five phases, the active player refills to five cards and the opponent takes a turn.
- **PDF page 20:** credits show a 2021 copyright. This is not used as a release date for v1.2.

The official product page currently labels its rulebook link **v2**, but that link resolves to the cached **v1_2** PDF, whose cover says **v1.2**. The draft explicitly scopes itself to the file reviewed and makes no newest-version claim. No prescribed random-selection method, starting tie procedure, or alternative starting criterion was found.

Draft: `research/games/summoner-wars-second-edition-plaid-hat-en-v1-2.json`.

### London: Second Edition

- **PDF page 6:** setup deals each player £5 and six city cards. Its final paragraph makes the **person who set up the game** the first player.
- **PDF page 7:** play proceeds clockwise; a turn opens with drawing one city card before choosing an action.
- **PDF page 11:** the tie breakers are for the endgame winner. They do not supply a starting-player tie rule.
- **PDF page 12:** credits explicitly give first publication in 2017 and this edition's copyright in 2017.

These pages have no printed page numbers. The draft records PDF positions without inventing printed numbering. No starting tie or alternative criterion is supplied for shared setup; that ambiguity remains in `uncertainty`, with no invented official tie breaker or house fallback.

Draft: `research/games/london-second-edition-osprey-en-2017.json`.

### The Game

- **PDF page 1:** standard hands are seven cards with two players or six cards with three to five players. Players inspect their hands and agree together who starts, then take turns clockwise. Solo setup deals eight cards.
- **PDF page 2:** solo refills to eight cards. Communication and the cooperative ending do not define a starting tie breaker. The expert option changes minimum cards played and optionally reduces hand size while retaining the other rules, including group agreement.

Both complete pages are unnumbered and undated. The publisher product page and matching artwork establish the Kwanchai Moriya edition scope. No publication year, newest-edition claim, ranked-hand criterion, or house fallback was invented. The public answer is explicitly multiplayer; solo play is a separate clarification.

Draft: `research/games/the-game-pandasaurus-kwanchai-moriya-en.json`.

## Handoff

Exactly three new game drafts were prepared. All source page lists put the page containing the starting instruction first. Approval and publication remain pending root's independent review; no record was moved into published content or the portable random-rule pool.

Validation: all three JSON records passed the repository's strict `ruleSchema` with an additional explicit assertion that status is draft and all four approval/publication fields are null. The cached PDF SHA-256 values were rechecked after writing the drafts. No build, server, or browser suite was run for this research-only change.
