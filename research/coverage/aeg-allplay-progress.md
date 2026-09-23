# AEG and Allplay source batch — 2026-09-23 UTC

Twenty AEG edition records and one Allplay record were added as unapproved drafts. All starting instructions were read from rendered publisher PDF pages, including image-only optimized manuals. File hashes, exact page locations, check dates and edition labels are retained in each record.

Public AEG product pages were discovered through its public WordPress page catalog and matched to the research inventory. Linked manuals were then downloaded from the publisher's own domain. Duplicate product pages, expansions that were not the selected game, score sheets and unrelated downloads were not counted as new answers. Walking in Burano's product page looped through redirects; its publisher-hosted manual was found through search and read directly.

The added entries are Number Drop, Shake That City, Wormholes, Sheepy Time, Ecos: First Continent, Dog Lover, Calico, Smash Up's comprehensive rules, three separately named Smash Up expansions, Cat Lady, Santa Monica, Dice City, Trains, Planes, Oath of the Brotherhood, Walking in Burano, two editions of Valley of the Kings, and Allplay's Chomp.

Important distinctions:

- The [original Valley of the Kings manual](https://www.alderac.com/wp-content/uploads/2017/11/VotK_Rulebook.pdf) chooses the most recent museum visitor. The [Premium Edition manual](https://www.alderac.com/wp-content/uploads/2019/04/VotKPremium_rulebook_v2-8.pdf) chooses randomly. Both records identify their edition and cite the other source for the difference.
- Wormholes, Dog Lover and Walking in Burano expressly allow random selection. Planes adds that alternative on its reference sheet, even though the longer setup text only mentions air travel.
- Number Drop's criterion is the earliest console purchase. It chooses the first dice roller; the grid-writing phase normally happens simultaneously. Shake That City likewise selects an active player before the others choose colors.
- Cat Lady and Dog Lover have a neighbor place an obstructing token during setup. That neighbor does not thereby become the first player. Santa Monica's reverse-order feature selection is likewise separate from its first turn.
- The comprehensive Smash Up manual has an ordered list of fantasy criteria and an explicit group-choice fallback. Its formal faction-drafting sidebar is a separate random choice. The three expansion manuals have their own ordinary first-turn criteria.
- Both Calico beginner and standard setups use the same starting instruction.

## Corrected identity collision

The inventory's Chomp is BGG 377449, Allplay's dinosaur game. It is unrelated to the simultaneous Gamewright card game Chomp!, despite their normalized names matching. `identity-overrides.json` now excludes the Gamewright entry from that inventory identity. The [Allplay product page](https://allplay.com/board-games/chomp) links the [actual dinosaur-game manual](https://assets.allplay.com/board-games-chomp-rulebook-link.pdf), whose setup instruction was inspected separately. Both games retain their own searchable answers. Unit and browser regression checks cover the separation.

This correction removes one false name-based coverage match from earlier checkpoints. After this batch and the Thames & Kosmos additions there are 160 rule records, covering 144 inventory identities, with 1,176 still pending. Fourteen researched games are outside the inventory; Spin Circus and Valley of the Kings each have two edition records. Research remains implementation work, and all publication still needs human approval.

## Reproducibility and remaining leads

`aeg-source-queue.json` and `aeg-allplay-extra-source-queue.json` preserve the explicit source queues. `aeg-batch.json`, `aeg-burano-batch.json` and `allplay-chomp-batch.json` preserve manually written answer inputs. The shared cache/preparation scripts do not infer facts or approve records. Downloaded manuals and renders are private, ignored research files.

Zoo Vadis's AEG and Bitewing product pages did not expose a direct rulebook link in the inspected HTML. It remains pending; no third-party summary was substituted for a publisher-checked answer. The publisher [EmperorS4 catalog](https://en.emperors4.com/game) and [Allplay catalog](https://allplay.com/board-games/) are additional leads for future inventory research, not completed imports.
