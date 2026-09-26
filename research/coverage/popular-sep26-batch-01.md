# Popular games continuation, 2026-09-26

Started from origin/main 3dc73a7 in an isolated checkout because the original checkout has unrelated uncommitted edits. Pulled origin/main before researching.

Strict name/alias matching (case, accents and punctuation ignored) initially found 271 of 1,062 targets covered and 791 remaining. Unlike the old snapshot, this does not silently drop edition suffixes or infer alternate titles. Known alternate titles need explicit reviewed aliases. Null-ranked appended classics follow the numbered popularity list.

## Duplicate audit

Checked all same-name groups involving Claude-approved records, plus intersecting aliases. No same-edition duplicate remained at this starting revision. Retained original/revised Agricola; classic/2023 Clue; distinct Hasbro Risk manuals; Mattel/Hasbro Scrabble; original/premium Valley of the Kings; and the unrelated Gamewright/Allplay Big Top and Chomp games. Race for the Galaxy and Roll for the Galaxy share the abbreviation RftG but are different games. No records were removed merely for sharing a name or abbreviation.

## Batch records

Nine additions have a preserved research draft and exact-revision assistant approval under the owner's explicit authorization. Each game was committed separately. Publisher PDF bytes are cached in ignored `research/source-files/popular-sep26/`; their SHA-256 values are preserved in each record's internal evidence.

| Popularity rank | Game | Reviewed source | Opening and scope |
| --- | --- | --- | --- |
| 30 | Quacks / The Quacks of Quedlinburg | Schmidt English rules, pages 2–4 and 7–8 | Last cook coordinates the Fortune Teller deck; simultaneous brewing and later rotation retained |
| 63 | Five Tribes: The Djinns of Naqala | Days of Wonder English rules, pages 2–3 | Random bid order, then bid-determined action order; zero-bid precedence and two-player markers retained |
| 65 | Magic: The Gathering | Wizards comprehensive rules, rules 103.1 and 103.8a | Choose the person who chooses the starter; ordinary two-player scope and rematch/draw exceptions |
| 87 | Cartographers | Thunderworks English rules, pages 4–6 | Shared explore reveal and simultaneous drawing; no designated individual starter |
| 88 | Saboteur | AMIGO English rules, both sheets | Youngest first; distinct later-round starter; one portable random-mix addition |
| 103 | Dominion: Intrigue | Rio Grande second-edition introduction plus Dominion page 4 | Explicit base-rule dependency, random opening and previous-winner rematch exception |
| 105 | Sky Team | Scorpion Masqué Landing Procedure, pages 3–4 | Blue Pilot starts introductory Montreal scenario; altitude arrow controls each round |
| 107 | A Feast for Odin | Feuerland English rules, pages 8–9 | Random moose holder; last Viking placer starts the next action phase |
| 109 | Istanbul | Pegasus English Big Box rules, pages 6 and 8 | Random starter and clockwise play; base-game scope and starting money retained |

Quacks (rank 30) was initially held because CMYK's product pages exposed no English manual. Follow-up located Schmidt's English product page: its relative PDF link is broken, but the listed PDF resolves at the publisher's root files directory. Reviewed and added that distinct English edition with the target's short-name alias. The existing German-manual summary remains clearly labeled; neither claims CMYK revised-artwork rules. That's Pretty Clever still needs an explicit alias review rather than another duplicate record.

Integration added eight directory identities (Quacks already had an identity) and one portable rule. Strict target coverage is now 280/1,062, with 782 remaining. Validation and live deployment results follow below.

## Release checks

The final nine-game batch passed `npm run content:validate` (926 approved rules, 368 random-mix rules), `npm run check` (zero errors/warnings), `npm run lint`, and `npm test` (55 tests in nine files). The production build used the live canonical origin, owner contact, Cloudflare Pages host name and current public privacy disclosure. Its audits passed for 2,342 pages and 30,101 internal links, including exact canonicals, indexing, sitemap parity and private-content exclusion. No application UI files were changed.
