import { getCatalog } from '../lib/content/catalog';
// Compact lookup data for the home page search, fetched only when someone uses it.
export function GET() {
  const rules = getCatalog().map(rule => ({ n: rule.gameName, a: rule.aliases, e: rule.editionLabel, s: rule.slug }));
  return new Response(JSON.stringify(rules), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300, must-revalidate' } });
}
