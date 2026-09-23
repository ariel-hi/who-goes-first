"""Discover publisher-hosted manuals and extract review leads, never approvals.

Run with the bundled Python (pypdf installed). The default selects manuals whose
titles match the full discovery inventory. --all fetches the publisher's entire
PDF index. Downloads/text stay in the ignored research/source-files directory.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from pypdf import PdfReader

INDEX = "https://gamewright.com/rules/"
ROOT = Path("research/source-files/gamewright")
ROOT.mkdir(parents=True, exist_ok=True)


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.current = [dict(attrs).get("href", ""), ""]

    def handle_data(self, data):
        if self.current is not None:
            self.current[1] += data

    def handle_endtag(self, tag):
        if tag == "a" and self.current is not None:
            self.links.append(self.current)
            self.current = None


def key(value):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", value).lower())


def retrieve(url, limit):
    if urlparse(url).scheme != "https" or urlparse(url).hostname not in ["gamewright.com", "www.gamewright.com"]:
        raise ValueError("Unexpected source host")
    with urlopen(Request(url, headers={"User-Agent": "WhoGoesFirstSourceReview/1.0"}), timeout=25) as response:
        if urlparse(response.url).scheme != "https" or urlparse(response.url).hostname not in ["gamewright.com", "www.gamewright.com"]:
            raise ValueError("Unexpected redirect")
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError("Source exceeds retrieval limit")
        return data


parser = argparse.ArgumentParser()
parser.add_argument("--all", action="store_true")
parser.add_argument("--limit", type=int, default=80)
args = parser.parse_args()
inventory = json.loads(Path("research/coverage/discovery-index.json").read_text(encoding="utf-8"))
identities = {key(game["name"]): game["bggId"] for game in inventory["games"]}
links = Links()
links.feed(retrieve(INDEX, 2_000_000).decode("utf-8"))
manuals = []
seen = set()
for href, title in links.links:
    url = urljoin(INDEX, href)
    title = re.sub(r"[™®]", "", title).strip()
    if not url.lower().endswith(".pdf") or url in seen or not title:
        continue
    seen.add(url)
    match = identities.get(key(title))
    if args.all or match:
        manuals.append({"gameName": title, "bggId": match, "url": url})
manuals = manuals[: max(0, min(args.limit, 250))]


def inspect(manual):
    slug = re.sub(r"[^a-z0-9]+", "-", manual["gameName"].lower()).strip("-")
    slug += "-" + sha256(manual["url"].encode()).hexdigest()[:8]
    target = ROOT / f"{slug}.pdf"
    result = {**manual, "localFile": str(target), "status": "needs-source-review"}
    try:
        if not target.exists():
            data = retrieve(manual["url"], 35_000_000)
            if not data.startswith(b"%PDF"):
                raise ValueError("Response is not a PDF")
            target.write_bytes(data)
        reader = PdfReader(target)
        pages = [page.extract_text() or "" for page in reader.pages]
        (ROOT / f"{slug}.json").write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
        snippets = []
        pattern = re.compile(r"(?:go(?:es)? first|start(?:ing)? player|first player|play(?:s)? first|(?:youngest|oldest|last|most recently).{0,100}(?:start|begin)|(?:start|begin).{0,100}(?:youngest|oldest))", re.I)
        for page_number, page in enumerate(pages, 1):
            plain = re.sub(r"\s+", " ", page)
            for match in pattern.finditer(plain):
                snippets.append({"pdfPage": page_number, "context": plain[max(0, match.start()-150):match.end()+350]})
        result.update({"pages": len(pages), "sha256": sha256(target.read_bytes()).hexdigest(), "snippets": snippets})
    except Exception as error:
        result.update({"status": "retrieval-failed", "error": f"{type(error).__name__}: {error}"})
    return result


with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(inspect, manuals))
report = {"indexSource": INDEX, "retrievedAt": datetime.now(timezone.utc).isoformat(), "warning": "Machine-extracted research leads. Not verified rules or publication approvals.", "manuals": results}
(ROOT / "intake.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
for result in results:
    print(f'{result["gameName"]}: {result["status"]}, {len(result.get("snippets", []))} candidate passages')
print(f'{len(results)} manuals queued. Review report: {ROOT / "intake.json"}')
