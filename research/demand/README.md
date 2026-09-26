# Search demand research queue

`search-console.json` is rewritten every Monday by the Growth automation workflow (`scripts/growth-weekly.ts`). It ranks what people search for, so research effort goes where readers are.

- `missingRules` — board games with **no sourced rule yet**, ranked by Google impressions for starting-player queries that name them ("who goes first in …", "… first player"). Research these first, in order.
- `unmatchedQueries` — starting-player searches naming no game in the discovery index. Candidates for new inventory identities after checking the name.
- `lowClickPages` — published rule pages that appear in results but are rarely clicked. Check that the title and description state the answer clearly.

Demand only sets priority. It never substitutes for a primary source, and every rule still goes through the normal review in `CONTENT_REVIEW.md`. `weekly-report.md` is the latest human-readable summary.
