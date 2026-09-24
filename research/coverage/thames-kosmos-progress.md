# Thames & Kosmos source batch — 2026-09-23 UTC

Eight research entries were written after inspecting rendered publisher manual pages: Aqualin, Catch the Moon, Lost Cities: Rivals, Lost Cities: Roll & Write, The Pillars of the Earth, Targi, Switch & Signal and Kahuna. Codex completed owner-authorized editorial review of all eight on 2026-09-23; exact approved revisions are under `src/content/games/`. Random-mix eligibility is tracked separately.

The [US publisher manual index](https://support.thamesandkosmos.com/hc/en-us/articles/360046967034-Product-Instruction-Manuals-Downloadable-PDFs) links some manuals through publisher-controlled redirects or public Google Drive files. Downloads were followed only to explicit permitted hosts. The [UK Switch & Signal](https://www.thamesandkosmos.co.uk/product/switch-and-signal/) and [Kahuna](https://www.thamesandkosmos.co.uk/product/kahuna/) product pages supplied the other two manuals. No account, credentials, form submission or paid service was used.

The records preserve these distinctions:

- Catch the Moon specifies the youngest player if the group cannot determine who most recently saw a full moon.
- Lost Cities: Rivals uses the most recent birthday, not the youngest player.
- Lost Cities: Roll & Write specifies the most recent hiker if the greatest adventurer is unclear; this chooses the first active dice selector.
- Targi's blue-player fallback applies when neither player has eaten dates. It is not a stated tie-break for two players who ate dates together.
- Switch & Signal chooses a cooperative active player and lets the group decide if nobody has waited for a train.
- The Pillars of the Earth instruction concerns the first round's starter. Printed page 2 is PDF page 3.
- Kahuna's extraction repeats clipped spread text. The actual instruction was visually located on printed/PDF page 2.

Anno 1800 remains an unresolved retrieval lead: its publisher-linked Drive download returned HTML rather than a PDF. The US Switch & Signal file exceeded the intake's 35 MB limit, so the successfully retrieved UK publisher edition was used instead. Neither failure was counted as a researched answer.

`research/thames-kosmos-source-queue.json` records source and download URLs separately. `scripts/cache-rulebook-queue.py` retrieves explicit queues with three workers, timeouts, host checks, redirect/size limits and PDF signature checks. It caches files, SHA-256 values and machine-extracted leads under ignored `research/source-files/`; it never supplies rule answers or approvals. The two `thames-kosmos*-batch.json` files contain manually authored inputs for `scripts/prepare-source-batch.py`.

The full collection remains unfinished. Use `npm run content:coverage` for current totals rather than interpreting this publisher batch as completion.
