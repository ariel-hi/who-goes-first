# Owner actions before public launch

- [ ] Review and approve the visual treatment in the running site and captured screenshots.
- [ ] Launch with the approved partial catalog, as the owner requested. Verify that the exact release contains only reviewed rules and that public copy does not claim a complete compendium. Continue the remaining factual game-rule review under the owner's standing authorization using `CONTENT_REVIEW.md`; the owner does not need to read each rule. Local draft navigation and the discovery inventory remain excluded from deployed builds. See `/dev/coverage/` and `research/coverage/README.md` for the research backlog.
- [x] Review and approve the six original prompt candidates. Their exact revisions are published among the 60 questions in `src/content/prompts/original-questions.json` under the owner's standing editorial authorization; the earlier drafts remain in the local research archive.
- [ ] Choose the canonical domain, confirm naming rights and budget, and authorize a Cloudflare Pages project/destination. No purchase or account change has been made.
- [ ] Set a maintained `CONTACT_EMAIL` and the actual `PRIVACY_HOST_NAME` / `PRIVACY_LOGGING_POLICY`. Inspect the rendered Privacy page for accurate hosting and retention details; review the current local-storage behavior. The production build rejects missing values. Keep tracking and ads disabled unless separately authorized.
- [ ] Check a physical iOS and Android device, the native share sheet, and a screen reader. Automated Chromium/Firefox/WebKit desktop engines and mobile viewport emulation are not physical-device or assistive-technology certification.
- [ ] Configure preview access restrictions in the host, and production-only `DEPLOY_CONTEXT=production` / `SITE_URL`. Redirect alternate host/protocol forms to the chosen canonical domain.
- [ ] Run the documented checks on the exact approved release; deploy only `dist/` after authorization.
- [ ] Smoke-test the public URL, status codes, CSP, rule sources, canonical/index settings, sitemap, and names staying on-device. Demonstrate rollback to a previous successful deployment.
- [ ] Optionally add Search Console and submit the sitemap after launch. No analytics, ads, outreach, payments, or hosted schedules have been activated.

The launch actions above do not block the local implementation. Technical verification evidence is in `VERIFICATION.md`.
