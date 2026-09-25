"""Cache publisher rulebooks and list pages with opening-turn language.

Research helper only; downloaded PDFs and extracted text stay in ignored
research/source-files/ and are not shipped with the site.
"""

import hashlib
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import pymupdf
import requests


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "research/popular-rulebook-manifest.json"
CACHE = ROOT / "research/source-files/popular-games"
PATTERN = re.compile(
    r"\b(?:starting player|start player|first player|first to play|"
    r"goes first|go first|plays first|play first|turn order|initiative|"
    r"simultaneous(?:ly)?|begins the game)\b",
    re.IGNORECASE,
)


def fetch(item):
    name, url = item["name"], item["url"]
    stem = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    pdf_path = CACHE / f"{stem}.pdf"
    if not pdf_path.exists():
        response = requests.get(url, timeout=120, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        if not response.content.startswith(b"%PDF"):
            raise ValueError(f"not a PDF: {response.url} {response.headers.get('content-type')}")
        pdf_path.write_bytes(response.content)
    digest = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
    document = pymupdf.open(pdf_path)
    matches = []
    for i, page in enumerate(document):
        page_text = page.get_text(sort=True)
        (CACHE / f"{stem}-{i + 1:02}.txt").write_text(page_text, encoding="utf-8")
        count = len(PATTERN.findall(page_text))
        if count:
            matches.append((i + 1, count))
    return name, len(document), digest, matches


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    items = json.loads(MANIFEST.read_text(encoding="utf-8"))
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(fetch, item): item for item in items}
        for future in as_completed(futures):
            try:
                name, page_count, digest, matches = future.result()
                print(f"{name} | {page_count} pages | sha256 {digest} | hits {matches}", flush=True)
            except Exception as exc:
                print(f"ERROR {futures[future]['name']}: {exc}", flush=True)


if __name__ == "__main__":
    main()
