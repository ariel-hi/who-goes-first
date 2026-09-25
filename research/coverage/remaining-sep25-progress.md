# Remaining-inventory source review — 2026-09-25

This batch covers 21 additional identities outside the separate 30-title priority list. Each approved catalog entry has a matching research draft, a source page reference, a source SHA-256 in its private evidence, and an exact approval revision. The PDF source cache under `research/source-files/` is ignored by Git; the twelve intake queues preserve the retrieval URLs. No criterion in this batch was added to the portable random mix because qualifying or selecting one player can be ambiguous, requires game context, or assigns a specific role.

| Identity | Publisher/manual reviewed | Opening instruction and scope |
| --- | --- | --- |
| Fish 'n' Flip | Helvetiq, English PDF | Last to spot a dolphin starts cooperative play; competitive play is simultaneous. |
| Hedgehog Haberdash | HABA, English section | Child who most often brings leaves into the house starts. |
| My Very First Games: Nibble Munch Crunch | HABA, English section | Two games have distinct recent animal interactions; free play has no turn order. |
| Survive the Island | Zygomatic, English PDF | Last to return safely from an island begins. |
| Surfosaurus MAX | Loosey Goosey, English PDF | Most experienced paleontologist or surfer takes the first-player marker. |
| Snorkeling | Haumea, English PDF | Most recent snorkeler starts. |
| Snail Sprint! | HABA-authored English section, retailer mirror | Last to hold a snail starts. |
| The Magic Labyrinth | Schmidt Spiele/Drei Magier, German PDF | Most recent person to get lost starts; English summary of German article 40848. |
| PUSH | Ravensburger, English PDF | First person to sit down starts. |
| Tiny Park | HABA-authored English section, public archive | Last to ride a roller coaster starts. |
| Minecraft: Heroes of the Village | Ravensburger US, English PDF | Most recent player to tame an animal in Minecraft starts; youngest if nobody qualifies. |
| Sleeping Queens 2: The Rescue | FoxMind, English rules for Hebrew-card edition | Most recent finder of a lost item starts. |
| Unicorn Glitterluck: A Party for Rosalie | HABA-authored English excerpt, retailer attachment | Most recent unicorn dreamer may start; youngest if the players cannot agree. |

The source pages for these entries were rendered and visually checked. Source and edition boundaries are explicit in each record, especially Fish 'n' Flip's modes, Nibble Munch Crunch's two games, the Magic Labyrinth's German-language source, the FoxMind localized cards, and Rosalie's printed-page/PDF-page difference.

## Follow-up: two more identities

| Identity | Publisher/manual reviewed | Opening instruction and scope |
| --- | --- | --- |
| Roll 'em Fold 'em | Schmidt Spiele, English PDF, article 88348 | Most recent person to fold something starts and receives both dice; solo play has no player order. |
| Armonia | Skellig Games, English PDF, article 0047-0006 | Most recent person to sing, hum or whistle like a cute little gnome starts; the rule gives setup advances to later players. |

Both manuals were linked from their publishers' product pages and their cited pages were rendered and visually checked. The seventh and eighth source queues preserve their official URLs. Both entries stay outside the portable random mix because their criteria require subjective judgments or can leave a group without a qualifying player. Their individual records preserve the actual rule without adding an invented fallback.

## Held leads

- **Monster Mania** (Piatnik 2009): all four image-only booklet pages were rendered and inspected. No initial-player selection instruction was found; this is still pending a source that can support a useful edition answer.
- **LOOP and Popcorn** (IELLO): publisher PDF downloads timed out. They remain pending.
- **Rhino Hero: Missing Match**: the HABA-authored manual is indexed, but the retailer mirror returned HTTP 429 and the alternate mirror returned 403. Its start rule was not published without a reliable rendered-page check.
- **Glascow**: the Lookout Glasgow manual found during research is for a different identity, so it was rejected. The inventory title is *Glascow* (BGG 301716), not *Glasgow* (BGG 292615).
- **Gnome Hollow**: the publisher product page lists a rule book but its download link currently points to `#`; no rule was inferred from the page.
- **Vegas** (BGG 1255): the located Ravensburger/alea *Vegas* PDF is for Rüdiger Dorn's 2012 game (BGG 117959), not this Reiner Knizia inventory identity. The same-title manual was rejected.
- **Deep Sea Adventure**: the readily indexed English PDF is credited as a fan transliteration by Jeff Hohner, not the Oink Games booklet. The original publisher source remains to be inspected.

## Further source review: six identities

| Identity | Publisher/manual reviewed | Opening instruction and scope |
| --- | --- | --- |
| Tipperary | Lookout Games, English booklet at Spielezar mirror | Recent living-sheep viewer receives the bag; random selection is official. Standard placement is simultaneous, while an optional sequential variant begins with the bag holder. |
| Rondo | Schmidt Spiele, German booklet at Brettspiele-Report mirror | The “roundest” player starts; this is an English summary of the German instruction. |
| Sol: Last Days of a Star | Elephant Laboratories, official English PDF | Most recent person closest to the Sun starts; solo play has no multiplayer order. |
| Treelings | Edition Spielwiese, English booklet at Gamers HQ mirror | Tallest player gets the starting-player card and keeps it through the final round. |
| Tholos | Perro Loko Games, official multilingual PDF | More knowledgeable about the Olympus of the gods starts; any other means is an official alternative. |
| Super Kawaii Pets | Arcane Wonders, official English PDF | Last to pet an animal starts; in later games the First Player Card may pass left. |

The cited PDF pages were rendered and visually checked. Local source hashes and publisher-versus-mirror provenance are in each record's private evidence. Sol's 51 MB official booklet was streamed beyond the bounded intake script's 35 MB cap. The six entries are catalog-only; no portable random criterion was added.

**Held:** The available Topiary prototype PDF has different draft mechanics, the publisher's final rulebook URL returns 404, and a retailer final-rule PDF could not be resolved. The Great Heartland Hauling Co. publisher file is labeled work-in-progress version 0.52. Neither received a published rule without a checked final edition.

After this follow-up, `npm run content:validate` passes with 839 approved game rules and 356 eligible random rules. `npm run content:coverage` reports 798 of 1,333 discovered identities with a researched edition and 535 still awaiting primary-source research. Coverage counts do not assert that every edition is verified.
