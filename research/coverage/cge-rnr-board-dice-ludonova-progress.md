# CGE, R&R Games, Board&Dice and Ludonova — 2026-09-23 UTC

Twenty researched entries were added: nine CGE, five R&R Games, three Board&Dice and three Ludonova. The directory now contains 204 records covering 186 of 1,320 inventory identities, with 1,134 pending. Sixteen researched games are outside the inventory. Spin Circus and Valley of the Kings each have two edition records. All records remain drafts without human approval.

## Sources and review

CGE's six catalog pages yielded 86 product links and nine inventory matches. Each matched product embeds its rules folder. The publisher's own public file-manager response supplied the English manual URLs; actual English pages were inspected because the API language field was inconsistent. All nine PDFs were retrieved and relevant pages rendered and read. No private account or service was used.

R&R Games' 16 catalog pages yielded 128 product links and five inventory matches. All five publisher-linked PDFs were retrieved. Amalfi: Renaissance and Humboldt's Great Voyage exceeded the helper's default 35 MB retrieval limit; an explicit 100 MB limit retrieved them successfully. Hanabi's two-sheet manual is image-only and was read visually. Humboldt's PDF page 3 is printed page 11; Touria's PDF pages 3–4 are printed pages 11–12.

Board&Dice's current downloads include Tawantinsuyu and the revised Trismegistus. The original Trismegistus product page still links its own separate manual. These explicit public Dropbox links were downloaded through Dropbox's public content host, without an account. The original and revised manuals were reviewed separately. A coverage override prevents the revised game from being counted as the original inventory identity; the original now has its own answer.

Ludonova's public catalog has two pages, the second retrieved through the same public pagination endpoint used by its website. Ceylon, The Siege of Runedar and Watson & Holmes match the inventory and have publisher-linked English manuals. Fictions was not treated as the unrelated game Gangster merely because its subtitle contains that word. Junk Art Revolution was not silently substituted for Junk Art.

The four `*-source-queue.json` files preserve source URLs and discovery context; `*-batch.json` files contain manually written inputs. Cached manuals, extracted text, hashes and rendered evidence remain under ignored `research/source-files/`. Every cited starting passage was opened as a rendered image before creating its draft.

## Rules that need context

- Alchemists and Last Will assign the first choice in a planning step; the selected plan controls later order. Last Will's two-player starter blocks a plan before the opponent makes the first personal choice.
- Dungeon Petz assigns a token based on feeding a pet, but the largest shopping group acts first. Group-size ties use clockwise priority from the token. Dungeon Lords chooses orders simultaneously before placing minions in starting-player order.
- Bunny Bunny Moose Moose selects a narrator, with explicit rabbit and random tie-breaks. Goblins, Inc. begins with two simultaneous planners in four-player play and a separate score-based team rule for three players.
- Arnak and Amalfi retain their distinct solo instructions. SETI's opening criterion and score distribution are kept specific to its multiplayer setup. Tzolk'in's thematic sacrifice wording is not given an invented definition.
- Hanabi uses clothing color. Humboldt uses the most recent journey. Pyramid Poker's spoken phrase selects the first pyramid-building move in its two-player base rules; a separate multiplayer addendum is not claimed as reviewed. Touria offers two alternative marriage criteria, not a tie-break sequence.
- Tawantinsuyu explicitly permits random selection as an alternative to the vegetable criterion. Its solo player starts before Axomamma.
- Original Trismegistus has introductory, standard and solo setup differences. Its revised New Edition instead uses the most recent potion maker. The two records have distinct titles, edition labels and source links.
- Ceylon's experienced-player variant uses the lowest starting-tile number instead of the standard tea/random instruction. Runedar explicitly allows a random alternative to shortest-player selection. Watson & Holmes requires random selection when the recorded introduction replaces a player's reading.

## Retrieval helper

`scripts/cache-rulebook-queue.py --max-mb N` accepts an explicit 1–150 decimal MB per-file retrieval limit, defaulting to 35 MB. It retains HTTPS host checks, a three-redirect bound, 25-second timeout, three workers, PDF signature checking and SHA-256 provenance. Syntax parsing and rejection of both 0 and 151 were actually checked. Successful 100 MB-bounded retrievals are recorded in the intake manifests. This helper never infers answers or grants publication approval.

The full compendium remains unfinished. The finished-picker-view request remains queued after that work; no presentation behavior was changed by this content batch.
