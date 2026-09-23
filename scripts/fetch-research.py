"""Read-only, bounded publisher PDF retrieval for this initial research batch."""
from pathlib import Path
import urllib.request
import urllib.error
import json

SOURCES = {
    "azul": "https://cdn.svc.asmodee.net/production-nextmove/uploads/sites/4/2024/06/EN-Azul-Rules-Next-Move-web.pdf",
    "catan": "https://www.catan.com/sites/default/files/2021-06/catan_base_rules_2020_200707.pdf",
    "ticket-to-ride": "https://ncdn0.daysofwonder.com/tickettoride/en/img/tt_rules_2015_en.pdf",
}
SOURCES.update(json.loads(Path('research/source-manifest.json').read_text(encoding='utf-8')))

class LimitedRedirects(urllib.request.HTTPRedirectHandler):
    max_redirections = 3
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not newurl.startswith("https://"):
            raise ValueError("Only HTTPS source redirects are allowed")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

directory = Path("research/source-files")
directory.mkdir(parents=True, exist_ok=True)
opener = urllib.request.build_opener(LimitedRedirects())
for name, url in SOURCES.items():
    output = directory / f"{name}.pdf"
    if output.exists():
        print(f"{name}: cached local copy")
        continue
    try:
        with opener.open(urllib.request.Request(url, headers={"User-Agent": "WhoGoesFirstSourceReview/1.0"}), timeout=25) as response:
            data = response.read(35_000_001)
            if len(data) > 35_000_000 or not data.startswith(b"%PDF"):
                raise ValueError("Source is too large or is not a PDF")
            output.write_bytes(data)
        print(f"{name}: {len(data)} bytes")
    except (OSError, ValueError, urllib.error.URLError) as error:
        print(f"{name}: unavailable ({type(error).__name__})")
