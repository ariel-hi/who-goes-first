# Popular board game target list

Date: 2026-09-25

## Source

BoardGameGeek rankings snapshot for 2026-09-25 from the public
[beefsack/bgg-ranking-historicals](https://github.com/beefsack/bgg-ranking-historicals)
dataset (`2026-09-25.csv`, 31,362 ranked games). The file is BGG's daily rank export: ID, name, year, overall rank,
average, Bayes average and number of ratings. Only ranked items are included, so expansions are already excluded
(BGG does not give expansions an overall rank). The BGG browse pages returned HTTP 403 to scripted requests.

## Method

- `rank` is popularity order by BGG "Users rated" (number of ratings), which tracks how widely known a game is better
  than BGG's quality rank. `bggRank` and `usersRated` are also recorded.
- The list is the top 1,000 games by number of ratings, plus the 6 games in BGG's overall top 250 that fell outside
  that cut (1,006 ranked entries; the 1,000th game has 5,600 ratings).
- 56 mass-market classics outside the cut (for example Candy Land, Chutes and Ladders, Trouble, Operation,
  Catan Junior, Mancala/Kalah, Parcheesi/Pachisi, Hedbanz, Old Maid and Go Fish) are appended with `rank: null`
  and a `note`. Classics already inside the cut, such as Monopoly, Risk, Chess, UNO, Scrabble and Clue, keep their
  popularity rank. Only KerPlunk has no `bggId`, because it has no ranked BGG entry.
- Coverage: an entry is `covered: true` when any `src/content/games/*.json` record's `gameName` or `aliases`
  matches the entry name, or a known alternate name, after lower-casing, removing accents and punctuation,
  replacing `&` with `and` and dropping a leading "The". `coveredBy` gives the matching record id. Four entries
  match only after edition suffixes are removed and are flagged `coverageMatch: "edition-insensitive"`
  (7 Wonders (Second Edition), Rococo, Cat in the Box: Deluxe Edition, That's Pretty Clever!). A short manual
  list maps BGG renames to catalog names, for example Quacks to The Quacks of Quedlinburg and Neuroshima Hex to
  Neuroshima Hex! 3.0.

## Counts

| | Entries | Covered | Uncovered |
|---|---:|---:|---:|
| Ranked (popularity) | 1,006 | 188 | 818 |
| Appended classics (`rank: null`) | 56 | 0 | 56 |
| **Total** | **1,062** | **188** | **874** |

Of the top 100 by popularity, 33 are covered.

## Top 60 uncovered, by popularity

1. Terraforming Mars
2. 7 Wonders Duel
3. Scythe
4. Agricola
5. King of Tokyo
6. Puerto Rico
7. The Castles of Burgundy
8. Power Grid
9. Gloomhaven
10. Root
11. Spirit Island
12. Ark Nova
13. Brass: Birmingham
14. Dune: Imperium
15. Race for the Galaxy
16. Jaipur
17. Pandemic Legacy: Season 1
18. Citadels
19. Stone Age
20. Viticulture Essential Edition
21. Munchkin
22. Twilight Struggle
23. Bohnanza
24. Lost Cities
25. Betrayal at House on the Hill
26. Mysterium
27. Dead of Winter: A Crossroads Game
28. Star Realms
29. Arkham Horror: The Card Game
30. Robinson Crusoe: Adventures on the Cursed Island
31. Concordia
32. Five Tribes: The Djinns of Naqala
33. Great Western Trail
34. Magic: The Gathering
35. Heat: Pedal to the Metal
36. The Resistance
37. Santorini
38. Exploding Kittens
39. Gloomhaven: Jaws of the Lion
40. Chess
41. Sushi Go Party!
42. Mansions of Madness: Second Edition
43. Hive
44. Arkham Horror
45. Monopoly
46. Eldritch Horror
47. Risk
48. Nemesis
49. The Mind
50. Battlestar Galactica: The Board Game
51. Caverna: The Cave Farmers
52. A Game of Thrones: The Board Game (Second Edition)
53. The Resistance: Avalon
54. Cartographers
55. Saboteur
56. Star Wars: Rebellion
57. Machi Koro
58. Orléans
59. Galaxy Trucker
60. Just One

## Caveats

- Matching uses names only. A catalog record for a spin-off or a different edition (for example Eclipse: New Dawn
  for the Galaxy compared with BGG's Eclipse: Second Dawn for the Galaxy) does not count as coverage.
- Some BGG entries are compilations or reprints, such as Dice Throne: Season Two – Battle Chest. They are kept
  because BGG ranks them as standalone games.
