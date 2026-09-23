"""Prepare page crops and draft files from the manually written research batch.

This does not infer rules from snippets and cannot create publication approval.
Run only after reading each cited instruction in the downloaded publisher PDF.
"""
from datetime import datetime, timezone
import argparse
import json
from pathlib import Path
import re

import pdfplumber
from PIL import Image, ImageDraw, ImageFont

root = Path("research/source-files/gamewright")
parser = argparse.ArgumentParser()
parser.add_argument('--batch', default='research/gamewright-batch.json')
args = parser.parse_args()
batch = json.loads(Path(args.batch).read_text(encoding="utf-8"))
prefix = Path(args.batch).stem
intake = json.loads((root / "intake.json").read_text(encoding="utf-8"))
date = datetime.now(timezone.utc).date().isoformat()
panels = []
for index, row in enumerate(batch):
    name, number, keyword, answer, tie, section, *options = row
    file_hint = options[0] if options else None
    notes = options[1:] if len(options) > 1 else []
    sources = [m for m in intake["manuals"] if m["gameName"] == name and (not file_hint or m["url"].endswith(file_hint))]
    if len(sources) != 1:
        raise ValueError(f"Ambiguous source for {name}")
    source = sources[0]
    target = Path(source["localFile"])
    with pdfplumber.open(target) as pdf:
        page = pdf.pages[number - 1]
        # Search may fail on PDFs with unusual encoded glyphs. Keep a full-page
        # rendering for visual inspection rather than guessing a text location.
        hits = page.search(re.escape(keyword), case=False)
        if hits:
            hit = hits[0]
            box = (0, max(0, hit['top'] - 28), page.width, min(page.height, hit['bottom'] + 100))
            crop = page.crop(box).to_image(resolution=150).original.convert('RGB')
        else:
            crop = page.to_image(resolution=90).original.convert('RGB')
        crop.save(root / f"{prefix}-review-{index + 1:03}.png")
        crop.thumbnail((680, 280))
        panel = Image.new('RGB', (700, 320), 'white')
        ImageDraw.Draw(panel).text((10, 5), f"{index + 1}. {name} | PDF {number}", fill='black', font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18))
        panel.paste(crop, (10, 32))
        panels.append(panel)
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip('-') + '-gamewright-en'
    draft = {
        "id": slug, "slug": slug, "gameName": name, "aliases": [], "language": "en",
        "editionLabel": f'English Gamewright rules · {source["pages"]}-page publisher PDF',
        "firstPlayerRule": answer, "officialTieBreak": tie,
        "houseFallback": "If this criterion does not suit your group, agree to choose a starting player randomly. This is a house rule.",
        "clarifications": notes, "interpretation": None,
        "sources": [{"url": source['url'], "title": name + ' — Gamewright rules', "publisher": "Gamewright", "printedPages": [], "pdfPagesOneBased": [number], "location": f'{section}, PDF page {number}', "checkedAt": date}],
        "internalEvidence": f'The English starting instruction in {section} on PDF page {number} was read from the manual linked in the publisher index https://gamewright.com/rules/. Research finding: {answer}' + (f' Official fallback: {tie}' if tie else '') + f' Local source SHA-256: {source["sha256"]}.',
        "uncertainty": (["No tie-break is stated alongside this starting instruction."] if not tie else []) + ["Other editions were not compared. The edition label identifies the linked publisher PDF, not an inferred publication year."],
        "status": "draft", "approvedBy": None, "approvedRevision": None, "publishedAt": None, "materiallyUpdatedAt": None,
    }
    destination = Path('research/games') / f'{slug}.json'
    if destination.exists():
        raise FileExistsError(f'Refusing to overwrite {destination}; review changes explicitly.')
    destination.write_text(json.dumps(draft, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for start in range(0, len(panels), 8):
    sheet = Image.new('RGB', (1400, 1280), '#ddd')
    for i, panel in enumerate(panels[start:start+8]):
        sheet.paste(panel, ((i % 2) * 700, (i // 2) * 320))
    sheet.save(root / f'{prefix}-review-sheet-{start // 8 + 1:02}.png')
print(f'Wrote {len(batch)} unapproved drafts and {len(panels)} review crops; inspect every crop before claiming visual review.')
