"""Snapshot CC0 Wikidata board-game items without a P2339 external ID.

    python scripts/import-wikidata-unlinked-board-games.py
    python scripts/import-wikidata-unlinked-board-games.py --validate

The saved rows are discovery leads only. A title match is a collision to review,
not proof of shared identity. No BoardGameGeek endpoint is queried.
"""

import argparse
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "research/coverage/wikidata-unlinked-board-games.json"
LEGACY = ROOT / "research/coverage/discovery-index.json"
PUBLISHER = ROOT / "research/coverage/publisher-identities.json"
OLDER = ROOT / "research/coverage/wikidata-board-games.json"
NATIVE = ROOT / "research/coverage/wikidata-native-title-leads.json"
REVIEW = ROOT / "research/coverage/wikidata-identity-review.json"
NATIVE_REVIEW = ROOT / "research/coverage/wikidata-native-title-decisions.json"
ENDPOINT = "https://query.wikidata.org/sparql"
QUERY = '''SELECT ?item ?label WHERE {
  ?item wdt:P31 wd:Q131436 .
  FILTER NOT EXISTS { ?item wdt:P2339 ?bggId }
  OPTIONAL { ?item rdfs:label ?label . FILTER(LANG(?label) = "en") }
}'''
SOURCE_URL = ENDPOINT + "?" + urlencode({"query": QUERY, "format": "json"})
QID = re.compile(r"^Q[1-9][0-9]*$")


def name_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).casefold()
    return "".join(char for char in normalized if char.isalnum() and not unicodedata.combining(char))


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def registry_index():
    """Use active names/aliases and documented Wikidata links, retaining ambiguity."""
    names: dict[str, set[str]] = {}
    items: dict[str, set[str]] = {}

    def add_name(value, identity):
        if name_key(value):
            names.setdefault(name_key(value), set()).add(identity)

    original = read_json(LEGACY)["games"]
    active_ids = set()
    original_names = {name_key(game["name"]) for game in original}
    for game in original:
        identity = "bgg-" + game["bggId"]
        active_ids.add(identity)
        for value in [game["name"], *game.get("searchNames", [])]:
            add_name(value, identity)
    for record in read_json(PUBLISHER)["records"]:
        if record["decision"] != "accept":
            continue
        identity = record["identityId"]
        active_ids.add(identity)
        for value in [record["name"], *record["searchNames"]]:
            add_name(value, identity)
        for source in record["sources"]:
            for qid in re.findall(r"(?<![A-Za-z0-9])Q[1-9][0-9]*(?![0-9])", source["url"]):
                items.setdefault(qid, set()).add(identity)
    reviewed = {item["bggId"]: item for item in read_json(REVIEW)["decisions"]}
    for game in read_json(OLDER)["games"]:
        identity = "bgg-" + game["bggId"]
        decision = reviewed.get(game["bggId"])
        if identity not in active_ids and not (
            decision["decision"] == "accept" if decision else not game["reviewFlags"] and name_key(game["name"]) not in original_names
        ):
            continue
        active_ids.add(identity)
        add_name(decision["displayName"] if decision and decision["decision"] == "accept" else game["name"], identity)
        for item in game["wikidataItems"]:
            items.setdefault(item["id"], set()).add(identity)
            add_name(item["name"], identity)
    native_reviewed = {item["bggId"]: item for item in read_json(NATIVE_REVIEW)["decisions"]}
    for candidate in read_json(NATIVE)["candidates"]:
        identity = "bgg-" + candidate["bggId"]
        decision = native_reviewed.get(candidate["bggId"])
        if identity not in active_ids and (not decision or decision["decision"] != "accept"):
            continue
        active_ids.add(identity)
        if decision:
            add_name(decision["displayName"], identity)
        for item in candidate["items"]:
            items.setdefault(item["wikidataId"], set()).add(identity)
            for option in [*item["titleOptions"], *item["aliasOptions"]]:
                add_name(option["text"], identity)
    for decision in read_json(REVIEW)["decisions"]:
        identity = "bgg-" + decision["bggId"]
        if identity in active_ids and decision.get("decision") == "accept":
            add_name(decision["displayName"], identity)
    return names, items


def fetch():
    request = Request(SOURCE_URL, headers={
        "Accept": "application/sparql-results+json",
        "User-Agent": "WhoGoesFirst/1.0 (board-game research; https://whogoesfirst.fun/)",
    })
    with urlopen(request, timeout=90) as response:
        actual = urlparse(response.url)
        if actual.scheme != "https" or actual.hostname != "query.wikidata.org":
            raise ValueError(f"Unexpected Wikidata redirect: {response.url}")
        raw = response.read(4_000_001)
    if len(raw) > 4_000_000:
        raise ValueError("Wikidata response exceeded 4 MB")
    return raw


def make_snapshot(raw: bytes, retrieved_at: str):
    payload = json.loads(raw)
    if payload.get("head", {}).get("vars") != ["item", "label"]:
        raise ValueError("Unexpected Wikidata response fields")
    names, items = registry_index()
    rows = {}
    for binding in payload["results"]["bindings"]:
        url = binding["item"]["value"]
        if not url.startswith("http://www.wikidata.org/entity/"):
            raise ValueError(f"Unexpected item URL: {url}")
        qid = url.rsplit("/", 1)[-1]
        if not QID.fullmatch(qid):
            raise ValueError(f"Unexpected QID: {qid}")
        label = binding.get("label", {}).get("value")
        if label is not None and not label.strip():
            raise ValueError(f"Blank English label: {qid}")
        if qid in rows and rows[qid] != label:
            raise ValueError(f"Conflicting labels: {qid}")
        rows[qid] = label
    ordered = sorted(rows.items(), key=lambda item: int(item[0][1:]))
    canonical = json.dumps(ordered, ensure_ascii=False, separators=(",", ":"))
    games = []
    for qid, label in ordered:
        games.append({
            "wikidataId": qid,
            "labelEn": label,
            "wikidataUrl": f"https://www.wikidata.org/wiki/{qid}",
            "registryItemMatches": sorted(items.get(qid, set())),
            "registryNameMatches": sorted(names.get(name_key(label), set())) if label else [],
        })
    return {
        "retrievedAtUtc": retrieved_at,
        "source": {
            "name": "Wikidata Query Service", "url": SOURCE_URL, "query": QUERY,
            "class": "https://www.wikidata.org/wiki/Q131436",
            "excludedProperty": "https://www.wikidata.org/wiki/Property:P2339",
            "license": "CC0-1.0", "licenseUrl": "https://www.wikidata.org/wiki/Wikidata:Copyright",
            "rawResponseSha256": sha256(raw).hexdigest(),
            "statementSha256": sha256(canonical.encode("utf-8")).hexdigest(),
        },
        "registryInputs": {str(path.relative_to(ROOT)).replace("\\", "/"): sha256(path.read_bytes()).hexdigest()
                           for path in [LEGACY, PUBLISHER, OLDER, NATIVE, REVIEW, NATIVE_REVIEW]},
        "scope": "Direct P31 board-game items lacking P2339 at query time. Labels are English where present. Registry item/name matches are discovery collision flags, not a claim that any two editions are identical. No starting-player rules are approved.",
        "counts": {
            "items": len(games),
            "englishLabeled": sum(game["labelEn"] is not None for game in games),
            "registryItemMatches": sum(bool(game["registryItemMatches"]) for game in games),
            "registryNameMatches": sum(bool(game["registryNameMatches"]) for game in games),
        },
        "games": games,
    }


def validate(snapshot):
    games = snapshot["games"]
    ids = [game["wikidataId"] for game in games]
    if len(ids) != len(set(ids)) or ids != sorted(ids, key=lambda value: int(value[1:])):
        raise ValueError("Duplicate or unsorted Wikidata items")
    rows = [(game["wikidataId"], game["labelEn"]) for game in games]
    canonical = json.dumps(rows, ensure_ascii=False, separators=(",", ":"))
    if sha256(canonical.encode("utf-8")).hexdigest() != snapshot["source"]["statementSha256"]:
        raise ValueError("Source statement hash mismatch")
    if snapshot["counts"] != {
        "items": len(games),
        "englishLabeled": sum(game["labelEn"] is not None for game in games),
        "registryItemMatches": sum(bool(game["registryItemMatches"]) for game in games),
        "registryNameMatches": sum(bool(game["registryNameMatches"]) for game in games),
    }:
        raise ValueError("Snapshot counts do not reconcile")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    if args.validate:
        snapshot = read_json(OUTPUT)
    else:
        snapshot = make_snapshot(fetch(), datetime.now(timezone.utc).isoformat())
    validate(snapshot)
    if not args.validate:
        OUTPUT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(snapshot["counts"], sort_keys=True))
    print(OUTPUT)


if __name__ == "__main__":
    main()
