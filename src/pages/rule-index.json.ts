import { getCatalog } from '../lib/content/catalog';
import { getRuleSearchAliases } from '../lib/content/rule-search';
// Compact lookup data for the home page search, fetched only when someone uses it.
export function GET() {
  const aliases = getRuleSearchAliases();
  const rules = getCatalog().map(rule => ({ n: rule.gameName, a: aliases.get(rule.id) ?? rule.aliases, e: rule.editionLabel, s: rule.slug }));
  return new Response(JSON.stringify(rules), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300, must-revalidate' } });
}
