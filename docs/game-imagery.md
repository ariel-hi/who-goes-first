# Rule-page imagery

## Original game cards

`GameArt.astro` draws original geometric cards, seeded by the game name, with a
simple motif drawn from the starting rule. These are decorative site artwork,
not reproductions of packaging or publisher logos. The inline SVGs add no
requests, fonts, dependencies, or client JavaScript.

## Official Amazon badge

Downloaded 2026-09-27 from the download linked by
[Associates Central trademark guidelines](https://affiliate-program.amazon.com/help/operating/amazonmarks/).

- [Official archive](https://m.media-amazon.com/images/G/01/AdProductsWebsite/images/AUX/brand-usage/Available_at_Amazon_US_Ex.zip)
- Archive member: `Available_at_Amazon_US_Ex/Available_at_Amazon_US_EN/Available_at_Amazon_US_EN_stacked/For_Screen/available_at_amazon_US_EN_logo_stacked_RGB_SQUID.png`
- Local file: `public/brand/available-at-amazon.png`, copied byte for byte.
- SHA-256: `0f3e8dac9e68f7739b589fb005c4e69ca079c3d8596171d76c1be083b4f6a795`
- Dimensions: 1500 × 723 pixels; file size: 42,917 bytes.
- Rendered width: 96 CSS px, exceeding the 90 px stacked minimum and giving
  192 device pixels on a 2x screen (180 minimum).
- Clear space: 24 CSS px on every side, greater than the height of the Amazon
  lettering at this scale. The solid white tile provides contrast in both themes.
- No colour changes, filters, cropping, outlines, animation, rotation, or added
  elements inside the artwork. Padding and the tile sit outside the image.
- The card links to Amazon, preserves the Associates disclosure immediately
  underneath, and includes Amazon's required trademark attribution.

Keep this file unchanged. Recheck the official guidelines before changing its
placement or replacing the asset.

## Optional licensed box art (prepared, disabled)

No rule currently contains `image`; no third-party box art is installed. Omit the
field to keep the original SVG. When present, the image replaces the SVG in the
hero and thumbnails, with the image credit, publisher source, and licence linked
in the rule's Source & edition card. Hero images have descriptive alt text;
thumbnails are decorative beside the linked game name. Images are contained
without stretching, with explicit dimensions to reserve space.

Each rule's optional `image` object requires:

| Field | Meaning |
| --- | --- |
| `file` | A local `/images/games/<name>.png`, `.jpg`, `.jpeg`, `.webp`, or `.avif` file in `public` |
| `alt`, `width`, `height` | Description and actual source pixel dimensions |
| `source.url`, `source.publisher` | HTTPS publisher/rights-holder source page and name |
| `licence.name`, `licence.url` | Licence name and the exact terms or permission reference |
| `licence.rightsHolder`, `licence.attribution` | Rights holder and required public credit |
| `licence.reviewedAt` | Date the actual permission was reviewed, `YYYY-MM-DD` |
| `licence.localEditorialUse` | Must be `true`; a reviewer must establish that local hosting and editorial display are permitted |

Before adding an image, confirm that the grant covers this commercial,
affiliate-supported site, the precise edition, local hosting, and the proposed
hero/thumbnail placement. Keep a copy of the terms or written permission in the
editorial evidence. A public press kit by itself is not permission. Honour its
attribution and modification conditions; prepare a small asset only if the terms
permit it. Do not copy artwork from BoardGameGeek, its image CDN, or search
results. If permission is unclear, keep the original SVG.

`content:validate` rejects absent files and files over 64 KiB. The production
audit counts inline SVG within compressed HTML and local images once per page,
using the existing conservative 350 KiB allowance (including all non-optional
JavaScript and CSS). Adding or changing any image or licence changes the rule's
editorial revision and requires a fresh approval through the existing review
process. No existing approval hashes have been changed for this preparation.

### Future Amazon integration

Checked against Amazon's official documentation on 2026-09-27:

- [PA-API 5 has been replaced by Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation).
- [Three qualifying sales in 180 days](https://affiliate-program.amazon.com/help/node/topic/G8TW5AE9XL2VX9VM) triggers Associates application review. The current
  [Creators API eligibility documentation](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/troubleshooting/error-codes-and-messages) separately specifies 10 qualifying sales in the trailing 30 days. Check the account's actual eligibility before integrating.
- [Amazon's content licence](https://affiliate-program.amazon.com/help/operating/policies) prohibits storing or caching product image files locally. Image URL references may be cached for up to 24 hours.

Therefore Amazon API imagery must use a **separate URL-based integration**, not
this local-file field. Once eligible, use returned product image URLs with exact
edition/ASIN matching, preserve the returned Amazon product link and its
parameters, refresh references within the permitted period, and provide the
required adjacent link/disclosures. Keep credentials on the server. Review the
current licence, CSP, page budgets, and refresh/failure behavior before enabling;
expired or unavailable API images should fall back to the original SVG. There are
no API credentials, downloads, API calls, remote image allowances, or scheduled
jobs in this implementation.
