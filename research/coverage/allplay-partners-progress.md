# Allplay and publisher partners — 2026-09-23 UTC

Sixteen additional source-backed drafts were added: twelve Allplay-linked games, plus Roll Camera! (Keen Bean Studio), Don't Go In There (Road to Infamy), Gift of Tulips (Weird Giraffe Games) and Burano (EmperorS4). Every starting instruction was read on a rendered PDF page. The local directory contains 176 rule records, covering 159 of the 1,320 discovery identities; 1,161 identities remain pending. Fifteen researched games are outside the inventory. Spin Circus and Valley of the Kings each retain two edition records. No record has human publication approval.

The Allplay additions are High Society, River Valley Glassworks, Through the Desert, Panda Panda, Habitats, Pollen, Switchbacks, Roll to the Top: Journeys, Pies, QE, Big Top and Basketboss. Public catalog names were matched as research leads, then publisher product links and the actual manuals were inspected. Retail listings alone were not treated as proof of a rule.

## Source and identity details

- High Society's inspected sheet shows a 2025 copyright and explicitly permits random selection instead of its clothing criterion.
- River Valley Glassworks' actual setup instruction is step 5; extraction incorrectly labeled it step 2. The rendered page resolves the location.
- Panda Panda expressly counts pictures and videos. Roll to the Top: Journeys chooses a dice roller before simultaneous board filling. Pies chooses who leads the first trick. QE and Big Top choose an auctioneer.
- Basketboss calls the humans managers. Setup gives the tallest manager the Referee Advisor card; the first Offer Contracts phase starts with that card holder. The two passages are both cited.
- Burano's fallback is random selection if nobody has ever visited Italy. It is not a stated resolution of equally recent visits. Its cube-pyramid construction is simultaneous, followed by ordered player turns. Walking in Burano remains a separate game.
- Roll Camera!'s image-only manual was inspected visually. The direct file linked by [Keen Bean Studio](https://www.keenbean.studio/rollcamera.html) is byte-identical to the Allplay-hosted copy; the record cites the direct publisher file.
- [Weird Giraffe Games](https://weirdgiraffegames.com/) redirects to its Square site, which links Gift of Tulips to the Allplay product page and its manual. That chain is recorded in the draft evidence. Don't Go In There's manual is on the publisher's own r2igames.com domain.

## Another corrected name collision

Gamewright's Big Top is an animal-and-color recognition game, while the inventory's BGG 369899 is Allplay's circus auction game. These are different games, not two editions of one game. Both sourced answers remain searchable, but a validated identity override excludes the Gamewright title from this inventory identity. Unit and browser checks cover the separation. Earlier name-matched coverage checkpoints included this false match, in addition to the Chomp collision corrected in the preceding batch.

## Pending sources and reproducibility

`allplay-partners-source-queue.json` preserves 19 explicit source downloads. Eighteen were retrieved; Power Vacuum exceeded the cache helper's 35 MB limit. A later HEAD request to that URL returned 403. Its answer remains pending. The two Roll to the Top downloads have different hashes but the same identified Journeys starting instruction; only the current Allplay asset was used, and the second download was not counted as an additional edition.

Bacon's linked source URL is explicitly labeled rough-draft. Its instruction was readable, but no answer record was added pending confirmation of a final manual. The remaining catalog candidates with no direct manual link likewise remain pending. Neither missing evidence nor a rough draft was silently substituted for a final-edition answer.

`keen-bean-extra-source-queue.json` records the additional direct Roll Camera! download. `allplay-batch.json`, `roll-camera-batch.json`, `dont-go-in-there-batch.json`, `gift-of-tulips-batch.json` and `burano-emperors4-batch.json` preserve manually written inputs. Local PDFs, extracted text, hashes and rendered pages remain in the ignored `research/source-files/` tree. These records are development drafts and are excluded from deployment artifacts.
