"""Retrieve primary manuals as review leads; no facts or approvals are inferred.

Three workers, 25-second deadlines, max 250 manuals, same-publisher HTTPS
redirects and PDF size/signature checks. Files stay in ignored source-files.
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
from urllib.request import Request, HTTPRedirectHandler, build_opener
from pypdf import PdfReader

ROOT = Path('research/source-files/blue-orange')
INDEXES = [('us', 'https://www.blueorangegames.com/games/download-rules'),
           ('eu', 'https://blueorangegames.eu/en/resources/game-rules/')]
HOSTS = {'blueorangegames.com', 'www.blueorangegames.com', 'blueorangegames.eu', 'www.blueorangegames.eu'}

def allowed(url):
    return urlparse(url).scheme == 'https' and urlparse(url).hostname in HOSTS

class PublisherRedirects(HTTPRedirectHandler):
    max_redirections = 3
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not allowed(newurl):
            raise ValueError('Unexpected publisher redirect')
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def retrieve(url, limit):
    if not allowed(url):
        raise ValueError('Unexpected publisher URL')
    with build_opener(PublisherRedirects()).open(Request(url, headers={'User-Agent': 'WhoGoesFirstSourceReview/1.0'}), timeout=25) as response:
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError('Source exceeds retrieval limit')
        return data

class Manuals(HTMLParser):
    def __init__(self, region):
        super().__init__()
        self.region, self.heading, self.select = region, '', ''
        self.current, self.links = None, []
    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if tag == 'select': self.select = attr.get('id', '')
        if tag == 'h3': self.current = ['h3', '', '']
        if tag == 'option' and self.select in ['rules', 'rules_dc']:
            self.current = ['option', attr.get('value', ''), '']
        if tag == 'a' and self.region == 'eu':
            self.current = ['a', attr.get('href', ''), '']
    def handle_data(self, data):
        if self.current is not None: self.current[2] += data
    def handle_endtag(self, tag):
        if tag == 'select': self.select = ''
        if self.current is not None and self.current[0] == tag:
            _, href, label = self.current
            label = label.strip()
            if tag == 'h3': self.heading = label
            elif tag == 'option': self.links.append((label, href))
            elif label in ['Rules', 'Game Rules']: self.links.append((self.heading, href))
            self.current = None

def key(text):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', text).lower())

def inspect(manual):
    stem = re.sub(r'[^a-z0-9]+', '-', manual['gameName'].lower()).strip('-') + '-' + sha256(manual['url'].encode()).hexdigest()[:8]
    target = ROOT / f'{stem}.pdf'
    result = {**manual, 'localFile': str(target), 'status': 'needs-source-review'}
    try:
        if not target.exists():
            data = retrieve(manual['url'], 35_000_000)
            if not data.startswith(b'%PDF'): raise ValueError('Not a PDF')
            target.write_bytes(data)
        pages = [p.extract_text() or '' for p in PdfReader(target).pages]
        target.with_suffix('.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
        snippets = []
        for number, page in enumerate(pages, 1):
            plain = re.sub(r'\s+', ' ', page)
            for hit in re.finditer(r'(?:go(?:es)? first|start(?:ing)? player|first player|play(?:s)? first|youngest|oldest|last person|most recent|simultaneous)', plain, re.I):
                snippets.append({'pdfPage': number, 'context': plain[max(0,hit.start()-120):hit.end()+280]})
        result.update(pages=len(pages), sha256=sha256(target.read_bytes()).hexdigest(), snippets=snippets)
    except Exception as error:
        result.update(status='retrieval-failed', error=f'{type(error).__name__}: {error}')
    return result

parser = argparse.ArgumentParser()
parser.add_argument('--all', action='store_true')
parser.add_argument('--limit', type=int, default=100)
args = parser.parse_args()
if not 1 <= args.limit <= 250: parser.error('--limit must be 1–250')
ROOT.mkdir(parents=True, exist_ok=True)
inventory = json.loads(Path('research/coverage/discovery-index.json').read_text(encoding='utf-8'))
identities = {key(g['name']): g['bggId'] for g in inventory['games']}
manuals, seen = [], set()
for region, index in INDEXES:
    data = retrieve(index, 3_000_000)
    (ROOT / f'{region}-index.html').write_bytes(data)
    parser = Manuals(region)
    parser.feed(data.decode('utf-8'))
    for name, href in parser.links:
        url = urljoin(index, href)
        if not urlparse(url).path.lower().endswith('.pdf') or url in seen: continue
        match = identities.get(key(name))
        if not args.all and not match: continue
        seen.add(url)
        manuals.append({'gameName': name, 'bggId': match, 'url': url, 'indexSource': index})
with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(inspect, manuals[:args.limit]))
(ROOT / 'intake.json').write_text(json.dumps({'retrievedAt': datetime.now(timezone.utc).isoformat(), 'warning': 'Unverified machine-extracted leads; not factual approval.', 'manuals': results}, ensure_ascii=False, indent=2), encoding='utf-8')
for m in results: print(f"{m['gameName']}: {m['status']}, {len(m.get('snippets', []))} passages")
print(f'{len(results)} manuals retrieved of {len(manuals)} candidates; inspect intake.json.')
