# Rule-page imagery

## Artwork policy

Rule pages show a photograph only when its local file and rights record have
passed editorial review. Other rules and directory entries use a text layout.
Generated SVG cards and initial tiles were removed after visual review; they
were not useful representations of the games.

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

## Reviewed local photographs

Three traditional games have rights-reviewed photographs of generic equipment;
see [the file-by-file review](open-game-art.md). These are not photographs of the
exact cited rulebook edition or publisher packaging. Omit the `image` field for
any other rule. When present, the photograph runs at the full hero content width
below the rule answer, with its source host and licence linked in the Source &
edition card. Images keep their natural aspect ratio without cropping or padding.
Related rules and directory entries use readable text without placeholder art.

Each rule's optional `image` object requires:

| Field | Meaning |
| --- | --- |
| `file` | A local `/images/games/<name>.png`, `.jpg`, `.jpeg`, `.webp`, or `.avif` file in `public` |
| `alt`, `width`, `height` | Description and actual source pixel dimensions |
| `source.url`, `source.publisher` | HTTPS rights-holder file page or source host and its display name; for these photographs the host is Wikimedia Commons, not the rulebook publisher |
| `licence.name`, `licence.url` | Licence name and the exact terms or permission reference |
| `licence.rightsHolder`, `licence.attribution` | Rights holder and required public credit |
| `licence.reviewedAt` | Date the actual permission was reviewed, `YYYY-MM-DD` |
| `licence.localEditorialUse` | Must be `true`; a reviewer must establish that local hosting and editorial display are permitted |

Before adding an image, confirm that the grant covers this commercial,
affiliate-supported site, local hosting, and the proposed
hero/thumbnail placement. Keep a copy of the terms or written permission in the
editorial evidence. A public press kit by itself is not permission. Honour its
attribution and modification conditions; prepare a small asset only if the terms
permit it. Do not copy artwork from BoardGameGeek, its image CDN, or search
results. Where artwork depicts an edition or box, confirm rights in the depicted
design and match the edition; generic traditional-game equipment may instead be
labelled as illustration, without claiming an exact-edition match. If permission
is unclear, use the text-only layout.

`content:validate` uses Sharp (already supplied by Astro) to decode every image;
it rejects malformed pixels, unsupported or mismatched file types, animated images,
incorrect dimensions, files over 64 KiB, and images above four million pixels.
No decoder runs in the browser. The production
audit counts inline SVG within compressed HTML and local images once per page,
using the existing conservative 350 KiB allowance (including all non-optional
JavaScript and CSS). Adding or changing image metadata or its licence changes the rule's
editorial revision and requires a fresh approval through the existing review
process. The three enabled records carry new image-review evidence and approvals.

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
expired or unavailable API images should fall back to the text-only layout. There are
no API credentials, downloads, API calls, remote image allowances, or scheduled
jobs in this implementation.
