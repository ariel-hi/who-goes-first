"""Snapshot Wikidata's CC0, English-labeled BoardGameGeek identities.

This is a discovery lead list, not verified starting-player rules or an update to
the live directory. Run from any directory with Python 3.10+:

    python scripts/import-wikidata-board-games.py
    python scripts/import-wikidata-board-games.py --validate

The official Wikidata Query Service is queried once per import. Its P2339 values
and English labels are used; no BGG site/API content is fetched. A repeat run
against the same Wikidata statements, date, and local inventory yields the same
file regardless of SPARQL row order.
"""

import argparse
from collections import defaultdict
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "research/coverage/discovery-index.json"
OUTPUT = ROOT / "research/coverage/wikidata-board-games.json"
ENDPOINT = "https://query.wikidata.org/sparql"
QUERY = '''SELECT ?item ?bggId ?name WHERE {
  ?item wdt:P2339 ?bggId .
  OPTIONAL { ?item rdfs:label ?name . FILTER(LANG(?name)="en") }
}'''
SOURCE_URL = ENDPOINT + "?" + urlencode({"query": QUERY, "format": "json"})
ID_RE = re.compile(r"^[1-9][0-9]{0,5}$")
QID_RE = re.compile(r"^Q[1-9][0-9]*$")


def name_key(value: str) -> str:
    letters = unicodedata.normalize("NFKD", value).casefold()
    return "".join(char for char in letters if char.isalnum() and not unicodedata.combining(char))


def fetch_bindings() -> list[dict]:
    request = Request(
        SOURCE_URL,
        headers={
            "Accept": "application/sparql-results+json",
            "User-Agent": "WhoGoesFirst/1.0 (board-game research; https://whogoesfirst.fun/)",
        },
    )
    with urlopen(request, timeout=60) as response:
        actual = urlparse(response.url)
        if actual.scheme != "https" or actual.hostname != "query.wikidata.org":
            raise ValueError(f"Unexpected Wikidata query redirect: {response.url}")
        data = response.read(8_000_001)
        if len(data) > 8_000_000:
            raise ValueError("Wikidata response exceeded 8 MB")
    payload = json.loads(data)
    if payload.get("head", {}).get("vars") != ["item", "bggId", "name"]:
        raise ValueError("Unexpected Wikidata query response fields")
    return payload["results"]["bindings"]


def make_snapshot(bindings: list[dict], retrieved_on: str) -> dict:
    existing = {
        game["bggId"]: game["name"]
        for game in json.loads(INVENTORY.read_text(encoding="utf-8"))["games"]
    }
    statements: set[tuple[str, str, str | None]] = set()
    for row in bindings:
        item_url = row["item"]["value"]
        if not item_url.startswith("http://www.wikidata.org/entity/"):
            raise ValueError(f"Unexpected Wikidata item URL: {item_url}")
        qid = item_url.rsplit("/", 1)[-1]
        if not QID_RE.fullmatch(qid):
            raise ValueError(f"Unexpected Wikidata item ID: {qid}")
        bgg_id = row["bggId"]["value"].strip()
        if not bgg_id:
            raise ValueError("Empty BoardGameGeek ID from Wikidata")
        label = row.get("name", {}).get("value")
        if label is not None and not label.strip():
            label = None
        statements.add((bgg_id, qid, label))

    ordered_statements = sorted(statements, key=lambda row: (row[0], row[1], row[2] or ""))
    canonical = json.dumps(ordered_statements, ensure_ascii=False, separators=(",", ":"))
    by_id: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for bgg_id, qid, label in ordered_statements:
        if label is not None:
            by_id[bgg_id].append((qid, label))

    title_ids: dict[str, set[str]] = defaultdict(set)
    for bgg_id, items in by_id.items():
        for _, label in items:
            title_ids[name_key(label)].add(bgg_id)

    games = []
    for bgg_id in sorted(by_id, key=lambda value: (int(value) if value.isdigit() else 10**12, value)):
        items = sorted(set(by_id[bgg_id]), key=lambda row: (int(row[0][1:]), row[1]))
        qid, name = items[0]
        flags = []
        if not ID_RE.fullmatch(bgg_id):
            flags.append("nonstandard-bgg-id")
        if len({item[0] for item in items}) > 1:
            flags.append("multiple-wikidata-items-for-id")
        if any(len(title_ids[name_key(label)]) > 1 for _, label in items):
            flags.append("title-shared-by-multiple-ids")
        if not name_key(name) or len(name) > 160 or "\ufffd" in name or any(ord(char) < 32 for char in name):
            flags.append("suspicious-english-label")
        if bgg_id in existing and name_key(existing[bgg_id]) != name_key(name):
            flags.append("current-inventory-title-differs")
        games.append({
            "bggId": bgg_id,
            "name": name,
            "wikidataId": qid,
            "wikidataUrl": f"https://www.wikidata.org/wiki/{qid}",
            "wikidataItems": [
                {"id": item_id, "name": item_name}
                for item_id, item_name in items
            ],
            "alreadyListed": bgg_id in existing,
            "reviewFlags": flags,
        })

    all_ids = {bgg_id for bgg_id, _, _ in statements}
    labeled_ids = set(by_id)
    new_games = [game for game in games if not game["alreadyListed"]]
    return {
        "retrievedOn": retrieved_on,
        "source": {
            "name": "Wikidata Query Service",
            "url": SOURCE_URL,
            "query": QUERY,
            "property": "https://www.wikidata.org/wiki/Property:P2339",
            "license": "CC0-1.0",
            "licenseUrl": "https://www.wikidata.org/wiki/Wikidata:Copyright",
            "statementSha256": sha256(canonical.encode("utf-8")).hexdigest(),
        },
        "scope": "English-labeled Wikidata items with a BoardGameGeek ID. Names and IDs are discovery leads, not verified board-game editions or starting-player rules. No BoardGameGeek API or site data was fetched.",
        "counts": {
            "wikidataStatements": len(statements),
            "uniqueBggIds": len(all_ids),
            "withoutEnglishLabel": len(all_ids - labeled_ids),
            "englishLabeledIds": len(games),
            "alreadyListed": len(games) - len(new_games),
            "newIds": len(new_games),
            "newIdsNeedingReview": sum(bool(game["reviewFlags"]) for game in new_games),
        },
        "games": games,
    }


def validate(snapshot: dict) -> None:
    games = snapshot["games"]
    ids = [game["bggId"] for game in games]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate BGG IDs in import")
    if ids != sorted(ids, key=lambda value: (int(value) if value.isdigit() else 10**12, value)):
        raise ValueError("Import is not sorted by BGG ID")
    counts = snapshot["counts"]
    if counts["englishLabeledIds"] != len(games):
        raise ValueError("English-labeled count mismatch")
    if counts["alreadyListed"] != sum(game["alreadyListed"] for game in games):
        raise ValueError("Current-inventory overlap count mismatch")
    if counts["newIds"] != sum(not game["alreadyListed"] for game in games):
        raise ValueError("New identity count mismatch")
    if counts["withoutEnglishLabel"] != counts["uniqueBggIds"] - len(games):
        raise ValueError("Unlabeled identity count mismatch")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--validate", action="store_true", help="Validate the saved snapshot without network access")
    parser.add_argument("--date", help="UTC retrieval date (YYYY-MM-DD); defaults to today")
    args = parser.parse_args()
    if args.validate:
        snapshot = json.loads(OUTPUT.read_text(encoding="utf-8"))
    else:
        retrieved_on = args.date or datetime.now(timezone.utc).date().isoformat()
        if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", retrieved_on):
            raise ValueError("Date must use YYYY-MM-DD")
        datetime.strptime(retrieved_on, "%Y-%m-%d")
        snapshot = make_snapshot(fetch_bindings(), retrieved_on)
    validate(snapshot)
    if not args.validate:
        OUTPUT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(snapshot["counts"], sort_keys=True))
    print(f"Snapshot: {OUTPUT}")


if __name__ == "__main__":
    main()
