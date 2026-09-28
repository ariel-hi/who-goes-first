"""Rebuild or validate the bounded Smithsonian/NYPL identity-lead audit.

Download the exact official source files named in sep28-museum-cc0-pilot.md to
ignored artifacts/coverage-research/, then run this script from any directory.
It never imports identities into the public directory.
"""

import argparse
import csv
from hashlib import sha256
import json
from pathlib import Path
import unicodedata


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts/coverage-research"
OUTPUT = ROOT / "research/coverage/sep28-museum-cc0-pilot.json"
FILES = {
    "smithsonian-board-game-50.json": "76cf4b22b44e6374cdf1fad240c024a95617818fb759513e9eca143181904ce7",
    "nypl-pd-items-1.csv": "7b58984d467cc760eb5a772d6c3c89e431aee9b990a298f948b348151ccc074a",
    "nypl-pd-items-2.csv": "fc222e027322c66c50b83058a1930257b56821bc290ac4e3f8e0c469db08c9da",
    "nypl-pd-collections.csv": "578c09d19393055cd8b40d8bd4f1754eabb65bd3ea3ecf3b038e6ea5358f490c",
}
SMITHSONIAN_QUERY = "https://api.si.edu/openaccess/api/v1.0/search?q=board%20game&rows=50&start=0&api_key=DEMO_KEY"
SMITHSONIAN_HOLDS = {
    6: "generic-object-title", 7: "generic-object-title", 16: "unspecified-electric-football-edition",
    19: "publisher-artifact-and-edition-unverified", 21: "generic-worlds-fair-title",
    22: "publisher-artifact-and-edition-unverified", 25: "maker-and-edition-unverified",
    26: "traditional-game-object-not-retail-product", 27: "generic-worlds-fair-title",
    28: "generic-worlds-fair-title", 31: "publisher-artifact-and-edition-unverified",
    32: "traditional-game-object-not-retail-product", 36: "publisher-artifact-and-edition-unverified",
    37: "publisher-artifact-and-edition-unverified", 38: "maker-and-edition-unverified",
    39: "maker-and-edition-unverified", 40: "generic-object-title",
    41: "publisher-artifact-and-edition-unverified", 42: "publisher-artifact-and-edition-unverified",
    45: "publisher-artifact-and-edition-unverified", 46: "publisher-artifact-and-edition-unverified",
    47: "franchise-edition-correspondence-unverified",
}
SMITHSONIAN_PUZZLE = {34}
SMITHSONIAN_NAMED_PRODUCTS = {19, 22, 25, 31, 36, 37, 38, 39, 41, 42, 45, 46, 47}
NYPL_TERMS = ("board game", "card game", "dice game", "tile game")
NYPL_COLLECTION_ID = "9a304ec0-6281-0130-61d8-58d385a7bbd0"
NYPL_GAME_ITEMS = {
    "43b3ef90-6282-0130-a63f-58d385a7bbd0",
    "70355b00-74a7-0130-b7e9-58d385a7bbd0",
    "4e1055b0-74a7-0130-1d05-58d385a7bbd0",
}
LATER_ACCEPTED_NAMES = {
    "The Road to the Temple of Honour and Fame (J. Harris 1811)",
    "The Telephone Game (Ideal Spellbinders No. 2410)",
}


def name_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).casefold()
    return "".join(char for char in normalized if char.isalnum() and not unicodedata.combining(char))


def verify_sources() -> dict[str, str]:
    for filename, expected in FILES.items():
        actual = sha256((ARTIFACTS / filename).read_bytes()).hexdigest()
        if actual != expected:
            raise ValueError(f"Source checksum changed: {filename}: {actual}")
    return FILES


def existing_names() -> set[str]:
    def rows(filename: str, key: str) -> list[dict]:
        return json.loads((ROOT / "research/coverage" / filename).read_text(encoding="utf-8"))[key]

    original = rows("discovery-index.json", "games")
    original_ids = {row["bggId"] for row in original}
    original_names = {name_key(row["name"]) for row in original}
    reviews = {row["bggId"]: row for row in rows("wikidata-identity-review.json", "decisions")}
    wikidata = []
    for row in rows("wikidata-board-games.json", "games"):
        if row["bggId"] in original_ids:
            continue
        review = reviews.get(row["bggId"])
        if (review["decision"] == "accept" if review else not row["reviewFlags"] and name_key(row["name"]) not in original_names):
            wikidata.append({"name": review.get("displayName", row["name"]) if review else row["name"], "bggId": row["bggId"]})
    native_decisions = rows("wikidata-native-title-decisions.json", "decisions")
    native_candidates = {row["bggId"]: row for row in rows("wikidata-native-title-leads.json", "candidates")}
    native = [{"name": row["displayName"],
               "searchNames": [title["text"] for item in native_candidates[row["bggId"]]["items"]
                               for title in item["titleOptions"]]}
              for row in native_decisions if row["decision"] == "accept"]
    publisher = [row for row in rows("publisher-identities.json", "records")
                 if row["decision"] == "accept" and row["name"] not in LATER_ACCEPTED_NAMES]
    # Reproduce the fixed pre-museum-pilot 5,246 comparison set, whether the
    # two sibling records have been merged into this checkout or not.
    sibling = [("Above and Below", []), ("Escape the Dark Castle (First Edition)", ["Escape the Dark Castle"])]
    missing_sibling = [(name, aliases) for name, aliases in sibling if all(row["name"] != name for row in publisher)]
    if len(original) + len(wikidata) + len(native) + len(publisher) + len(missing_sibling) != 5246:
        raise ValueError("5,246-identity comparison baseline changed")
    names = {name_key(title) for row in [*original, *wikidata, *native, *publisher]
             for title in (row["name"], *row.get("searchNames", []))}
    names.update(name_key(title) for name, aliases in missing_sibling for title in (name, *aliases))
    return names


def build() -> dict:
    verify_sources()
    names = existing_names()
    smith = json.loads((ARTIFACTS / "smithsonian-board-game-50.json").read_text(encoding="utf-8"))["response"]
    if smith["rowCount"] != 860 or len(smith["rows"]) != 50:
        raise ValueError("Smithsonian query window changed")
    smith_rows = []
    for index, row in enumerate(smith["rows"]):
        object_types = row["content"].get("indexedStructured", {}).get("object_type", [])
        detail = row["content"].get("descriptiveNonRepeating", {})
        record_id = detail.get("record_ID")
        if not record_id:
            raise ValueError(f"Smithsonian result lacks record ID: {index}")
        media_count = len(detail.get("online_media", {}).get("media", []))
        if index in SMITHSONIAN_NAMED_PRODUCTS and media_count:
            raise ValueError(f"Named object media status changed: {record_id}")
        decision = "hold" if index in SMITHSONIAN_HOLDS else "exclude"
        reason = SMITHSONIAN_HOLDS.get(index) or ("jigsaw-puzzle" if index in SMITHSONIAN_PUZZLE else "not-a-distinct-physical-tabletop-product")
        smith_rows.append({
            "index": index, "recordId": record_id, "title": row["title"], "unit": row["unitCode"],
            "objectTypes": object_types, "onlineMediaCount": media_count,
            "sourceUrl": f"https://api.si.edu/openaccess/api/v1.0/content/edanmdm:{record_id}?api_key=DEMO_KEY",
            "exactTitleCollision": name_key(row["title"]) in names,
            "decision": decision, "reason": reason,
        })

    nypl_rows = []
    scanned = 0
    for filename in ("nypl-pd-items-1.csv", "nypl-pd-items-2.csv"):
        with (ARTIFACTS / filename).open(encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle):
                scanned += 1
                phrase_match = any(term in (row["Title"] + " " + row["Subject Topical"]).casefold() for term in NYPL_TERMS)
                game_item = row["UUID"] in NYPL_GAME_ITEMS
                if not phrase_match and not game_item:
                    continue
                if game_item and row["Collection UUID"] != NYPL_COLLECTION_ID:
                    raise ValueError("NYPL game item changed collection")
                nypl_rows.append({
                    "uuid": row["UUID"], "title": row["Title"], "resourceType": row["Resource Type"],
                    "collectionUuid": row["Collection UUID"], "sourceUrl": row["Digital Collections URL"].replace("http://", "https://"),
                    "exactTitleCollision": name_key(row["Title"]) in names,
                    "decision": "hold" if game_item else "exclude",
                    "reason": "three-items-one-product-original-imprint-unreviewed" if game_item else "depiction-or-other-nonproduct",
                })
    if scanned != 190494 or len(nypl_rows) != 28 or {row["uuid"] for row in nypl_rows if row["decision"] == "hold"} != NYPL_GAME_ITEMS:
        raise ValueError("NYPL selection changed")
    collections = list(csv.DictReader((ARTIFACTS / "nypl-pd-collections.csv").open(encoding="utf-8-sig", newline="")))
    collection = next((row for row in collections if row["UUID"] == NYPL_COLLECTION_ID), None)
    if not collection or collection["Number of Items"] != "3" or name_key(collection["Title"]) in names:
        raise ValueError("NYPL candidate collection changed or now collides")
    return {
        "retrievedOn": "2026-09-28", "comparisonBaseline": "c08f778e plus two accepted publisher identities from 522165e2 (5,246 reported)",
        "sourceHashes": FILES, "smithsonian": {"query": SMITHSONIAN_QUERY, "reportedMatches": smith["rowCount"], "reviewed": smith_rows},
        "nypl": {"snapshot": "https://github.com/NYPL-publicdomain/data-and-utilities/tree/master/items", "scannedItems": scanned,
                 "gameCollection": {"uuid": NYPL_COLLECTION_ID, "title": collection["Title"], "publisher": collection["Publisher"],
                                    "date": collection["Date"], "itemCount": 3,
                                    "sourceUrl": collection["Digital Collections URL"].replace("http://", "https://")},
                 "reviewed": nypl_rows},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--validate", action="store_true", help="Compare the saved audit to source-derived output")
    args = parser.parse_args()
    result = build()
    serialized = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.validate:
        if OUTPUT.read_text(encoding="utf-8") != serialized:
            raise ValueError("Saved museum pilot differs from reviewed source snapshot")
    else:
        OUTPUT.write_text(serialized, encoding="utf-8")
    print(f"Smithsonian: {len(result['smithsonian']['reviewed'])} reviewed, {sum(x['decision'] == 'hold' for x in result['smithsonian']['reviewed'])} held")
    print(f"NYPL: {len(result['nypl']['reviewed'])} matched item rows, {sum(x['decision'] == 'hold' for x in result['nypl']['reviewed'])} held as one product")
