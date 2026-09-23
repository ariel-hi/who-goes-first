"""Create unapproved records from explicitly reviewed, manually written inputs.

Requires a publisher intake with source hashes. It never infers an answer,
language, edition or approval, and refuses to overwrite any existing record.
"""
import argparse
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--intake', required=True)
parser.add_argument('--batch', required=True)
parser.add_argument('--publisher', required=True)
args = parser.parse_args()
manuals = json.loads(Path(args.intake).read_text(encoding='utf-8'))['manuals']
batch = json.loads(Path(args.batch).read_text(encoding='utf-8'))
date = datetime.now(timezone.utc).date().isoformat()
prepared = []
for row in batch:
    matches = [m for m in manuals if row['sourceHint'] in m.get('localFile', '')]
    if len(matches) != 1: raise ValueError(f"Ambiguous source: {row['gameName']}")
    source = matches[0]
    if source['status'] != 'needs-source-review': raise ValueError('Unavailable source')
    if sha256(Path(source['localFile']).read_bytes()).hexdigest() != source['sha256']:
        raise ValueError('Source changed since intake')
    if not row['pages'] or any(n < 1 or n > source['pages'] for n in row['pages']):
        raise ValueError('Invalid source page')
    destination = Path('research/games') / f"{row['slug']}.json"
    if destination.exists(): raise FileExistsError(f'Refusing to overwrite {destination}')
    draft = {
        'id': row['slug'], 'slug': row['slug'], 'gameName': row['gameName'], 'aliases': row.get('aliases', []),
        'language': 'en', 'editionLabel': row['editionLabel'], 'firstPlayerRule': row['firstPlayerRule'],
        'officialTieBreak': row.get('officialTieBreak'),
        'houseFallback': row.get('houseFallback', 'If this criterion does not suit your group, agree to choose randomly. This is a house rule.'),
        'clarifications': row.get('clarifications', []), 'interpretation': row.get('interpretation'),
        'sources': [{'url': source['url'], 'title': f"{row['gameName']} — {args.publisher} rules", 'publisher': args.publisher,
                     'printedPages': list(map(str, row.get('printedPages', []))), 'pdfPagesOneBased': row['pages'],
                     'location': row['location'] + '; PDF pages ' + ', '.join(map(str,row['pages'])), 'checkedAt': date}] + row.get('additionalSources', []),
        'internalEvidence': f"Starting instructions were checked on rendered publisher pages, including relevant mode context. Publisher source context: {source['indexSource']}. Finding: {row['firstPlayerRule']} Local source SHA-256: {source['sha256']}. " + row.get('evidenceNotes', ''),
        'uncertainty': row.get('uncertainty', []) + ([] if row.get('officialTieBreak') else ['No starting tie-break is stated alongside this instruction.']) + ['The answer applies to the identified publisher file; other editions may differ.'],
        'status': 'draft', 'approvedBy': None, 'approvedRevision': None, 'publishedAt': None, 'materiallyUpdatedAt': None,
    }
    prepared.append((destination, draft))
for path, draft in prepared:
    with path.open('x', encoding='utf-8') as output:
        json.dump(draft, output, ensure_ascii=False, indent=2)
        output.write('\n')
print(f'Created {len(prepared)} draft records. No approvals or publication.')
