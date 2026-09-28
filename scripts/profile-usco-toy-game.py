"""Profile the official USCO Toys or Games tabular CSV as identity leads.

Download the linked ``Toys or Games`` tabular file from
https://www.copyright.gov/economic-research/usco-datasets/ and run:

    python scripts/profile-usco-toy-game.py path/to/reg_toy_or_game_2026_01.csv

The output contains aggregate counts only. This is deliberately not an importer:
registration of artwork, a toy, an unpublished design, or multiple deposits is
not evidence for a distinct published physical game product.
"""

import argparse
from collections import Counter
import csv
from hashlib import sha256
import json
from pathlib import Path
import unicodedata


ROOT = Path(__file__).resolve().parents[1]
TITLE_FIELDS = (
    "title", "alternate_title", "bibliographic_note", "scope_of_rights",
    "statement_of_responsibility", "author_1_authorship_statement",
)
PHRASES = ("board game", "card game", "dice game", "tile game")


def name_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).casefold()
    return "".join(char for char in normalized if char.isalnum() and not unicodedata.combining(char))


def existing_names() -> set[str]:
    paths = (
        ("research/coverage/discovery-index.json", "games"),
        ("research/coverage/wikidata-board-games.json", "games"),
        ("research/coverage/publisher-identities.json", "records"),
    )
    return {
        name_key(game["name"])
        for path, key in paths
        for game in json.loads((ROOT / path).read_text(encoding="utf-8"))[key]
    }


def profile(path: Path) -> dict:
    digest = sha256(path.read_bytes()).hexdigest()
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"record_id", "reg_num", "reg_date", "title", "work_type", "publication_status", "publication_date", "publisher", *TITLE_FIELDS}
        missing = required - set(reader.fieldnames or ())
        if missing:
            raise ValueError(f"Missing CSV columns: {', '.join(sorted(missing))}")
        rows = list(reader)

    existing = existing_names()
    published = [row for row in rows if row["publication_status"] == "PUB"]
    explicit = [
        row for row in published
        if any(phrase in " ".join(row[field] for field in TITLE_FIELDS).casefold() for phrase in PHRASES)
    ]
    return {
        "sourceSha256": digest,
        "sourceBytes": path.stat().st_size,
        "records": len(rows),
        "uniqueRecordIds": len({row["record_id"] for row in rows}),
        "uniqueRegistrationNumbers": len({row["reg_num"] for row in rows}),
        "uniqueNormalizedTitles": len({name_key(row["title"]) for row in rows}),
        "publicationStatus": dict(sorted(Counter(row["publication_status"] for row in rows).items())),
        "publishedWithPublicationDate": sum(bool(row["publication_date"]) for row in published),
        "publishedWithPublisherField": sum(bool(row["publisher"]) for row in published),
        "publishedExplicitAnalogPhrase": len(explicit),
        "publishedExplicitAnalogPhraseWithPublisherField": sum(bool(row["publisher"]) for row in explicit),
        "exactNormalizedTitleOverlapWithLeadPools": sum(name_key(row["title"]) in existing for row in rows),
        "registrationYears": dict(sorted(Counter(row["reg_date"][:4] for row in rows).items())),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_path", type=Path)
    args = parser.parse_args()
    print(json.dumps(profile(args.csv_path), indent=2))
