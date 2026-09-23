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
| `ASTRO_TELEMETRY_DISABLED` | set `1` in CI | Disables Astro tooling telemetry; unrelated to site analytics, which is always disabled |
| `BUILD_OUT_DIR` | `dist` | Test/build output directory; normally leave unset |
| `PORT` | 4322 | Header-aware local static test server only |

Use environment variables in the shell/host. No secrets are needed. There is no production winner override, seed, or private roster URL parameter.

## Cloudflare Pages deployment (owner-authorized only)

1. Create/connect the owner's chosen repository and Pages project. Select a production branch. Use Node 22.23.2 (or compatible Node 22 maintenance), build command `npm ci && npm run build`, output directory `dist`.
2. Set production `SITE_URL` to the canonical HTTPS origin, `DEPLOY_CONTEXT=production`, `CONTACT_EMAIL`, `PRIVACY_HOST_NAME`, `PRIVACY_LOGGING_POLICY`, and `ASTRO_TELEMETRY_DISABLED=1`. The production build fails when any contact or hosting disclosure is missing. Keep `DEPLOY_CONTEXT=preview` for preview builds even if SITE_URL points to the canonical domain. Configure Cloudflare Access/restricted previews before sharing drafts of the site. Static build previews contain no editorial research.
3. Review the actual host's request logging and retention, then write an accurate sentence in `PRIVACY_LOGGING_POLICY` (for example, who receives request data and how long it is kept). Inspect the rendered Privacy page. Add the selected custom domain, HTTPS, and a redirect rule from the Pages hostname/alternate domains to the canonical host. Check for redirect loops.
4. Deploy **only `dist/`**. The build writes Cloudflare-compatible `_headers` with hashes for inline scripts, restrictive CSP, no-referrer, MIME protection, and disabled device permissions. Preview builds also include `X-Robots-Tag: noindex`. Do not manually copy preview headers into production.
5. Smoke-test `/`, `/methods/balloon/`, `/games/`, a real approved rule if present, `/robots.txt`, `/sitemap.xml`, and an unknown path. Root `404.html` provides the Pages 404 response; there is no SPA catch-all redirect. Inspect network requests while entering fictional private names.
6. Verify canonical URLs, production home `index, follow`, no preview robots header on production, and noindex for empty catalog pages. Submit the sitemap only after this passes.

This document is configuration guidance, not evidence that a Cloudflare project or deployment exists. Recheck Cloudflare's current UI and terms when authorizing launch.

Primary references checked for this build: [Astro on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), [custom headers and their line limits](https://developers.cloudflare.com/pages/configuration/headers/), [production rollback](https://developers.cloudflare.com/pages/configuration/rollbacks/). The build rejects a CSP line over the documented 2,000-character limit. If a larger future catalog reaches it, use route-specific policies before release.

## Rollback and recovery

- Local picker stays on “Getting ready”: inspect failed module requests. The reproduced `504 Outdated Optimize Dep` came from release fixtures sharing Vite's default dependency cache. The delivered configuration isolates Astro/Vite caches per project and command. Reload an already-open tab after updating the code, then run `npm run test:dev-release` with `npm run dev` running to verify this regression. An unrecoverable island download now exposes a normal reload link without selecting a winner.
- Firefox reload: the picker form disables autocomplete so Firefox does not restore dynamic disabled-button attributes before hydration. Its saved group is still restored by the explicit opt-in application preference.
- Broken release: in Pages, promote the previous known-good deployment using its rollback control. Smoke-test again. Keep the corresponding source revision and lockfile. No hosted rollback has been attempted locally.
- Broken optional mode: set `DISABLE_BALLOON=true`, rebuild, inspect and redeploy. Instant/Quick remain usable. Re-enable only after its tests pass.
- Source issue: run `npm run links:check -- --approved-only` for the public catalog, or omit the flag to include research drafts. It checks up to 250 unique sources with three workers, each with an 8-second deadline, up to three HTTPS redirects, no retries and no content mutation. It reports total/checked counts and a continuation command if a larger collection requires another batch (`--offset`/`--limit`). A 403/405/timeout may be server policy; manually inspect before changing a fact. Verification dates are never refreshed by a link check.
- Privacy incident: disable any subsequently added adapter/script first, rebuild and redeploy; investigate the actual payload. The delivered default has no external telemetry sink.
- Corrupt storage: the interface recovers to a new four-seat table and explains it. Forget/reset are in Preferences. Browser site-data clearing is the fallback when storage access itself is blocked.
- Restore: fresh checkout, compatible Node, `npm ci`, `npm run verify`, browser install and tests, then the release configuration checks. Serve only the generated directory.

## Optional integrations and maintenance

`src/lib/analytics.ts` is disabled by default. A future approved sink must use the existing field-by-field allowlists and approved public game IDs. No names, searches, winner IDs, form capture, session replay, or raw URLs. Never emit pageviews for picks. Revisit Privacy, consent, CSP and network tests before any activation.

The `/_astro/` assets have content hashes and a one-year immutable cache policy. HTML is not given an immutable policy. The local test server applies the generated route headers and gzip compression; public-host compression and actual cache behavior still need a launch smoke test. After UI or bundle changes, run the release matrix and then `npm run audit:lighthouse` for repeatable local mobile/desktop reports. Real Core Web Vitals require an authorized public release and field data.

`.github/workflows/ci.yml` checks proposed changes; `.github/dependabot.yml` groups minor/patch dependency updates and leaves major upgrades for explicit review. These files have not activated a hosted job because this workspace has not been pushed. Optional weekly source checks/daily availability checks can be scheduled by the owner later; no scheduler is configured by this build.

Review dependencies/source issues weekly and costs/rollback monthly. During a maintenance freeze, stop new content and integrations and retain the static picker and essential checks.
