# Public launch record

The owner authorized an initial launch with the approved partial catalog and source research continuing. The site is public at <https://whogoesfirst.fun/>. Contact: `edamame.makers@gmail.com`. The initial Pages hostname redirects to the custom domain.

- [x] The release commit `0264e4e` passed the complete GitHub workflow, the production build, and the release matrix.
- [x] Cloudflare Pages successfully deployed that exact commit from `main` on 2026-09-24. Candidate previews require Cloudflare Access.
- [x] The initial live directory listed all 1,320 collected game identities and accurately reported 739 with sourced starting instructions. The first public release had 762 reviewed rule records and 339 portable random criteria.
- [x] The live site serves the picker, searchable directory, sourced edition pages, contact links, Privacy disclosure, canonical URLs, sitemap, robots instructions, and a real 404. An uncovered game page is marked noindex.
- [x] The live picker hydrated in Chrome. Directory search found Lisboa and Mercado de Lisboa, and Lisboa linked through to its sourced instruction.
- [x] The live response includes CSP, no-referrer, and MIME protection headers. Preview builds stay noindex. The release tests also check that entered names remain in the browser.

## Continuing work

- [ ] Finish source research and editorial approval for the remaining collected game identities. The owner does not need to review individual rules.
- [x] The owner chose and registered `whogoesfirst.fun` on 2026-09-24. It is connected to Pages; the production build uses the new canonical origin. HTTPS, the sitemap, and path-preserving redirects from `www` and the Pages hostname were checked live.
- [ ] Check physical iOS and Android devices, the native share sheet, and a screen reader. Desktop engines and viewport emulation do not certify these environments.
- [ ] Verify Search Console ownership and submit the sitemap. Opt-in page visit analytics are configured; no ads or payments have been activated.
- [ ] Exercise a production rollback when there is a safe maintenance window. The previous holding-page deployment remains available in Cloudflare Pages.

See `VERIFICATION.md` and `RUNBOOK.md` for release evidence and recovery steps.
