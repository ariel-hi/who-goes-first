# Automated growth operations

Updated October 1, 2026 (Pacific). The owner asked Codex to take charge of automated growth and deploy verified improvements immediately. This replaces the older draft-only growth instructions. Partnership outreach is secondary.

## Publishing that runs without the desktop

- `.github/workflows/pinterest.yml` releases five queued Pins per UTC day through the existing claimed-domain RSS connection to @whogoesfirst. `scripts/release-pins.ts` keeps a unique ledger, catches overdue items after a missed run and avoids rerun commits. Existing Pin GUIDs and release dates must remain stable. A feed release is not proof of Pinterest publication.
- `.github/workflows/growth.yml` runs one original Bluesky campaign daily at 15:17 UTC using the existing account secrets. The weekly mix is three sourced starting rules, three practical tools and one Friday hosting guide. Only reviewed portable rules are eligible. `scripts/lib/bluesky-publisher.ts` checks earlier site posts, uses a dated repository key and a commit guard, requires a live destination and image, and verifies the saved record. Failed preflights and uncertain writes are not blindly retried. Missing credentials fail visibly rather than pretending publication succeeded. The cap uses the Pacific calendar.
- The same growth workflow refreshes Google Search Console demand and consented GA4 acquisition on Mondays and Thursdays at 06:41 UTC. Daily indexing upkeep continues at 11:29 UTC. Existing keyless Google authentication is configured. Inspect actual job results before treating data as available; a schedule is not proof a job ran.
- `research/demand/search-opportunities.json` ranks observed low-click tools, guides and rule pages. Rows under 50 impressions stay in watch; use actual supporting query evidence before changing copy. The queue excludes unlisted, private and noncanonical paths. No mass generation of thin search pages.
- Keep all Bluesky URLs clean: no UTM or other tracking parameters. Pinterest retains its existing fixed campaigns. No new visitor tracking was added.

## Daily autonomous work

The existing Who Goes First automated growth heartbeat runs at 10am Pacific. Read the small state and run:

```powershell
& ./node_modules/node/bin/node.exe ./node_modules/tsx/dist/cli.mjs scripts/growth-check.ts
```

The checker makes bounded public requests and writes `artifacts/growth/report.json` and `report.md`. Do not install packages or run the full suite on unchanged checks. Confirm a new failure once before repairing it. Implement supported fixes, run the necessary verification, deploy immediately and verify the actual live release. Do not stop at a draft or another plan. Preserve concurrent work and stage only this task's files.

Check the latest publisher job receipts when delivery changes or a run fails. Never claim that an HTTP check, a green workflow or a feed item proves indexing, reach or traffic. Use the actual Pinterest profile and the saved Bluesky URL to verify delivery. Do not rerun unchanged sitemap submissions repeatedly.

## Weekly improvement and queue maintenance

Use the twice-weekly report once per seven days for a focused improvement review. If the report is stale, dispatch the existing weekly workflow once and inspect the completed output. Read the search opportunity queue, ranked rule demand and acquisition snapshot. A consented GA4 session is an observation, not a verified human visitor; platform impressions and Pin clicks are not website outbound clicks.

Choose one supported improvement to an existing page or one reviewed distribution creative. Record the hypothesis, baseline, time cost, metric and evaluation date in `artifacts/growth/experiments.md`. Preserve the October 15 discovery review in `marketing/DISCOVERY_EXPERIMENT.md`. Keep an experiment pending until its review date or meaningful evidence arrives. Do not repeatedly rewrite low-sample pages or start replacement experiments merely because data is absent.

Check the final date in the Pinterest queue. With fewer than 14 days remaining, append a small reviewed batch of distinct, useful campaigns toward 28 days of coverage. Keep the original IDs and dates stable. Review copy, factual claims, destination and rendered artwork before making it eligible for release. Do not dump the full catalog into the feed, reuse the same creative with a new ID merely to repost, or publish unverified rule claims. Use existing build auditing and relevant tests for a release.

After a completed review, update `weeklyReviewAt` in `artifacts/growth/state.json`, preserving its fingerprint. Record missing access or metrics as unavailable. Stay quiet when nothing actionable changes; notify only for a meaningful finding, completed improvement, verified failure or required user action. Report a repeated unchanged blocker once.

## Coordination and authorization

The existing twice-daily Bluesky community routine handles useful replies and notifications. It must not publish extra originals: GitHub owns the daily original campaign. The existing automation review may make one evidence-backed routine adjustment while preserving this division and existing schedules. Keep conversations natural and end completed exchanges. No stock comments, bulk replies or unsolicited direct messages.

The owner has authorized routine growth work, existing-account publishing, verification and immediate deployment. This does not create a spending budget or permission for new accounts, accepting new terms, broad email batches, additional telemetry or monetization changes. Preserve current consent and privacy behavior. Use only the existing Who Goes First accounts.

The GitHub publishers and reports run in the cloud. Codex interpretation, community replies and autonomous edits need the computer on and the desktop app running. Reuse these existing automations; do not add overlapping daily agents.
