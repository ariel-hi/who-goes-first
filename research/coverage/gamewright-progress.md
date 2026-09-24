# Gamewright source batch — 2026-09-23 UTC

The official [Gamewright rules index](https://gamewright.com/rules/) linked 91 PDF manuals initially matched by name to 88 distinct inventory titles. All 91 were downloaded successfully for local research. Multiple PDFs for the same title were treated as alternatives, not extra games. A later identity review found that Gamewright's Chomp! is unrelated to inventory game 377449, Allplay's dinosaur Chomp. That name match is now explicitly excluded; the Gamewright answer remains a valid separate entry outside this inventory.

86 titles now have actual researched starting answers under `research/games/*-gamewright-en.json`. They are searchable in the research queue with evidence and revision hashes. The publisher-backed answers that completed editorial review appear in the public game directory; unresolved entries remain in research.

Answers were written from the source instructions, not copied from First Player Fun. Each record identifies the publisher URL, exact PDF page, actual check date, and SHA-256 of the downloaded manual. English portions of multilingual files were used. Edition labels identify these specific publisher files; they do not assert a year that was not checked. Relevant page regions were rendered for visual review; image-only and unusually encoded files were inspected directly. For example, text extraction missed the starting instructions in Sushi Go: Spin Some for Dim Sum and Zeus on the Loose, which were read from the rendered page.

Important distinctions retained:

- Imagine expressly uses the youngest player if the group cannot choose its most creative person.
- Chomp! has simultaneous reveals; it does not need a random starter.
- Marshmallow Test's initial dealer also leads the first trick.
- Three of a Crime chooses an eyewitness, then the detective to their left makes the first questioning play.
- Hit List chooses a team; an odd group has a neutral-reader setup.
- Trash Pandas' linked manual does not explicitly say “most recently,” so that qualifier was not inserted.
- Too Many Monkeys' editor footnote corrects the apparent Southern Hemisphere turn-direction joke.

## Two unresolved titles

| Title | Primary source inspected | Finding and remaining work |
|---|---|---|
| Boochie | [Publisher manual](https://gamewright.com/pdfs/Rules/Boochie-RULES.pdf), PDF page 1 | Cleanest shoes determines who tosses the target Boochie Ball in setup. The following section says players take turns throwing their objects but does not explicitly connect that throwing order to the setup toss. Do not silently call it the first ordinary turn. Seek an official clarification or another identified edition. |
| Hit or Miss | [Publisher manual](https://gamewright.com/pdfs/Rules/HitorMissTM-RULES.pdf), both PDF pages, copyright 2006 visible | A Leader draws the category and starts scoring; leadership passes left in later rounds. Neither inspected page says how to choose the initial Leader. Seek another primary edition or clarification. No criterion was fabricated. |

These are open research items, not fabricated game-answer pages or approvals.

## Reproduce the intake

Use Python with `pypdf`, `pdfplumber`, and Pillow. On this machine:

```powershell
& 'C:\Users\hirsc\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\research-gamewright.py --limit 250
```

The default matches publisher titles to the discovery inventory. `--all` also retrieves titles outside that inventory; it has not been run for this batch. Three workers, request timeouts, PDF signature/size checks, and a maximum 250-manual limit bound retrieval. Cached files are reused. Retrieval only produces machine-extracted leads under ignored `research/source-files/gamewright/`; it does not create verified answers or approvals.

The three `research/gamewright*-batch.json` files preserve the manually written answer inputs. `scripts/prepare-gamewright-review.py --batch <file>` can create missing draft records and review crops from the cached intake. It refuses to overwrite an existing draft; edit reviewed records explicitly. Downloaded manuals and page images are private research material, not deployment assets.

At the end of this Gamewright batch, the original name matching reported 91 researched inventory identities, 1,229 pending and 104 rule records. The later Chomp identity correction reduces that historical coverage by one; it does not remove a rule record. Subsequent batches and corrected current totals are in README.md. This publisher batch does not redefine completion.
