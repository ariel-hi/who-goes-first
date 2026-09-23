# Zoch source batch — 2026-09-23 UTC

Five additional inventory titles now have researched drafts: Beasty Bar, Alles Tomate!, Für die Katz, Ist da wer?! and Pechvogel. This follows the separately documented Niagara entry in `rio-grande-progress.md`. All are unapproved and available only in local editorial previews.

The publisher's two-page category listing exposed 91 product entries, seven of which matched normalized inventory titles. Niagara and Tobago already had researched editions, leaving five new matches. Their product pages linked nine PDFs. The five complete rulebooks were used; the other four files were a reference sheet, two print-and-play adaptations and a phone-stand template. The presence of a downloadable PDF alone was never counted as a rule.

| Game | English PDF pages inspected | Starting instruction |
|---|---|---|
| Beasty Bar | 12 | Wildest outfit; clockwise play |
| Alles Tomate! | 2 | Most recent tomato eater reveals the first card; everyone may answer |
| Für die Katz | 7–8 | Most recent cat petter becomes cat seeker; the others help cooperatively |
| Ist da wer?! | 7 | Most recent animal petter shakes the thicket; everyone then grabs simultaneously |
| Pechvogel | 10 | Nearest home to the Bakersfield address specified by the English section |

Each entry has a rendered-source inspection, source URL, actual check date, page location and local PDF hash. No language was inferred from the German game title. The English sections of the multilingual files were read. Pechvogel's rule is attributed to its specific English edition; the address is not independently represented as a real geographic location.

`scripts/research-zoch.py` matches the current publisher category page against the inventory, skips already researched names, and caches linked PDFs with three workers, 25-second timeouts, three HTTPS redirects, a 35 MB file limit and a 100-product cap. It accepts only the publisher and the two publisher-group download hosts actually linked by the product pages. It creates research leads, never rules or approvals. Its title matching is not exhaustive; translated game names and older products require additional research.

The first intake missed PDFs with uninformative labels such as “SR” or a bare product name. The revised intake considers the linked PDFs and leaves identifying the correct rulebook to source review. `research/zoch-batch.json` holds the manually written answers used by `scripts/prepare-source-batch.py`.

At this batch's checkpoint, 131 rule records covered 117 of the 1,320 inventory identities, leaving 1,203 without researched answers. The task remains incomplete.
