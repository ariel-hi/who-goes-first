"""Read the publisher's public catalog and cache primary rulebooks for review.

Defaults to discovery-inventory matches. --all includes the rest of the catalog.
No extracted passage is promoted to a factual rule or publication approval.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urljoin, urlparse
from urllib.request import Request, HTTPRedirectHandler, build_opener
from pypdf import PdfReader

ROOT = Path('research/source-files/rio-grande')
HOSTS = {'www.riograndegames.com', 'riograndegames.com'}
CATALOG = 'https://www.riograndegames.com/wp-json/wp/v2/games?per_page=100&_fields=id,title,link'

def allowed(url):
    p = urlparse(url)
    return p.scheme == 'https' and p.hostname in HOSTS

class Redirects(HTTPRedirectHandler):
    max_redirections = 3
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not allowed(newurl): raise ValueError('Unexpected source redirect')
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def retrieve(url, limit):
    if not allowed(url): raise ValueError('Unexpected source host')
    with build_opener(Redirects()).open(Request(url, headers={'User-Agent':'WhoGoesFirstSourceReview/1.0'}), timeout=25) as r:
        data = r.read(limit+1)
        if len(data) > limit: raise ValueError('Source exceeds retrieval limit')
        return data, r.headers

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links = []; self.current = None
    def handle_starttag(self, tag, attrs):
        if tag == 'a': self.current = [dict(attrs).get('href', ''), '']
    def handle_data(self, text):
        if self.current is not None: self.current[1] += text
    def handle_endtag(self, tag):
        if tag == 'a' and self.current is not None:
            self.links.append(self.current); self.current = None

def key(text):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFKD', unescape(text)).lower())

def inspect(product):
    manuals = []
    try:
        html, _ = retrieve(product['url'], 3_000_000)
        (ROOT / (product['bggId'] + '-product.html')).write_bytes(html)
        links = Links(); links.feed(html.decode('utf-8'))
        candidates = []
        for href, label in links.links:
            url = urljoin(product['url'], href)
            if urlparse(url).path.lower().endswith('.pdf') and re.search(r'rules|rulebook', label, re.I) and url not in candidates:
                candidates.append(url)
        for url in candidates[:5]:
            stem = re.sub('[^a-z0-9]+', '-', product['gameName'].lower()).strip('-') + '-' + sha256(url.encode()).hexdigest()[:8]
            target = ROOT / f'{stem}.pdf'
            record = {'gameName': product['gameName'], 'bggId': product['bggId'], 'url': url,
                      'indexSource': product['url'], 'localFile': str(target), 'status': 'needs-source-review'}
            try:
                if not target.exists():
                    data, _ = retrieve(url, 35_000_000)
                    if not data.startswith(b'%PDF'): raise ValueError('Response is not a PDF')
                    target.write_bytes(data)
                pages = [page.extract_text() or '' for page in PdfReader(target).pages]
                target.with_suffix('.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
                snippets = []
                for number, page in enumerate(pages, 1):
                    plain = re.sub(r'\s+', ' ', page)
                    for h in re.finditer(r'(?:start(?:ing)? player|first player|play(?:s)? first|go(?:es)? first|youngest|oldest|most recent|simultaneous)', plain, re.I):
                        snippets.append({'pdfPage':number, 'context':plain[max(0,h.start()-130):h.end()+300]})
                record.update(pages=len(pages), sha256=sha256(target.read_bytes()).hexdigest(), snippets=snippets)
            except Exception as e: record.update(status='retrieval-failed', error=f'{type(e).__name__}: {e}')
            manuals.append(record)
        print(f"{product['gameName']}: {len(manuals)} manuals; source review still required", flush=True)
        if not candidates: return [{'gameName':product['gameName'], 'indexSource':product['url'], 'status':'no-linked-rulebook'}]
        return manuals
    except Exception as e:
        return [{'gameName':product['gameName'], 'indexSource':product['url'], 'status':'retrieval-failed', 'error':f'{type(e).__name__}: {e}'}]

parser = argparse.ArgumentParser()
parser.add_argument('--all', action='store_true')
parser.add_argument('--limit', type=int, default=100)
args = parser.parse_args()
if not 1 <= args.limit <= 250: parser.error('--limit must be 1–250 products')
ROOT.mkdir(parents=True, exist_ok=True)
inventory = json.loads(Path('research/coverage/discovery-index.json').read_text(encoding='utf-8'))['games']
identities = {key(g['name']):g['bggId'] for g in inventory}
data, headers = retrieve(CATALOG, 2_000_000)
catalog = json.loads(data); (ROOT/'catalog-1.json').write_bytes(data)
for n in range(2, min(5, int(headers.get('X-WP-TotalPages', '1'))) + 1):
    data, _ = retrieve(CATALOG + f'&page={n}', 2_000_000)
    catalog.extend(json.loads(data)); (ROOT/f'catalog-{n}.json').write_bytes(data)
products = []
for game in catalog:
    title = unescape(game['title']['rendered']).replace('®','')
    match = identities.get(key(title))
    if args.all or match:
        products.append({'gameName':title, 'bggId':match or f"publisher-{game['id']}", 'url':game['link']})
print(f'{len(catalog)} publisher products; {min(args.limit,len(products))} selected', flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:
    results = [record for group in pool.map(inspect,products[:args.limit]) for record in group]
(ROOT/'intake.json').write_text(json.dumps({'retrievedAt':datetime.now(timezone.utc).isoformat(), 'warning':'Machine-extracted leads, not factual approval.', 'manuals':results}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(results)} intake results saved; inspect every candidate source.')
