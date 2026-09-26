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
