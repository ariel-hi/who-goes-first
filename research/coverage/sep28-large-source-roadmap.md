# Larger identity-source audit — 2026-09-28

This is a discovery roadmap for physical board, card, dice, and tile games. The
current live directory count supplied for this task is **5,244 identities / 1,135
sourced rules**. Source record totals below are *not* estimates of new games.
No new game identity or starting-player rule was accepted from this audit.

## Source decisions

| Source | Verified size and scope | Reuse and identity decision |
| --- | --- | --- |
| [AGPI Game Catalog](https://gamecatalog.org/) | Site reports **24,951 game records** and 4,662 publishers. Its [scope statement](https://gamecatalog.org/about/) targets indoor games with Latin-alphabet titles, especially 1800–1960; [search results](https://gamecatalog.org/search/) show separate cover/printing variants and even expansion products. | Its [FAQ](https://gamecatalog.org/faq/) explicitly permits referring to stable AGPI-G identifiers in one's own database, but gives no bulk data-reuse grant. The [contributors page](https://gamecatalog.org/contributors-to-the-agpi-archives-game-catalog/) says several source collections were included *with permission from their providers*; the site footer reserves rights. Use individual IDs as citations and discovery references only. Do not copy or crawl the 24,951 records as a corpus without a grant. An AGPI record is often a product or variant, not a distinct playable ruleset. |
| [U.S. Copyright Office 2026 public dataset](https://www.copyright.gov/economic-research/usco-datasets/) | Official **Toys or Games** tabular CSV is 3,934,859 bytes, SHA-256 `48d0e4021f1551799522281d6f06de3746d054c040d1a36d61c6ffeeddacfa5b`; **9,483** registrations, nearly all dated 1978–1983 despite the parent dataset spanning 1978–2025. | The Office expressly offers [bulk CSV downloads](https://www.copyright.gov/newsnet/2026/1080.html) for research. Its federal data compilation is not a privately licensed game database; [17 U.S.C. §105](https://www.copyright.gov/title17/92chap1.html) addresses federal works, while third-party deposited artwork/text has separate rights. Reuse only bare registration facts and links; do not republish registrant contact fields, descriptions, artwork, or rules. This category is not a vetted physical-game list. Registration does not prove a product was sold. |
| [Smithsonian Open Access](https://www.si.edu/openaccess) | Smithsonian's [collection search](https://collections.si.edu/search/results.htm?q=%22Board+games%22) showed **451** results for the broad phrase “Board games”; examples include books, articles, archival files, and objects. Its [official open-data repository](https://github.com/Smithsonian/OpenAccess) advertises more than 11 million metadata records, but was archived in May 2026 and points to a public S3 archive. | The official repository is CC0, and Smithsonian explains that collection *metadata* can be CC0 even for restricted objects. Use record-level object type, maker, accession, and object title as leads; preserve each item's rights state separately for images. Search result count is not eligible-game count. |
| [NYPL Digital Collections](https://digitalcollections.nypl.org/about) | Provides API and bulk metadata, including a [public-domain item snapshot](https://github.com/NYPL-publicdomain/data-and-utilities). That GitHub snapshot was captured in 2015 and archived in September 2026; current records require the NYPL API. No game-specific count established in this audit. | NYPL explicitly dedicates its Digital Collections metadata to CC0. Query game-related physical objects, then exclude catalogs, rule books, scans of pages, puzzles, and duplicate views of the same object. Check each media item's rights independently. |
| [Hasbro instruction archive](https://instructions.hasbro.com/en-us/all-instructions) | Official archive displayed **3,952** instruction results, mixed toys, base games, licensed versions and expansions. Product number is a useful edition key. | [Hasbro terms](https://docs.hasbro.com/en-us/legal/terms) limit site use to individual noncommercial access and prohibit automated access without authorization. No automated catalog extraction for this ad/affiliate site. An individually inspected product can serve as an exact edition corroboration if access and use are otherwise permitted. |
| [Ravensburger US games catalog](https://www.ravensburger.us/en-US/products/games) | Official six-page current games section includes base games, branded variants, travel editions, single-player puzzles, and licensed lines; no total was asserted. | [Site terms](https://www.ravensburger.us/en-US/start/terms-of-use) prohibit data mining and automated scraping and limit redistribution. Treat as a manual, one-product-at-a-time corroboration source only where appropriate; no automated catalog pipeline. |
| [Ludii / Digital Ludeme Project](https://ludii.games/downloads/DLP_Database_Guide.pdf) | A downloadable historical/traditional-game database, with game descriptions and cultural evidence. It models game forms rather than retail editions. | The project's [published code repository license](https://github.com/Ludeme/Ludii/blob/master/LICENSE) is CC BY-NC-ND 4.0; this audit found no separate commercial-reuse grant for the database. Downloadable status alone is not permission for this commercial site's derivative directory. Hold bulk import. |
| [BGG XML API and ranks CSV](https://boardgamegeek.com/xmlapi/termsofuse) | Broad modern-game coverage, but the [ranks CSV is explicitly part of the API for licensing](https://boardgamegeek.com/wiki/page/BGG_XML_API2). | API terms grant only strictly noncommercial reuse absent a commercial agreement. No bulk import or laundering through third-party mirrors. Existing CC0 Wikidata P2339 facts were handled separately and are already represented. |

## Reproducible U.S. Copyright Office probe

The publisher's [2026 dataset page](https://www.copyright.gov/economic-research/usco-datasets/)
links the exact file under **Registrations → Tabular → Toys or Games**:

`https://data.copyright.gov/Registrations/Tabular/reg_toy_or_game_2026_01.csv`

Download it to an ignored `artifacts/` directory, then run:

```powershell
python scripts/profile-usco-toy-game.py artifacts/coverage-research/usco-toy-or-game-2026-01.csv
```

The script verifies the column shape and prints aggregate counts only. For the
hash above it reports **9,483 unique registration numbers**, **8,375 distinct
normalized titles**, **6,273 `PUB` / 3,210 `UNP`**, **6,216** published records
with a publication-date field, and **1,908** published records with a nonempty
publisher field. Some publisher values are placeholders such as `s.n.]`.
Only **51** `PUB` records contain the literal phrases “board game,” “card game,”
“dice game,” or “tile game” in the selected text fields; **21** of those have a
nonempty publisher field. This is a narrow precision probe, not a recall estimate.
**235** registration titles normalize exactly to a title in the original,
Wikidata, or publisher lead files. That is a collision warning, not an edition
match or a count of duplicate products.

Sampled category rows include a novel, an operating manual, frame-tray puzzles,
game artwork, and repeated deposits alongside plausible card games. Some
same-title card games appear under separate `VA` and `TX` registration numbers.
The `PUB` marker and date describe a copyright record, not verified retail
availability, physical components, or starting-player rules. No entry from this
file meets the project's product-identity acceptance bar by itself. The CSV is
kept only in ignored local research storage; no claimant personal data enters Git.

## Coverage pipeline

1. **Open cultural metadata pilot.** Take bounded Smithsonian and NYPL object
   slices (for example 50 records each), retain source URL/accession/rights
   status, then manually score object versus book, page, artwork, toy, puzzle,
   or actual tabletop game. Measure *verified new physical products per 50*;
   scale only if that yield is worthwhile. Map museum accession to an object
   instance, then separately decide the represented product and edition.
2. **Historical records.** Search USCO candidate registrations as leads and
   corroborate each against an independent primary object record, manufacturer
   catalog, surviving publisher documentation, or a photographed physical box
   with a trustworthy provenance chain. Do not convert `reg_num` to `gameId`;
   multiple registrations can describe one product and one title can describe
   different games. Use AGPI-G IDs for comparison/citation only, with the same
   independent product evidence.
3. **First-party catalog expansion.** Continue bounded publisher-specific
   batches that permit the planned access, prioritizing sites with stable product
   URLs and SKU/GTIN or article numbers. The existing Oink and SimplyFun audits
   show the project acceptance form: exact publisher page, physical components,
   SKU/article where available, hash/receipt, and explicit hold decisions for
   expansions or ambiguous variants. Review site terms before every new
   automated pipeline. Hasbro and Ravensburger are excluded from automation by
   the current terms above.
4. **One identity, one scope.** Compare candidate title against all existing
   normalized names, numeric IDs, aliases, product URLs, SKUs and GTINs. Same
   name is a manual collision; different packaging is not automatically a new
   ruleset. Preserve source-specific `product`, `edition`, `reprint`,
   `expansion`, `collection`, and `object instance` roles. Publish an identity
   only for a verified physical base game or genuinely distinct edition, and
   attach a rule only after a matching primary manual has been reviewed.
5. **Measure gain honestly.** For each 50-lead batch, report source count,
   excluded records, existing identities, unresolved collisions, accepted
   product identities and independently sourced opening rules. Keep raw evidence
   ignored, commit compact provenance and decisions, run content validation and
   full build in the isolated worktree. Release waits for the separately supplied
   exact live SHA and exclusive window.

The biggest published totals are useful for finding leads, but none of these
totals can be added to the 5,244-directory count. At present, the freely
reusable sources with promising expansion paths are Smithsonian and NYPL CC0
metadata, followed by carefully corroborated federal registration facts.
