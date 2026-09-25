# Growth and revenue automation

Everything here is off until its setting exists. A missing setting never breaks the build or a scheduled job; it just leaves that feature inactive.

## What runs by itself

| Feature | Where | Trigger |
| --- | --- | --- |
| Theme hubs (`/games/themes/…/`), publisher hubs (`/publishers/…/`), `/ways-to-pick-who-goes-first/` | Static pages generated from approved rules | Every build |
| "Games with a similar starting rule" and publisher links on each rule page | `GameArticle.astro` | Every build |
| Per-rule share images (`/og/<slug>.png`) | `src/lib/og-image.ts` | Every build (≈95 ms per rule) |
| Rule of the day on Bluesky and/or Mastodon | `scripts/post-rule.ts` | Daily, 15:17 UTC |
| Search-demand research queue and weekly report | `scripts/growth-weekly.ts` → `research/demand/` | Mondays, 06:41 UTC |
| Amazon affiliate links on rule and board-game pages | `src/lib/affiliate.ts` | Every build, when the tag is set |
| AdSense Auto ads with Google's consent message | `public/google-tags.js` | Every build, when the client ID is set |

Hubs only group rules by words in the approved instruction and always show that instruction. Theme hubs need 5 rules and publisher hubs need 3, so there are no thin pages. The picker, method pages and 404 never load ads (`ads={false}`), and the build audit fails if they do.

## One-time setup

### Cloudflare Pages build variables (production)
| Variable | Example | Effect |
| --- | --- | --- |
| `ADSENSE_CLIENT` | `ca-pub-1234567890123456` | Loads AdSense and Google's consent message, writes `ads.txt`, widens the CSP for Google ad hosts, and switches Privacy/About to the ads wording. It replaces the custom analytics banner. Production builds only. |
| `AMAZON_ASSOCIATES_TAG` | `whogoesfirst-20` | Adds "Find this game on Amazon" search links with the disclosure. |
| `TIP_JAR_URL` | `https://ko-fi.com/…` | Adds "Support the site" to the footer and About. |

After changing a variable, trigger a new deployment.

### AdSense (once, in the AdSense dashboard)
1. Add the site `whogoesfirst.fun` and wait for approval. Set `ADSENSE_CLIENT` first: the review needs the tag and `ads.txt` live.
2. **Privacy & messaging → European regulations:** create and publish the consent message. Also publish the US state regulations message.
3. **Ads → By site → Auto ads:** turn off vignette (full-screen) ads. Consider turning off anchor ads on mobile. Keep in-page ads on.

### GitHub repository settings (Settings → Secrets and variables → Actions)
| Name | Kind | Needed for |
| --- | --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | secret | Weekly job. A Google Cloud service-account key; add its email as a **Restricted user** in Search Console, and as a **Viewer** in GA4. Enable the Search Console API and the Google Analytics Data API in that Cloud project. |
| `GSC_PROPERTY` | variable | Defaults to `sc-domain:whogoesfirst.fun`. Use `https://whogoesfirst.fun/` if the property is URL-prefix. |
| `GA4_PROPERTY_ID` | variable | Optional numeric GA4 property ID (Admin → Property details). Enables traffic totals and ad-network readiness. |
| `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD` | secrets | Daily post. Use an app password (Settings → Privacy and security → App passwords), never the account password. |
| `MASTODON_INSTANCE`, `MASTODON_TOKEN` | secrets | Daily post. `https://your.instance`, and a token from Preferences → Development with only `write:statuses`. Mark the account as a bot in its profile settings. |

Scheduled workflows only run from the default branch, so `growth.yml` must be merged to `main`. The weekly job commits `research/demand/` to that branch with `[skip ci]`. If `main` has branch protection, allow GitHub Actions to push or change the job to open a pull request.

### Cloudflare
Turn on **Caching → Configuration → Crawler Hints** for `whogoesfirst.fun`. Cloudflare then notifies IndexNow search engines (Bing, Yandex and others) when pages change.

## Checking it
- `npx tsx scripts/post-rule.ts --dry-run` prints today's post.
- Actions → Growth automation → Run workflow runs either job on demand. The weekly job's summary page shows the report.
- After enabling ads, open a rule page in a private window. The browser console should show no `Content-Security-Policy` errors. Ads can take a few hours after approval to appear.
