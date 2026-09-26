# Popular games batch 2, 2026-09-26

Started from origin/main c83c685 in the isolated popular-games worktree. Pulled before researching and checked existing names and aliases before creating records. No same-edition duplicate was introduced. Batch 1 at c83c685 was verified live: all nine edition pages and directory links returned HTTP 200, the search index contained 926 records, and thin directory pages retained noindex.

## Reviewed records

Each new game has a research draft, an exact-revision approved public record, and its own commit. Source hashes and custody details are in internalEvidence; cached PDFs and inspected page renders are ignored under research/source-files/popular-sep26-02.

| Rank | Game | Edition and source | Opening |
| --- | --- | --- | --- |
| 129 | SCOUT | One More Game original English rules, publisher hosted | Any starting-player method; clockwise turns and later-round rotation |
| 130 | Camel Up | Lookout English second edition, publisher hosted | Youngest takes marker and first action |
| 131 | Skull | Space Cowboys English pink edition, publisher hosted | Most recent giver of flowers or a skull; first player places opening disc last |
| 132 | Tokaido | Funforge original English rules, archived mirror | Random starting lineup; rearmost Traveler acts; two-player neutral Traveler retained |
| 135 | T.I.M.E Stories | Space Cowboys English base game, publisher hosted | Random first Base reader; group-chosen action order during play |
| 136 | Shadows over Camelot | Days of Wonder English base game, publisher hosted | King Arthur, otherwise youngest |
| 138 | That's Pretty Clever! | Existing Schmidt edition, title aliases repaired | Existing random-start rule retained; no duplicate record |
| 139 | Marvel Champions: The Card Game | FFG core-set Learn to Play, publisher hosted | Group chooses first token holder |
| 140 | Decrypto | Le Scorpion Masqué English rules, publisher hosted | Simultaneous clue preparation, White Encryptor reads first |

T.I.M.E Stories requires visual inspection: the PDF contains hidden French setup text that differs from the visible English callout on page 15. The record follows the visible English instruction, which selects the first reader without explicitly naming the first Time Captain. Tokaido's current publisher website was unavailable; the reviewed Funforge-authored original manual has visible publisher credits and its mirror hosting and edition scope are disclosed publicly.

After rebasing onto the shared release at 547f896, the batch contains nine new records and the Clever alias repair. Camel Up's original Eggertspiele manual was independently reviewed from a disclosed archive after the former Pegasus download returned 404. The original maps only to 153938; the Lookout second edition maps only to 260605. Both select the youngest player. Strict name/alias coverage is 302/1,062; 760 remain. Next uncovered rank is 141, Castles of Mad King Ludwig.

The batch importer now checks the full directory inventory, including accepted native identities, before appending discovery entries. This prevents the duplicate Camel Up identity found during the rebased build. Tests retain exact edition assignments and identity uniqueness without hard-coding catalog totals that change with every batch.

## Verification

The final rebased batch passed content validation (966 approved rules, 373 usable random rules), Astro checks with zero errors/warnings/hints, ESLint, and all 153 tests in 16 files. The production build passed its audits across 1,127 pages and 30,509 internal links, using the live canonical origin, owner contact and Cloudflare privacy disclosure. The main-push hold was lifted after the shared release passed production checks. No application UI files were changed by this batch. Live verification follows deployment.
