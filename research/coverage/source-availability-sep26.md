# Rulebook source availability — 2026-09-26

Checked all 923 distinct source URLs in the approved catalog. These are availability checks, separate from editorial verification of the rule answers. The initial batch used the existing three-worker HEAD checker; eight failures were checked with a ranged GET. The remaining 823 used three workers, HEAD first, then a ranged GET when HEAD failed. Certificate validation stayed enabled. No failing request automatically changed a record.

| Result | URLs | Meaning |
| --- | ---: | --- |
| Reachable, HTTP 200 or 206 | 898 | The source responded during this audit; not a new factual review. |
| HTTP 403 | 19 | Access denied to the checker. Requires browser or publisher verification before calling the link broken. |
| HTTP 404 | 1 | The exact URL is missing. |
| Certificate failure | 4 | Normal HTTPS retrieval fails; do not bypass certificate validation. |
| DNS failure | 1 | The cited hostname does not resolve. |

## Verified repair

**Briefcase — Artipia English booklet:** the old `www.artipiagames.gr` hostname fails DNS. The same path on the publisher's bare domain works: <https://artipiagames.gr/files/Briefcase/Briefcase_ENG_Rulebook.pdf>. Downloaded the 12-page booklet, rendered and visually reviewed pages 2 and 3. The most recent business-meeting attendee starts, tied players choose randomly, and play continues clockwise. The existing answer matches. SHA-256: `7b4b187ef75f1925e1d30ae6c2c6c7ee37e23b0069b3f051753a00ab30c66794`. Updated only the approved entry's citation, review date, evidence, material update date and exact reviewed revision hash.

## Unresolved publisher links

- **20th Century — CGE:** `https://czechgames.com/files/rules/20th-century-rules-en.pdf` returns 404. The record already notes the earlier missing download and indexed-text review. The current CGE catalog did not expose a replacement for this edition. Do not substitute the unrelated *20th Century Limited* booklet.
- **Beyond Baker Street — Z-Man:** the cited `images-cdn.zmangames.com` PDF fails with an expired certificate.
- **Arboretum — Z-Man:** the cited `images-cdn.zmangames.com` PDF fails with an expired certificate.
- **Blueprints — Z-Man:** the cited `images.zmangames.com` PDF fails hostname certificate validation.
- **Chinatown — Z-Man 2014:** the cited `images.zmangames.com` PDF fails hostname certificate validation.

A replacement must match the reviewed edition and rulebook pages. The current Z-Man website and indexed publisher results did not yield a working equivalent during this pass. Retain the previously reviewed answers while researching accessible publisher copies; do not bypass security warnings or silently substitute another edition.

## Access-denied queue

The 19 HTTP 403 responses include Australia at F.G. Bradley's, Candy Match at Plasico, one Pegasus North America PDF, twelve Tesera PDFs, and four Lookout PDFs (Bärenpark, Oh My Goods!, Costa Rica and Agricola Revised). These responses may depend on server access policy. They remain unresolved availability checks, not confirmed missing sources.

Local raw results and rendered Briefcase pages are under the ignored `artifacts/` directory (`growth-source-links.log`, `growth-source-get-check.json`, `growth-remaining-source-links.json`, and `source-link-replacements/`).

## Browser follow-up — 2026-09-26 UTC

Four of the 19 access-denied results loaded as real PDFs in ordinary Chrome, with certificate validation intact and no security-warning bypass:

| Citation | Browser result |
| --- | --- |
| Bärenpark | Publisher product page links the cited English PDF; the browser follows to the `www` hostname and renders six pages. Page 3 visually confirms setup step 8 and clockwise play. |
| Oh My Goods! v1.5 | Exact cited URL renders a 12-page English booklet. |
| Costa Rica | Exact cited URL renders a four-page English Mayfair booklet. |
| Agricola Revised Edition | Exact cited URL renders a 12-page English booklet. |

The original checker counts above remain the audit snapshot. The four Lookout links are browser-accessible; the other 15 access-denied results remain unverified. Do not replace the Lookout citations or refresh catalog review dates solely because the automated requests failed. This follow-up is an availability check, except for the explicitly described Bärenpark page inspection; it is not a new full editorial review of the other three answers.

## 20th Century source repair — 2026-09-26 UTC

The earlier unresolved CGE download now has a verified publisher-hosted replacement: [20th Century English rules at Rio Grande Games](https://www.riograndegames.com/wp-content/uploads/2013/02/20th-Century-Rules.pdf). The download returned HTTP 200 with normal certificate validation and is a seven-page PDF (5,801,640 bytes), SHA-256 `cf6db3164aac817ffd470e3fe50cafba3b5c03f78d7d08c14d8361aa33fb6dc8`.

Rendered PDF pages 2, 3 and 7 identify the garbage-sorting starter, later-round catastrophe criterion, opening auction and clockwise bidding. The credits explicitly name Czech Games Edition and October 2010. The existing answer and clarifications match. The PDF uses two-page spreads: printed pages 2, 4 and 5 correspond to PDF pages 2 and 3. Updated the citation, accurate edition label, PDF references, review date, evidence and exact reviewed revision under the owner's standing authorization. No tie-break was invented, and the answer remains outside the portable random mix.

The old CGE file remains unavailable, so byte equivalence cannot be established. The new source is cited openly as CGE-authored and Rio Grande-hosted; it is not the unrelated *20th Century Limited*. The original audit counts remain historical; all four Z-Man certificate failures and the remaining access-denied queue still require follow-up.
