# Supplementary native-title discovery

Retrieved and reviewed on 2026-09-26 UTC. The supplementary corpus and identity review remain separate from the original English snapshot and its existing review. The initial checkpoint enrolled18 primary-supported accepts. Subsequent reviews now enroll **39 accepts /249 holds /50 reviewed /238 unreviewed**, bringing the effective directory to **4,995 identities**. Every native identity decision still has false starting-rule and edition-transfer approval flags; approved rules use their separate exact-revision workflow.

The [latest picker/source checkpoint](sep26-picker-result-continuity-progress.md) leaves native decisions unchanged and prepares a separately reviewed Brass Pittsburgh semantic identity proposal with Wikidata-only numeric authority and explicit spelling/year/player/edition limits. It remains unenrolled. En Route418683's primary406454 conflict stays held; root has not completed that long primary collection review.

The [preceding manual and rule-search checkpoint](sep26-two-manual-rule-search-progress.md) approves separately reviewed Russian manual summaries for Spectacular and Yami and extends validated native discovery to the home lookup and public rules library. All native decisions/transfer flags remain unchanged. Search names follow existing approved identity attachments and never assign rules or alter approved aliases. Current rule coverage is887 sourced/4,108 pending among4,995 identities; Great Library remains pending a final source.

The [preceding identity and focus checkpoint](sep26-three-native-focus-progress.md) adds Spectacular, The Great Library and Yami as three distinct pending identities with exact primary numeric publisher hrefs. Complete previous holds remain preserved; original null disposition fields and source cache bindings are retained. Yami's competing product title and relationship to Kakapo do not approve a merge, alias or rule transfer. Validated alternate search names now total71 across24 accepted identities.

The [preceding CrowD checkpoint](sep26-crowd-four-identities-progress.md) adds Stars of Akarios, Aqua Garden and Harrow County with separately observed exact primary numeric hrefs, plus Dino Garden through semantic publisher/native-title/product corroboration with Wikidata-only numeric authority. Octex retains a reviewed human/musician misassociation hold. Dino's unbound image collection href remains distinct from numeric title proof; original sealed proposals and complete prior decisions are preserved. Below, the25-reviewed/18-accepted section and tables record the initial pass, not the current totals.

The subsequent [manual and native-search checkpoint](sep26-native-search-three-manual-progress.md) approves three separately reviewed English rules and enables search by66 distinct saved alternate titles across21 accepted native identities. Display names,36 accepted identities, all held decisions and rule-transfer flags remain unchanged. Alternate search terms never participate in edition assignment. The later [Akarios and home-continuity checkpoint](sep26-akarios-home-continuity-progress.md) adds a separately reviewed English summary of the exact Russian Akarios main manual; all four CrowD identities now have reviewed answers. Native acceptance and rule-transfer flags remain unchanged.

## Complete current pool

`wikidata-native-title-leads.json` preserves the complete current numeric P2339 pool for which no corresponding Wikidata item has an English label. The query has no limit. All 288 raw IDs and all 288 associated entities are retained, including native and `mul` labels, aliases, descriptions, P1476 original titles, every claim and qualifier/reference, item revisions and modification times. The saved query response, entity responses, canonical statement/entity maps and each entity have SHA-256 metadata.

This is a current live-query snapshot. The earlier English snapshot reported 288 omitted IDs without preserving their membership. Equal counts do not establish that the historic omitted pool was identical.

| Observation | Count |
| --- | ---: |
| Query ID/QID pairs | 288 |
| Distinct raw numeric P2339 IDs | 288 |
| Preserved Wikidata entities | 288 |
| IDs with a label or P1476 title | 288 |
| IDs with a `mul` label | 143 |
| IDs with a P1476 title | 27 |
| IDs already in the compared effective inventory | 20 |
| IDs with at least one review flag | 57 |
| Compared effective inventory size | 4,956 |

Flag counts overlap: 22 expansion/gamebook scope, 20 already listed, 11 title/alias collisions, four language-qualified ID claims, and one item with multiple current P2339 values. No candidate was dropped because its name could not be translated. `mul` is a language-neutral label, not evidence of an English-label field; the pool includes familiar originals such as Camel Up, Skyjo and Nucleum.

The comparison reproduces the existing effective inventory from `discovery-index.json`, the English Wikidata snapshot and its current identity decisions. Input file hashes are recorded. Matching uses exact raw IDs and normalized titles/aliases; it does not use fuzzy title similarity or invented translations. All languages and original text remain available for later language-specific review.

## Reproduce and validate

Run from the repository root:

```powershell
python scripts/import-wikidata-native-title-leads.py
python scripts/import-wikidata-native-title-leads.py --cached
python scripts/import-wikidata-native-title-leads.py --validate
```

The first command fetches official Wikidata Query Service/API structured data and writes this supplementary snapshot. `--cached` rebuilds using ignored cached responses. `--validate` checks the preserved snapshot and, when present, its separate decisions file; it performs no network requests. A fresh fetch changes snapshot hashes and requires reviewing/rebinding the decisions before they can validate again.

```sparql
SELECT DISTINCT ?item ?bggId WHERE {
  ?item wdt:P2339 ?bggId .
  FILTER(REGEX(STR(?bggId), "^[0-9]+$"))
  FILTER NOT EXISTS {
    ?labeled wdt:P2339 ?bggId ; rdfs:label ?en .
    FILTER(LANG(?en) = "en")
  }
} ORDER BY xsd:integer(?bggId) ?bggId ?item
```

Only the official [Wikidata Query Service](https://query.wikidata.org/) and [Wikidata API](https://www.wikidata.org/w/api.php) supply the candidate corpus. [Wikidata structured data is CC0](https://www.wikidata.org/wiki/Wikidata:Copyright). No BoardGameGeek API, dump, destination page or page content was requested. Two original designer/publisher pages contain numeric ID hyperlinks; only those primary-hosted href values were inspected.

## Separate primary identity decisions

`wikidata-native-title-decisions.json` records one decision for every candidate. In the initial pass, the13 previous unheld leads were independently reviewed, as were12 additional straightforward or potentially ambiguous products. That pass had18 identity accepts and270 holds:25 reviewed identities, seven reviewed holds and263 unreviewed. Every decision has `startingRuleApproved: false` and `editionRuleTransferApproved: false`; current totals are recorded above.

Accept is bounded to discovery identity/name evidence. It does not establish a starting-player rule, original publication year, localization or edition equivalence. The runtime enrolled these18 initial identities and continues to exclude held/unreviewed candidates; later reviewed accepts are recorded above. Source IDs, exact selected title/language, raw ID/QID, revision, matching P2339 statement IDs and hashes are recorded. Initial raw primary responses remain under ignored `artifacts/native-title-full-sept26/primary`; later checkpoints bind their separate preserved source bundles.

### Previous 13 unheld leads

| ID | Preserved native name | Outcome | Direct primary identity evidence |
| --- | --- | --- | --- |
| 156 | Abenteuer Tierwelt (`de`) | Accept | [Wolfgang Kramer catalog](http://kramer-spiele.hier-im-netz.de/spiele/spiele.htm): February 1985, RAV, U. Kramer. Its 2010 tiptoi entry is separate. |
| 263 | Manitou (`de`) | Accept | [Günter Burkhardt catalog](https://www.burkhardt-spiele.de/styled/index.html): 1997, Gold-Sieber; Big Manitou separately listed. |
| 281 | Ostindiska kompaniet (`sv`) | Hold | No accessible original publisher/author identity source obtained. |
| 429 | Magalon (`mul`) | Accept | [Wolfgang Kramer catalog](http://kramer-spiele.hier-im-netz.de/spiele/spiele.htm): February 1998, RAV. |
| 499 | Arbos (`de`) | Accept | [M+A author/publisher history](https://www.maspieleverlag.com/ueber-uns): Müller and Arnold identify their own game and its 2000 award. |
| 557 | Laguna (`mul`) | Accept | [Bernhard Weber catalog](https://www.bernhardweber.de/spiele.html): image alt identifies Queen Games 2000. |
| 1002 | Cosmic Eidex (`de`) | Accept | [ABACUSSPIELE product](https://abacusspiele.de/produkt/cosmic-eidex/): exact title, Urs Hostettler and product 08983. |
| 1055 | Paule Panik (`de`) | Hold | No accessible Ravensburger/author identity source obtained. |
| 1403 | Land unter (`de`) | Accept | [AMIGO designer interview](https://blog.amigo-spiele.de/stefan-dorra/): Stefan Dorra’s game. Its 2002 mention is not assumed to be the first edition. |
| 1806 | Rüsselbande (`de`) | Accept | [Schmidt/Drei Magier history](https://www.schmidtspiele.de/details-93/wer-erreicht-die-kleinste-auslage-mit-hilo-r-plus-kommt-noch-mehr-spannung-in-das-beliebte-kartenspiel.html): title, publisher and 2001. That passage does not establish the game’s designer. |
| 2537 | Der König der Diebe (`de`) | Accept | [Original designer Bruno Faidutti](https://faidutti.com/blog/blog/2012/05/01/draco-co/) directly links ID 2537 for Draco & Co; no translated-title guess or BGG fetch. |
| 2569 | Hick Hack in Gackelwack (`de`) | Accept | [AMIGO designer interview](https://blog.amigo-spiele.de/stefan-dorra/): Dorra’s title at Zoch. |
| 2965 | Kendo (`mul`) | Hold | Retheme/edition relationships with Kaiser König Edelmann remain unresolved by primary identity evidence. |

### Eight additional accepted language-neutral identities

| ID | Preserved `mul` title | Direct primary identity evidence |
| --- | --- | --- |
| 128667 | Samurai Sword | [dV Games](https://bang.dvgiochi.com/prod.php?id=11&lang=en): title and Emiliano Sciarra; Rising Sun separately listed. |
| 153938 | Camel Up | [Pegasus publisher catalog](https://pegasus.de/en/About-Us/Ludography/): 2014 entry. Cards, Supercup and the second edition are not merged. |
| 204135 | Skyjo | [Magilano catalog](https://magilano.com/en/collections/all): base product separated from Action, Junior and Voyage. |
| 245476 | CuBirds | [Original publisher Catch Up Games](https://catchupgames.com/nos-jeux/cubirds/): Stefan Alexander and Kristiaan der Nederlanden. |
| 258779 | Planet Unknown | [Adam’s Apple Games](https://adamsapplegames.com/planetunknown/): base game identity, with Supermoon separately listed. |
| 299169 | Spicy | [HeidelBÄR publisher page](https://error.heidelbaer.de/heidelbaer-games-de/spicy/): Zoltán Győri and 2020. |
| 396790 | Nucleum | [Board&Dice](https://boardanddice.com/nucleum/): 2023, Luciani/Turczi and literal ID 396790 href on the publisher’s page. |
| 397598 | Dune: Imperium – Uprising | [Dire Wolf](https://www.direwolfdigital.com/dune-imperium-uprising/): standalone product identity; no merger with base Dune or its digital expansion. |

The additional held reviews are Kariba 84732 (2010 versus present publisher editions), Skull King 150145 (new/previous editions unresolved for the 2013 item), Jump Drive 205597 (direct publisher retrieval HTTP 403), and Hitster 318243 (territory/edition unresolved). They have no rule approval. The earlier seven explicit holds remain held as well: Fluxx, Svea Rike, Svea Rike Batalj, Catan: Das Buch, Jägersro, Elfer raus! and Big Boss.

## Verification and next work

Offline validation reconstructs canonical ID/QID statement and full entity hashes, checks counts, exact item IDs/revisions, and a matching nondeprecated P2339 string statement per candidate. Decisions must bind to the exact snapshot byte/statement/entity hashes and reference preserved title/language, QID, revision, claim and source IDs. Accepts require retrieved direct primary author/publisher evidence and no unresolved snapshot flags or existing ID match. Cached source hashes are checked when those ignored caches are present.

`src/lib/content/board-games.ts` applies the same acceptance boundary at runtime, checks the selected title against the actual entity label/P1476, and rejects duplicate IDs or normalized discovery names. Both supplementary file mtimes/sizes participate in inventory cache invalidation. Original and English enrollment behavior is retained. The compared 4,956 identities plus 18 accepted additions yields 4,974 discovery identities; this is not a completed-rule count.

Focused content tests cover accepted native and `mul` names, exclusion of held/unreviewed identities, unchanged rule attachment, stale snapshot bytes, unknown primary sources, wrong revision, rule-transfer flags, duplicate references/IDs/names, and actual deprecated/mismatched P2339 statements. Hashes are deliberately rebound in the latter fixtures so a failing raw hash alone cannot mask an invalid identity claim.

Subsequent coverage expansion should use these independently accepted identities first and keep the remaining pool visible for bounded review. Language-qualified IDs, aliases that name variants, expansion/gamebook items, and edition conflicts require explicit resolution. A primary rule source must separately establish a portable starting-player criterion before any rule completion claim.
