"""Cache an explicit primary-source queue for review, without writing rule answers.

The queue distinguishes a citable source URL from its publisher-linked download.
Every downloaded PDF requires a separate content and edition review.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
from urllib.parse import urlparse
from urllib.request import Request, HTTPRedirectHandler, build_opener
from pypdf import PdfReader

parser = argparse.ArgumentParser()
parser.add_argument('--queue', required=True)
parser.add_argument('--output', required=True)
parser.add_argument('--max-mb', type=int, default=35,
                    help='Per-file retrieval limit in decimal MB (1–150; default 35)')
args = parser.parse_args()
if not 1 <= args.max_mb <= 150:
    parser.error('--max-mb must be between 1 and 150')
max_bytes = args.max_mb * 1_000_000
queue = json.loads(Path(args.queue).read_text(encoding='utf-8'))
root = Path(args.output)
if not 1 <= len(queue['manuals']) <= 250:
    raise ValueError('A queue must contain 1–250 explicit manuals')
hosts = set(queue['allowedHosts'])
# Public Dropbox downloads use a different delivery subdomain on each request.
# Queues opt in explicitly; source URLs must still match an exact allowed host.
redirect_suffixes = queue.get('allowedRedirectHostSuffixes', [])
if any(suffix != '.dl.dropboxusercontent.com' for suffix in redirect_suffixes):
    raise ValueError('Unsupported redirect host suffix')
root.mkdir(parents=True, exist_ok=True)

def allowed(url):
    parsed = urlparse(url)
    return parsed.scheme == 'https' and parsed.hostname in hosts and not parsed.username and not parsed.password

class Redirects(HTTPRedirectHandler):
    max_redirections = 3
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        parsed = urlparse(newurl)
        delivery = (parsed.scheme == 'https' and not parsed.username and not parsed.password
                    and any((parsed.hostname or '').endswith(suffix) for suffix in redirect_suffixes))
        if not allowed(newurl) and not delivery: raise ValueError('Unexpected download redirect')
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def inspect(source):
    stem = re.sub('[^a-z0-9]+', '-', source['gameName'].lower()).strip('-') + '-' + sha256(source['url'].encode()).hexdigest()[:8]
    target = root / f'{stem}.pdf'
    record = {**source, 'localFile': str(target), 'status': 'needs-source-review'}
    try:
        url = source.get('downloadUrl', source['url'])
        if not allowed(url) or not allowed(source['url']): raise ValueError('Unexpected source host')
        if not target.exists():
            with build_opener(Redirects()).open(Request(url, headers={'User-Agent': 'WhoGoesFirstSourceReview/1.0', 'Accept-Encoding': 'identity'}), timeout=25) as response:
                chunks, total = [], 0
                while total <= max_bytes:
                    chunk = response.read(min(1_048_576, max_bytes + 1 - total))
                    if not chunk:
                        break
                    chunks.append(chunk)
                    total += len(chunk)
                data = b''.join(chunks)
                if len(data) > max_bytes: raise ValueError(f'Manual exceeds {args.max_mb} MB retrieval limit')
                expected = response.headers.get('Content-Length')
                if expected is not None and len(data) != int(expected):
                    raise ValueError('Incomplete PDF response: byte count differs from Content-Length')
                if not data.startswith(b'%PDF'): raise ValueError('Response is not a PDF')
                target.write_bytes(data)
        pages = [page.extract_text() or '' for page in PdfReader(target).pages]
        target.with_suffix('.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
        snippets = []
        for number, page in enumerate(pages, 1):
            plain = re.sub(r'\s+', ' ', page)
            for hit in re.finditer(r'start(?:ing)? player|first player|go(?:es)? first|most recent|youngest|oldest|begins|starts', plain, re.I):
                snippets.append({'pdfPage': number, 'context': plain[max(0, hit.start()-130):hit.end()+230]})
        record.update(pages=len(pages), sha256=sha256(target.read_bytes()).hexdigest(), snippets=snippets)
    except Exception as error:
        record.update(status='retrieval-failed', error=f'{type(error).__name__}: {error}')
    print(f"{source['gameName']}: {record['status']}", flush=True)
    return record

with ThreadPoolExecutor(max_workers=3) as pool:
    records = list(pool.map(inspect, queue['manuals']))
(root/'intake.json').write_text(json.dumps({'retrievedAt': datetime.now(timezone.utc).isoformat(),
    'warning': 'Machine-extracted leads, not factual approval.', 'retrievalLimitBytes': max_bytes,
    'manuals': records}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(records)} results saved; content and edition review still required.')
