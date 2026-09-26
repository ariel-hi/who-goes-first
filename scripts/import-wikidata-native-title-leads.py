"""Supplementary native-title discovery, never active inventory enrollment.

Fetches official Wikidata CC0 structured data only. Raw query/entity responses
are cached under ignored artifacts; the complete candidate snapshot is tracked.
No BoardGameGeek source or verified starting-rule content is fetched.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'research/coverage/wikidata-native-title-leads.json'
DECISIONS = ROOT / 'research/coverage/wikidata-native-title-decisions.json'
CACHE = ROOT / 'artifacts/native-title-full-sept26'
QUERY = '''SELECT DISTINCT ?item ?bggId WHERE {
  ?item wdt:P2339 ?bggId .
  FILTER(REGEX(STR(?bggId), "^[0-9]+$"))
  FILTER NOT EXISTS {
    ?labeled wdt:P2339 ?bggId ; rdfs:label ?en .
    FILTER(LANG(?en) = "en")
  }
} ORDER BY xsd:integer(?bggId) ?bggId ?item'''

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))

def digest(value):
    return sha256(canonical(value).encode('utf-8')).hexdigest()

def name_key(value):
    return ''.join(c for c in unicodedata.normalize('NFKD', value).casefold() if c.isalnum() and not unicodedata.combining(c))

def fetch(url, path):
    request = Request(url, headers={'Accept':'application/json', 'User-Agent':'WhoGoesFirst/1.0 (Wikidata CC0 native-title research; https://whogoesfirst.fun/)'})
    with urlopen(request, timeout=45) as response:
        actual = urlparse(response.url)
        if actual.scheme != 'https' or actual.hostname not in {'query.wikidata.org', 'www.wikidata.org'}:
            raise ValueError(f'Unexpected Wikidata redirect: {response.url}')
        data = response.read(16_000_001)
        if len(data)>16_000_000:
            raise ValueError('Oversized response')
    path.write_bytes(data)
    return json.loads(data)

def inventory():
    files=[ROOT/'research/coverage/discovery-index.json', ROOT/'research/coverage/wikidata-board-games.json', ROOT/'research/coverage/wikidata-identity-review.json']
    original, english, review = [json.loads(p.read_text(encoding='utf-8')) for p in files]
    games=list(original['games'])
    ids={g['bggId'] for g in games}; names={name_key(g['name']) for g in games}
    decisions={d['bggId']:d for d in review['decisions']}
    for game in english['games']:
        if game['bggId'] in ids:
            continue
        decision=decisions.get(game['bggId'])
        accepted=decision['decision']=='accept' if decision else not game['reviewFlags'] and name_key(game['name']) not in names
        if accepted:
            games.append({'bggId':game['bggId'],'name':decision['displayName'] if decision else game['name'],'wikidataItems':game['wikidataItems']})
    return games, {str(p.relative_to(ROOT)):sha256(p.read_bytes()).hexdigest() for p in files}

def build(raw, entities, api_requests, retrieved_at):
    games, hashes=inventory()
    api_requests=[{**request, 'rawResponseSha256':sha256((CACHE/request['cacheFile']).read_bytes()).hexdigest(), 'rawResponseBytes':(CACHE/request['cacheFile']).stat().st_size} for request in api_requests]
    statements=sorted({(r['bggId']['value'],r['item']['value'].rsplit('/',1)[-1]) for r in raw['results']['bindings']}, key=lambda v:(int(v[0]),v[0],int(v[1][1:])))
    by_id={}
    for bgg,qid in statements:
        by_id.setdefault(bgg,[]).append(qid)
    title_ids={}
    for bgg,qids in by_id.items():
        for qid in qids:
            entity=entities[qid]
            options=[v['value'] for v in entity.get('labels',{}).values()]
            options += [c['mainsnak']['datavalue']['value']['text'] for c in entity.get('claims',{}).get('P1476',[]) if c['mainsnak'].get('datavalue',{}).get('type')=='monolingualtext']
            for value in options:
                title_ids.setdefault(name_key(value),set()).add(bgg)
    candidates=[]
    for bgg,qids in by_id.items():
        records=[]; flags=[]
        if not re.fullmatch('[1-9][0-9]{0,5}',bgg):flags.append('nonstandard-numeric-p2339')
        if len(qids)>1:flags.append('multiple-qids-for-p2339')
        id_matches=[{'bggId':g['bggId'],'name':g['name']} for g in games if g['bggId']==bgg]
        if id_matches:flags.append('already-in-effective-inventory')
        for qid in qids:
            e=entities[qid]
            options=[{'text':v['value'],'language':lang,'source':'label'} for lang,v in sorted(e.get('labels',{}).items())]
            for claim in e.get('claims',{}).get('P1476',[]):
                value=claim['mainsnak'].get('datavalue',{})
                if value.get('type')=='monolingualtext':options.append({**value['value'],'source':'P1476','statementId':claim['id'],'rank':claim['rank'],'qualifiers':claim.get('qualifiers',{})})
            aliases=[{'text':v['value'],'language':lang,'source':'alias'} for lang,values in sorted(e.get('aliases',{}).items()) for v in values]
            collisions=[]
            for option in options+aliases:
                key=name_key(option['text'])
                if not key:continue
                matches=[{'bggId':g['bggId'],'name':g['name']} for g in games if name_key(g['name'])==key and g['bggId']!=bgg]
                native_matches=sorted(title_ids.get(key,set())-{bgg},key=int)
                if matches or native_matches:collisions.append({'name':option,'inventoryMatches':matches,'otherNativeCandidateIds':native_matches})
            claims=e.get('claims',{}).get('P2339',[])
            values=[c['mainsnak']['datavalue']['value'] for c in claims if c['mainsnak'].get('datavalue',{}).get('type')=='string' and c.get('rank')!='deprecated']
            if len(set(values))>1:flags.append('multiple-current-p2339-values-on-qid')
            if collisions:flags.append('title-or-alias-collision')
            if any(c.get('qualifiers',{}).get('P407') for c in claims):flags.append('claim-scoped-language')
            if 'en' in e.get('labels',{}):flags.append('entity-english-label-added-since-query')
            if not options:flags.append('no-label-or-p1476-title')
            instance_ids={c['mainsnak'].get('datavalue',{}).get('value',{}).get('id') for c in e.get('claims',{}).get('P31',[])}
            if instance_ids & {'Q60474521','Q642946'}:flags.append('expansion-or-gamebook-scope')
            records.append({'wikidataId':qid,'wikidataUrl':'https://www.wikidata.org/wiki/'+qid,'revision':e.get('lastrevid'),'modified':e.get('modified'),'entitySha256':digest(e),'titleOptions':options,'aliasOptions':aliases,'bggIdClaims':claims,'titleCollisions':collisions,'entity':e})
        candidates.append({'bggId':bgg,'rawP2339Values':[bgg],'alreadyListed':bool(id_matches),'existingIdMatches':id_matches,'reviewFlags':sorted(set(flags)),'startingRuleApproved':False,'items':records})
    source_url='https://query.wikidata.org/sparql?'+urlencode({'query':QUERY,'format':'json'})
    return {'schemaVersion':1,'retrievedOn':retrieved_at[:10],'retrievedAt':retrieved_at,'scope':'Supplementary discovery only: complete current numeric P2339 pool with no English label on any corresponding Wikidata item. Preserves raw IDs, native/mul labels, P1476 and all entity claims/revisions. No identities enrolled and no starting rules approved. Official Wikidata CC0 only; no BoardGameGeek source fetched.','source':{'name':'Wikidata Query Service and official Wikidata API','url':source_url,'query':QUERY,'property':'https://www.wikidata.org/wiki/Property:P2339','license':'CC0-1.0','licenseUrl':'https://www.wikidata.org/wiki/Wikidata:Copyright','statementSha256':digest(statements),'entitiesSha256':digest(entities),'rawQuerySha256':sha256((CACHE/'pool-response.json').read_bytes()).hexdigest(),'apiRequests':api_requests,'rawCacheDirectory':CACHE.relative_to(ROOT).as_posix()},'localInventoryInputs':hashes,'counts':{'queryRows':len(raw['results']['bindings']),'uniqueRawNumericP2339Ids':len(by_id),'wikidataItems':len(entities),'effectiveInventoryCompared':len(games),'alreadyListed':sum(c['alreadyListed'] for c in candidates),'withLabelOrP1476':sum(any(i['titleOptions'] for i in c['items']) for c in candidates),'withP1476':sum(any(any(o['source']=='P1476' for o in i['titleOptions']) for i in c['items']) for c in candidates),'withMulLabel':sum(any('mul' in i['entity'].get('labels',{}) for i in c['items']) for c in candidates),'needsAmbiguityReview':sum(bool(c['reviewFlags']) for c in candidates),'missingName':sum(not any(i['titleOptions'] for i in c['items']) for c in candidates)},'candidates':candidates}

def validate(data):
    candidates=data['candidates']; ids=[c['bggId'] for c in candidates]
    assert ids==sorted(set(ids),key=lambda v:(int(v),v))
    assert data['counts']['uniqueRawNumericP2339Ids']==len(ids)
    assert all(not c['startingRuleApproved'] for c in candidates)
    assert all(re.fullmatch('[0-9]+',bgg) for bgg in ids)
    assert all(i['revision'] and i['entitySha256']==digest(i['entity']) for c in candidates for i in c['items'])
    entities={i['wikidataId']:i['entity'] for c in candidates for i in c['items']}
    statements=[(c['bggId'],i['wikidataId']) for c in candidates for i in c['items']]
    assert data['source']['statementSha256']==digest(statements)
    assert data['source']['entitiesSha256']==digest(entities)
    assert data['counts']['wikidataItems']==len(entities)
    assert all(c['rawP2339Values']==[c['bggId']] for c in candidates)
    assert all(any(claim['mainsnak'].get('property')=='P2339' and claim['mainsnak'].get('snaktype')=='value' and claim['mainsnak'].get('datavalue',{}).get('type')=='string' and claim['mainsnak'].get('datavalue',{}).get('value')==c['bggId'] and claim['rank']!='deprecated' for claim in i['bggIdClaims']) for c in candidates for i in c['items'])
    assert all(i['wikidataId']==i['entity']['id'] and i['revision']==i['entity']['lastrevid'] for c in candidates for i in c['items'])
    assert all(re.fullmatch('[0-9a-f]{64}',request['rawResponseSha256']) for request in data['source']['apiRequests'])
    expected_counts={
        'queryRows':len(statements),
        'uniqueRawNumericP2339Ids':len(ids),
        'wikidataItems':len(entities),
        'alreadyListed':sum(c['alreadyListed'] for c in candidates),
        'withLabelOrP1476':sum(any(i['titleOptions'] for i in c['items']) for c in candidates),
        'withP1476':sum(any(any(o['source']=='P1476' for o in i['titleOptions']) for i in c['items']) for c in candidates),
        'withMulLabel':sum(any('mul' in i['entity'].get('labels',{}) for i in c['items']) for c in candidates),
        'needsAmbiguityReview':sum(bool(c['reviewFlags']) for c in candidates),
        'missingName':sum(not any(i['titleOptions'] for i in c['items']) for c in candidates),
    }
    assert all(data['counts'][key]==value for key,value in expected_counts.items())
    assert all(i['bggIdClaims']==i['entity'].get('claims',{}).get('P2339',[]) for c in candidates for i in c['items'])
    games,input_hashes=inventory()
    assert input_hashes==data['localInventoryInputs']
    assert data['counts']['effectiveInventoryCompared']==len(games)

def validate_decisions(snapshot):
    if not DECISIONS.exists():
        return None
    data=json.loads(DECISIONS.read_text(encoding='utf-8'))
    assert data['sourceSnapshot']==OUTPUT.relative_to(ROOT).as_posix()
    assert data['sourceSnapshotSha256']==sha256(OUTPUT.read_bytes()).hexdigest()
    assert data['sourceSnapshotStatementSha256']==snapshot['source']['statementSha256']
    assert data['sourceSnapshotEntitiesSha256']==snapshot['source']['entitiesSha256']
    candidates={c['bggId']:c for c in snapshot['candidates']}
    decisions=data['decisions']; ids=[d['bggId'] for d in decisions]
    assert ids==list(candidates)
    assert data['counts']['totalCandidates']==len(decisions)
    assert data['counts']['accept']==sum(d['decision']=='accept' for d in decisions)
    assert data['counts']['hold']==sum(d['decision']=='hold' for d in decisions)
    assert data['counts']['reviewed']==sum(d['reviewed'] for d in decisions)
    assert data['counts']['unreviewed']==sum(not d['reviewed'] for d in decisions)
    assert data['counts']['priorUnheldReviewed']==sum(d['reviewed'] and d['priorBoundedDisposition']=='native-title research lead' for d in decisions)
    assert data['counts']['priorUnheldAccepted']==sum(d['decision']=='accept' and d['priorBoundedDisposition']=='native-title research lead' for d in decisions)
    assert data['counts']['additionalAccepted']==sum(d['decision']=='accept' and d['priorBoundedDisposition'] is None for d in decisions)
    for decision in decisions:
        candidate=candidates[decision['bggId']]
        assert decision['decision'] in {'accept','hold'} and not decision['startingRuleApproved']
        assert decision['wikidataItems']==[i['wikidataId'] for i in candidate['items']]
        item=next(i for i in candidate['items'] if i['wikidataId']==decision['selectedTitle']['wikidataId'])
        selected={k:v for k,v in decision['selectedTitle'].items() if k!='wikidataId'}
        assert selected in item['titleOptions']
        if selected['source']=='label':
            assert item['entity']['labels'][selected['language']]=={'language':selected['language'],'value':selected['text']}
        else:
            assert any(claim['id']==selected['statementId'] and claim['rank']!='deprecated' and claim['mainsnak'].get('datavalue',{}).get('type')=='monolingualtext' and claim['mainsnak']['datavalue']['value']=={'language':selected['language'],'text':selected['text']} for claim in item['entity'].get('claims',{}).get('P1476',[]))
        assert decision['displayName']==selected['text']
        assert decision['snapshotReviewFlags']==candidate['reviewFlags']
        assert decision['idProvenance']==[{'wikidataId':i['wikidataId'],'revision':i['revision'],'entitySha256':i['entitySha256'],'statements':[claim['id'] for claim in i['bggIdClaims'] if claim['rank']!='deprecated' and claim['mainsnak'].get('datavalue',{}).get('value')==decision['bggId']]} for i in candidate['items']]
        assert all(source_id in data['sources'] for source_id in decision['sourceIds'])
        if decision['decision']=='accept':
            assert decision['reviewed'] and decision['sourceIds'] and decision['identityEvidence']
            assert not candidate['alreadyListed'] and not candidate['reviewFlags']
            assert all(data['sources'][source_id]['kind'] in {'primary-author','primary-publisher','primary-author-publisher'} and data['sources'][source_id]['status']=='retrieved' and re.fullmatch('[0-9a-f]{64}',data['sources'][source_id]['sha256']) for source_id in decision['sourceIds'])
    for source in data['sources'].values():
        assert source['url'].startswith(('https://','http://'))
        if source['status']=='retrieved':
            assert re.fullmatch('[0-9a-f]{64}',source['sha256'])
            path=ROOT/source['cacheFile']
            if path.exists():assert sha256(path.read_bytes()).hexdigest()==source['sha256']
    return data['counts']

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--validate',action='store_true')
    parser.add_argument('--cached',action='store_true',help='Rebuild from cached official responses; no network')
    args=parser.parse_args()
    if args.validate:
        data=json.loads(OUTPUT.read_text(encoding='utf-8'));validate(data);print(json.dumps(data['counts'],sort_keys=True))
        decisions_counts=validate_decisions(data)
        if decisions_counts:print(json.dumps(decisions_counts,sort_keys=True))
        return
    CACHE.mkdir(parents=True,exist_ok=True)
    (CACHE/'pool-query.sparql').write_text(QUERY+'\n',encoding='utf-8')
    if args.cached:
        raw=json.loads((CACHE/'pool-response.json').read_text(encoding='utf-8'))
        metadata=json.loads((CACHE/'requests.json').read_text(encoding='utf-8'))
        entities={}
        for request in metadata['apiRequests']:
            entities.update(json.loads((CACHE/request['cacheFile']).read_text(encoding='utf-8'))['entities'])
    else:
        raw=fetch('https://query.wikidata.org/sparql?'+urlencode({'query':QUERY,'format':'json'}),CACHE/'pool-response.json')
        qids=sorted({r['item']['value'].rsplit('/',1)[-1] for r in raw['results']['bindings']},key=lambda q:int(q[1:]))
        requests=[]
        for start in range(0,len(qids),50):
            batch=qids[start:start+50]
            url='https://www.wikidata.org/w/api.php?'+urlencode({'action':'wbgetentities','ids':'|'.join(batch),'props':'labels|descriptions|aliases|claims|sitelinks|info','format':'json'})
            requests.append({'url':url,'qids':batch,'cacheFile':f'entities-{start//50+1:02}.json'})
        with ThreadPoolExecutor(max_workers=3) as pool:
            results=list(pool.map(lambda req:fetch(req['url'],CACHE/req['cacheFile']),requests))
        entities={qid:e for result in results for qid,e in result['entities'].items()}
        metadata={'retrievedAt':datetime.now(timezone.utc).isoformat(),'apiRequests':requests}
        (CACHE/'requests.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    data=build(raw,entities,metadata['apiRequests'],metadata['retrievedAt']);validate(data)
    OUTPUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(data['counts'],sort_keys=True));print(str(OUTPUT))

if __name__=='__main__':main()
