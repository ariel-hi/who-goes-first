# Design and search foundations

## Design direction

The site uses warm paper, plum controls, serif headings, and small pastel game pieces. Functional labels use the system sans-serif font. The page loads no webfonts, stock imagery, background video, or decorative third-party assets.

The front page contains the tool and two links for looking up or drawing a game rule. Supporting explanations live on Fairness and the usable method pages. Soft corners and hand-shaped seat counters give the tool a quiet tabletop character. Its ordinary four-seat state has one primary action, directly editable names, and six compact reveal choices.

The roster reflows as its count changes and has no nested scrolling region. Long names wrap and grow. For 13–50 players, the primary action and result move above the roster. The page itself can scroll for a large group; participants are never removed to make a layout fit. No fabricated testimonials, customer counts, awards, or ratings are used.

## Search implementation

- The homepage directly answers the task: a random first-player picker for 2–50 people. Titles and descriptions distinguish the home tool, Balloon presentation, directory, individual editions, and supporting pages.
- Static HTML contains the headings, help text, navigation, game answers, sources, and edition details. Native disclosures and links work without JavaScript. The random draw itself requires JavaScript and explains this clearly.
- Every built page has one canonical URL, a unique title and description, one H1, an English document language, and matching Open Graph/Twitter metadata. The original 1200×630 social image matches the visual design.
- The homepage identifies the site through `WebSite` structured data. Each page describes its visible content with `WebPage`, `AboutPage`, or `CollectionPage`; approved game pages include their source citations, real modification dates, and breadcrumbs. There are no invented reviews, authors, business identities, or rich-result promises.
- Preview builds are noindex. Unapproved rules/prompts have no production route. Empty catalogs and the 404 are noindex; the production sitemap contains exactly the indexable canonical pages. A real HTTPS origin is required for production builds.
- The build parses generated HTML and rejects missing/duplicate metadata, wrong canonical paths, broken internal links or fragments, mismatched structured data, and sitemap inconsistencies. This runs on every regular build and the isolated release matrix.
- The picker is the only React island on a tool page. Rule pages remain static; Balloon code loads on use. System fonts, local assets, gzip budgets, and immutable caching of hashed assets keep the initial page small.

The audit follows primary guidance from [Google's SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [site names](https://developers.google.com/search/docs/appearance/site-names), [structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data), and [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals). No ranking can be guaranteed by implementing these checks.

## Reproducible measurement

Run `npm run verify`, `npm run test:release`, then `npm run test:browser`. For the local production audit, run `npm run audit:lighthouse` within an hour of the release matrix. It starts an isolated local server and browser, measures three simulated mobile home loads, one desktop home load, Balloon, and a clearly synthetic rule-page fixture, then closes its processes. JSON and HTML reports are written under `artifacts/lighthouse/`.

The audit exits unsuccessfully if SEO, accessibility, or best practices score below 100, or performance below 90. Reports are saved before that gate so failures can be investigated. Browser storage validation uses Zod's non-evaluating parser to avoid CSP violations; the policy does not allow `unsafe-eval`.

The rule fixture tests the publication template without approving real content. Reports are local lab evidence, not public indexing, real-user Core Web Vitals, or search ranking measurements. See `VERIFICATION.md` for the results actually obtained.

## After an authorized launch

Use the chosen public domain to verify redirects, canonical URLs, robots/sitemap behavior, and the actual hosting headers. The owner can then verify the property in Search Console, submit the sitemap, inspect representative URLs, and monitor indexing and Core Web Vitals. Review source-backed content revisions before expanding the directory. The original content, privacy, hosting, and deployment approval boundaries still apply; see `LAUNCH_CHECKLIST.md`.
