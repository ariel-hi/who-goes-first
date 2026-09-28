# Original-artifact follow-up to the Smithsonian/NYPL pilot — 2026-09-28

This bounded follow-up revisited four leads from the [50-record/NYPL pilot](sep28-museum-cc0-pilot.md)
against the **5,246 identities live at `624c017395d89fd726e43de756dea4dc532b545d`**.
Two narrowly scoped physical-game identities are staged in
[`publisher-identities.json`](publisher-identities.json), taking this branch's
directory to **5,248**. They are identity-only records: no starting-player rule,
BoardGameGeek ID, image, or edition-rule transfer is approved.

| Lead | Decision | Original-artifact evidence and scope |
| --- | --- | --- |
| [*The Road to the Temple of Honour and Fame*](https://old-digitalcollections.nypl.org/collections/the-road-to-the-temple-of-honour-and-fame) | Accept one J. Harris 1811 board/cover identity | The [cover scan](https://old-digitalcollections.nypl.org/items/b3217330-74a7-0130-9c65-58d385a7bbd0) visibly prints the title, “A New Game,” and “Published London by J. Harris.” The [board scan](https://old-digitalcollections.nypl.org/items/aaef6f00-74a7-0130-e705-58d385a7bbd0) prints the matching title and describes an instructive and entertaining game. NYPL's collection catalog dates the board and cover to 1811. The associated [rules title page](https://old-digitalcollections.nypl.org/items/bbec4250-74a7-0130-ec8f-58d385a7bbd0) is **1810**. That earlier imprint is preserved as a limitation; it supplies no rule for the 1811 record. |
| [Ideal *The Telephone Game*](https://americanhistory.si.edu/collections/object/nmah_1213645) | Accept one Ideal Spellbinders No. 2410 teacher-game identity | The original box front in Smithsonian image `NMAH-AHB2006q21623` visibly prints the Ideal Spellbinders mark, product **No. 2410**, and “THE TELEPHONE GAME” beside physical board/components. The [IIIF manifest](https://ids.si.edu/ids/manifest/NMAH-AHB2006q21623) independently catalogues Ideal School Supply Co. as maker, 1976 as date made, and the board, teacher guide, cards, die, and pieces. No other Telephone Game product is joined. |
| [*In the Chips: Silicon Valley*](https://americanhistory.si.edu/collections/object/nmah_1344260) | Hold | Smithsonian's original box photos show the “Silicon Valley” local investment subtitle and **Tega** brand on the side, with a Tega copyright line. The museum catalog calls Intel Corporation the maker and dates the object to circa 1995. The original packaging and museum maker attribution do not establish the same publisher. Do not enroll it as an Intel game or silently substitute Tega without a reconciled issuer/imprint. |
| [*Pot Luck*](https://americanhistory.si.edu/collections/object/nmah_2045653) | Hold | The museum's one box photo establishes the physical title. Its curatorial account attributes creation to R. Winston Carroll and describes two 10,000-copy printings. The photographed face does not establish a legible issuing publisher or which printing this box represents. |

For the two accepts, both the qualified directory name and its unqualified search
alias were checked against the exact active-name projection from the 5,246 live
identities. All four normalized names were absent. No numeric external identity
was invented. Each accepted record carries a fixed ID, original-artifact source
locator, byte count, SHA-256 digest, review revision, and a narrow issue scope.
The [rebuild/validation script](../../scripts/prepare-museum-identity-batch.mjs)
checks the six source bytes and both saved record revisions.

Source rights are distinct from metadata rights. NYPL's public-domain statement
is qualified to United States law; the release's catalog metadata is CC0.
Smithsonian marks its object photos **Usage Conditions Apply** and its IIIF
manifest metadata **CC0**. The original artifact photos were read for title,
imprint, and product-number facts. No image file was committed, copied into the
site, or described as CC0. The `primary-publisher` source kind refers to the
publisher-authored *printing visible in a museum scan*, not to the museum as
publisher. Smithsonian's Tega and Pot Luck photographs remain leads only.

Validation on this branch: the original pilot's fixed source/decision audit,
the six new source hashes and two identity revisions, `npm run content:validate`,
the identity/content unit tests (40 passing), and `npm run content:coverage`
(5,248 identities). Main and preview are held for a separate exact live SHA and
release window.
