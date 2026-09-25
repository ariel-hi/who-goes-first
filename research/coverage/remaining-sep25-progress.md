# Remaining-inventory source review — 2026-09-25

This batch covers 13 additional identities outside the separate 30-title priority list. Each approved catalog entry has a matching research draft, a source page reference, a source SHA-256 in its private evidence, and an exact approval revision. The PDF source cache under `research/source-files/` is ignored by Git; the six intake queues preserve the retrieval URLs. No criterion in this batch was added to the portable random mix because qualifying or selecting one player can be ambiguous, requires game context, or assigns a specific role.

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

## Held leads

- **Monster Mania** (Piatnik 2009): all four image-only booklet pages were rendered and inspected. No initial-player selection instruction was found; this is still pending a source that can support a useful edition answer.
- **LOOP and Popcorn** (IELLO): publisher PDF downloads timed out. They remain pending.
- **Rhino Hero: Missing Match**: the HABA-authored manual is indexed, but the retailer mirror returned HTTP 429 and the alternate mirror returned 403. Its start rule was not published without a reliable rendered-page check.
- **Glascow**: the Lookout Glasgow manual found during research is for a different identity, so it was rejected. The inventory title is *Glascow* (BGG 301716), not *Glasgow* (BGG 292615).
- **Gnome Hollow**: the publisher product page lists a rule book but its download link currently points to `#`; no rule was inferred from the page.

After rebasing on the updated main branch, `npm run content:validate` passes with 813 approved game rules and 356 eligible random rules. `npm run content:coverage` reports 790 of 1,333 discovered identities with a researched edition and 543 still awaiting primary-source research. Coverage counts do not assert that every edition is verified.
