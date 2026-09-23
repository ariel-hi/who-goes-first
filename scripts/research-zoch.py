"""Cache publisher-linked manuals for inventory matches; never infer or approve rules."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import quote, urljoin, urlparse
from urllib.request import Request, HTTPRedirectHandler, build_opener
from pypdf import PdfReader

ROOT = Path('research/source-files/zoch')
HOSTS = {'www.zoch-verlag.com', 'cdn.simba-dickie-group.de', 'pim.simba-dickie.com'}
INDEX = 'https://www.zoch-verlag.com/zoch_en/categories/?lp=2&ln=60&ls=top-sellers'

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
    with build_opener(Redirects()).open(Request(url, headers={'User-Agent':'WhoGoesFirstSourceReview/1.0'}), timeout=25) as response:
        data = response.read(limit+1)
        if len(data) > limit: raise ValueError('Source exceeds retrieval limit')
        return data

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
        data = retrieve(product['url'], 3_000_000)
        (ROOT / (product['bggId'] + '-product.html')).write_bytes(data)
        links = Links(); links.feed(data.decode('utf-8'))
        candidates = list(dict.fromkeys(quote(urljoin(product['url'], href), safe=':/%') for href, label in links.links
            if urlparse(href).path.lower().endswith('.pdf')))
        for url in candidates[:5]:
            stem = re.sub('[^a-z0-9]+', '-', key(product['gameName'])) + '-' + sha256(url.encode()).hexdigest()[:8]
            target = ROOT / f'{stem}.pdf'
            record = {**product, 'url':url, 'indexSource':product['url'], 'localFile':str(target), 'status':'needs-source-review'}
            try:
                if not target.exists():
                    pdf = retrieve(url, 35_000_000)
                    if not pdf.startswith(b'%PDF'): raise ValueError('Response is not a PDF')
                    target.write_bytes(pdf)
                pages = [page.extract_text() or '' for page in PdfReader(target).pages]
                target.with_suffix('.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
                snippets = []
                for number,page in enumerate(pages,1):
                    plain = re.sub(r'\s+', ' ', page)
                    for hit in re.finditer(r'start(?:ing)? player|first player|go(?:es)? first|start(?:s)? the game|youngest|oldest|most recent',plain,re.I):
                        snippets.append({'pdfPage':number,'context':plain[max(0,hit.start()-150):hit.end()+230]})
                record.update(pages=len(pages),sha256=sha256(target.read_bytes()).hexdigest(),snippets=snippets)
            except Exception as error:
                record.update(status='retrieval-failed',error=f'{type(error).__name__}: {error}')
            manuals.append(record)
        print(f"{product['gameName']}: {len(manuals)} manuals; source review still required",flush=True)
        return manuals or [{**product,'status':'no-linked-rulebook'}]
    except Exception as error:
        return [{**product,'status':'retrieval-failed','error':f'{type(error).__name__}: {error}'}]

ROOT.mkdir(parents=True,exist_ok=True)
data = retrieve(INDEX,3_000_000)
(ROOT/'catalog-page-2.html').write_bytes(data)
links = Links(); links.feed(data.decode('utf-8'))
inventory = {key(g['name']):g for g in json.loads(Path('research/coverage/discovery-index.json').read_text(encoding='utf-8'))['games']}
existing = {key(name) for path in Path('research/games').glob('*.json')
            for name in [json.loads(path.read_text(encoding='utf-8'))['gameName'], *json.loads(path.read_text(encoding='utf-8')).get('aliases',[])]}
products = {}
for href,label in links.links:
    match = inventory.get(key(label.strip()))
    if match and key(label.strip()) not in existing and re.search(r'-[0-9]{9}-en.html',href):
        url = urljoin(INDEX,href)
        products[url] = {'gameName':match['name'],'bggId':match['bggId'],'url':url}
with ThreadPoolExecutor(max_workers=3) as pool:
    results = [record for group in pool.map(inspect,list(products.values())[:100]) for record in group]
(ROOT/'intake.json').write_text(json.dumps({'retrievedAt':datetime.now(timezone.utc).isoformat(),
    'warning':'Machine-extracted leads, not factual approval. Catalog matching is not exhaustive.',
    'manuals':results},ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(results)} intake results saved; inspect every candidate source.')
