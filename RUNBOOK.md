# Operations

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `SITE_URL` | `http://localhost:4321` | Sole canonical origin; production must use the selected real HTTPS domain |
| `DEPLOY_CONTEXT` | preview behavior | Only exact `production` enables public indexing |
| `CONTACT_EMAIL` | unset | Maintained owner contact on About, Privacy, and rule correction links; required for production |
| `PRIVACY_HOST_NAME` | unset | Actual public hosting provider name shown on Privacy; required for production |
| `PRIVACY_LOGGING_POLICY` | unset | Reviewed sentence describing the host's request logging and retention; required for production |
| `DISABLE_BALLOON` | false | `true` removes mode selection/navigation; direct route retains the basic picker with an explanatory notice and noindex |
| `ASTRO_TELEMETRY_DISABLED` | set `1` in CI | Disables Astro tooling telemetry; unrelated to the optional visitor analytics |
| `BUILD_OUT_DIR` | `dist` | Test/build output directory; normally leave unset |
| `PORT` | 4322 | Header-aware local static test server only |

Use environment variables in the shell/host. No secrets are needed. There is no production winner override, seed, or private roster URL parameter.

## Cloudflare Pages deployment

The current public project is `who-goes-first` in the owner's Cloudflare account, using `main` as the production branch. Its canonical address is <https://whogoesfirst.fun/>. The first full-site release was `0264e4e` on 2026-09-24; the custom domain went live on 2026-09-24. The production environment has `SITE_URL=https://whogoesfirst.fun`, `DEPLOY_CONTEXT=production`, `CONTACT_EMAIL=edamame.makers@gmail.com`, `PRIVACY_HOST_NAME=Cloudflare Pages`, a host request-processing disclosure, and `ASTRO_TELEMETRY_DISABLED=1`. Preview access is restricted.

1. Create/connect the owner's chosen repository and Pages project. Select a production branch. Use Node 22.23.2 (or compatible Node 22 maintenance), build command `npm ci && npm run build`, output directory `dist`.
2. Set production `SITE_URL` to the canonical HTTPS origin, `DEPLOY_CONTEXT=production`, `CONTACT_EMAIL`, `PRIVACY_HOST_NAME`, `PRIVACY_LOGGING_POLICY`, and `ASTRO_TELEMETRY_DISABLED=1`. The production build fails when any contact or hosting disclosure is missing. Keep `DEPLOY_CONTEXT=preview` for preview builds even if SITE_URL points to the canonical domain. Configure Cloudflare Access/restricted previews before sharing drafts of the site. Static build previews contain no editorial research.
3. Review the actual host's request logging and retention, then write an accurate sentence in `PRIVACY_LOGGING_POLICY` (for example, who receives request data and how long it is kept). Inspect the rendered Privacy page. Add the selected custom domain, HTTPS, and a redirect rule from the Pages hostname/alternate domains to the canonical host. Check for redirect loops.
4. Deploy **only `dist/`**. The build writes Cloudflare-compatible `_headers` with hashes for inline scripts, restrictive CSP, no-referrer, MIME protection, and disabled device permissions. Preview builds also include `X-Robots-Tag: noindex`. Do not manually copy preview headers into production.
5. Smoke-test `/`, `/methods/balloon/`, `/games/`, a real approved rule if present, `/robots.txt`, `/sitemap.xml`, and an unknown path. Root `404.html` provides the Pages 404 response; there is no SPA catch-all redirect. Inspect network requests while entering fictional private names.
6. Verify canonical URLs, production home `index, follow`, no preview robots header on production, and noindex for empty catalog pages. Submit the sitemap only after this passes.

The domain is registered at Cloudflare and uses a proxied apex CNAME to `who-goes-first.pages.dev`. Zone Redirect Rules send HTTP and HTTPS requests for `www.whogoesfirst.fun` to the apex with a 301, preserving paths and queries; a proxied `www` A record enables those rules. An account Bulk Redirect sends the production `who-goes-first.pages.dev` hostname to the apex with a 301, subpath matching, path suffix and query preservation. Do not enable subdomain matching on that list: deployment preview hostnames remain access restricted. After changing routing, verify the apex, redirects, canonical URLs, sitemap and HTTPS end to end.

Primary references checked for this build: [Astro on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), [custom headers and their line limits](https://developers.cloudflare.com/pages/configuration/headers/), [production rollback](https://developers.cloudflare.com/pages/configuration/rollbacks/). The build rejects a CSP line over the documented 2,000-character limit. If a larger future catalog reaches it, use route-specific policies before release.

## Rollback and recovery

- Local picker stays on “Getting ready”: inspect failed module requests. The reproduced `504 Outdated Optimize Dep` came from release fixtures sharing Vite's default dependency cache. The delivered configuration isolates Astro/Vite caches per project and command. Reload an already-open tab after updating the code, then run `npm run test:dev-release` with `npm run dev` running to verify this regression. An unrecoverable island download now exposes a normal reload link without selecting a winner.
- Firefox reload: the picker form disables autocomplete so Firefox does not restore dynamic disabled-button attributes before hydration. Its saved group is still restored by the explicit opt-in application preference.
- Broken release: in Pages, promote the previous known-good deployment using its rollback control. Smoke-test again. Keep the corresponding source revision and lockfile. No hosted rollback has been attempted locally.
- Broken optional mode: set `DISABLE_BALLOON=true`, rebuild, inspect and redeploy. Instant/Quick remain usable. Re-enable only after its tests pass.
- Source issue: run `npm run links:check -- --approved-only` for the public catalog, or omit the flag to include research drafts. It checks up to 250 unique sources with three workers, each with an 8-second deadline, up to three HTTPS redirects, no retries and no content mutation. It reports total/checked counts and a continuation command if a larger collection requires another batch (`--offset`/`--limit`). A 403/405/timeout may be server policy; manually inspect before changing a fact. Verification dates are never refreshed by a link check.
- Privacy incident: remove the Google tag loader or disable it with a release, then investigate the actual payload. The consent script is the only transport for page visits and successful clean-link handoffs.
- Corrupt storage: the interface recovers to a new four-seat table and explains it. Forget/reset are in Preferences. Browser site-data clearing is the fallback when storage access itself is blocked.
- Restore: fresh checkout, compatible Node, `npm ci`, `npm run verify`, browser install and tests, then the release configuration checks. Serve only the generated directory.

## Optional integrations and maintenance

The public site uses Google Analytics 4 property **Who Goes First?** (measurement ID `G-XDVR78FJXY`) for page visits and successful clean-link handoffs. The tag loads after a visitor allows analytics; the expanded choice is stored under `wgf:analytics-choice:v2` and can be changed from the footer. Version 1 choices do not enable the new scope. GA4 enhanced measurement is limited to page views. The site's Google tag sends a page address without query or fragment and turns off Google Signals and ad personalization. `src/lib/analytics.ts` forwards only `share_completed` to the consent script, which sends the recommended GA4 `share` event with fixed labels. All other picker events remain local no-ops. No event buffer replays pre-consent actions. Withdrawal stops the share transport immediately and reloads an already tagged page after clearing analytics cookies. Keep player names, searches, winner IDs, group settings, and form interactions out of telemetry. The Search Console URL-prefix property is `https://whogoesfirst.fun/`; its verification meta tag is in the production layout. The sitemap at `https://whogoesfirst.fun/sitemap.xml` was submitted after ownership verification. Its live URL test passed while the initial Sitemaps report still showed “Couldn't fetch”; check that report again after Google processes the file.

The `/_astro/` assets have content hashes and a one-year immutable cache policy. HTML is not given an immutable policy. The local test server applies the generated route headers and gzip compression; public-host compression and actual cache behavior still need a launch smoke test. After UI or bundle changes, run the release matrix and then `npm run audit:lighthouse` for repeatable local mobile/desktop reports. Real Core Web Vitals require an authorized public release and field data.

`.github/workflows/ci.yml` checks proposed changes; `.github/dependabot.yml` groups minor/patch dependency updates and leaves major upgrades for explicit review. GitHub Actions checks have run on the public repository. Optional weekly source checks/daily availability checks can be scheduled by the owner later; no scheduler is configured by this build.

Review dependencies/source issues weekly and costs/rollback monthly. During a maintenance freeze, stop new content and integrations and retain the static picker and essential checks.

Search discovery beyond Google: Cloudflare Crawler Hints was observed enabled in the domain's Caching → Configuration page on 2026-09-26 UTC. It supplies native IndexNow support; avoid adding a duplicate key/submission job without a specific gap. The live robots file allows crawling and links the canonical sitemap. A successful notification is not proof of indexing or visitors. See `marketing/GROWTH_STATUS.md` for the latest observations and [Cloudflare's Crawler Hints documentation](https://developers.cloudflare.com/cache/advanced-configuration/crawler-hints/).
