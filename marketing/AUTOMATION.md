# Efficient growth operations

Use the existing **Who Goes First growth follow-up** daily at 10am. Its first step is `node node_modules/tsx/dist/cli.mjs scripts/growth-check.ts` from the repository root using the existing Node runtime. On this Windows checkout the pinned runtime can be used directly: `& ./node_modules/node/bin/node.exe ./node_modules/tsx/dist/cli.mjs scripts/growth-check.ts`. This avoids npm package resolution on scheduled runs. The script uses seven parallel, bounded public requests and writes a short report to `artifacts/growth/report.md` plus structured results to `report.json`. No extra services or dependencies are needed. Existing CI already performs the full release checks when code changes; do not repeat that suite on unchanged daily runs.

## Daily gate

Read the short result and local state first. Diagnose newly observed HTTP, canonical, robots, sitemap, or RSS failures. Confirm a failure once before making a change; a transient timeout is not evidence of a broken site. Repeated failures need a new action or external change, not repeated notifications. A reachable sitemap does not establish Search Console acceptance or indexing. A reachable feed does not establish a claimed Pinterest account. These checks do not exercise the picker; use existing browser tests when implementation changes or a user reports a functional problem.

If nothing changed and the weekly review is not due, stop. Avoid broad browsing, repeated screenshot capture, full catalog research, and speculative redesign. Preserve other tasks' edits; prepare one scoped local improvement only when evidence supports it.

## Weekly review

Start with `research/demand/search-console.json` when the Monday growth workflow has produced it. Research `missingRules` in ranked order before other inventory games; verify names in `unmatchedQueries` before treating them as new identities; use `lowClickPages` to improve page titles and descriptions. Demand sets priority only. Primary sources and the exact-revision review in `CONTENT_REVIEW.md` remain required for every rule.

Review available Search Console, consented GA4, channel, and actual cost/revenue evidence. Select at most one measurable experiment: a high-demand rule page, a rule-to-picker journey improvement, a useful distribution asset, or a relevant channel test. Write its hypothesis, baseline, measure, time cost, and evaluation date to `artifacts/growth/experiments.md`. Missing baselines are explicit limitations. Keep an experiment pending until it has useful evidence; do not create a replacement every week because results are unavailable.

After completing a review, set `weeklyReviewAt` in `artifacts/growth/state.json` to the current ISO timestamp, preserving its fingerprint. The checker never marks the review done just because it ran. If access is unavailable, record that once, use the available evidence, and finish the review without inventing metrics. Stay quiet until there is a material finding, completed improvement, failure, or required action.

## Metrics input

No Analytics or Search Console API is connected in this setup. Account reporting must come from an accessible authenticated account, a connected read-only API, or a real export. Normalize aggregate values to `artifacts/growth/metrics.json` using `marketing/metrics.example.json` as the schema. Keep all metrics and experiment evidence under the ignored artifacts directory. Never copy the example as if it were observed data. Use `null` for unknown values and `0` only for an observed zero. Dates, traffic, revenue, and costs must cover the same period. Cash costs should include attributable tools, advertising, hosting, and other operating expenses; valued labor is separate. Document any allocation limitation in the experiment record.

GA4 consented sessions are a sample. Set scope to `consented-sessions`; the report deliberately does not divide whole-site revenue by that sample to claim unit economics. Use `all-sessions` only with a defensible total-session measure for the same period. Snapshots older than 14 days are marked stale. Cash contribution is before valued labor and tax; contribution after labor is still before tax. These are observations, not forecasts or a paid-acquisition budget.

## Account and business actions

Prepare factual Pins, social drafts, partner prospect lists, QR/table assets, sponsorship proposals, and experiment changes locally. Publish, send outreach, deploy, add telemetry, activate monetization, or spend only when the existing user authorization covers that specific action. Do not infer outreach authorization from general automation setup. Existing pageview-only consent and privacy behavior remain the active measurement policy.

Local scheduled runs need the computer on and the desktop app running. Keep this single follow-up rather than adding overlapping daily agents. Prefer existing RSS and CI mechanisms for repetitive work; use the scheduled agent for interpretation and one evidence-backed improvement.
