import { createSign } from 'node:crypto';

// Service-account auth without a Google SDK: one signed JWT exchanged for a
// short-lived token. The key comes from a CI secret and is never written to disk.
export async function googleAccessToken(credentialsJson: string, scopes: string[]): Promise<string> {
  const key = JSON.parse(credentialsJson) as { client_email?: string; private_key?: string; token_uri?: string };
  if (!key.client_email || !key.private_key) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must be a service account key with client_email and private_key.');
  const audience = key.token_uri || 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${part({ alg: 'RS256', typ: 'JWT' })}.${part({ iss: key.client_email, scope: scopes.join(' '), aud: audience, iat: now, exp: now + 3600 })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key).toString('base64url');
  const response = await fetch(audience, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }) });
  if (!response.ok) throw new Error(`Google token request failed (${response.status}): ${await response.text()}`);
  return ((await response.json()) as { access_token: string }).access_token;
}

async function postJson<T>(url: string, token: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${new URL(url).host} request failed (${response.status}): ${await response.text()}`);
  return await response.json() as T;
}

export type SearchRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
/** Search Console rows, paginated past the 25,000-row page size. */
export async function searchAnalytics(token: string, property: string, startDate: string, endDate: string, dimensions: string[]): Promise<SearchRow[]> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
  const rows: SearchRow[] = [];
  for (let startRow = 0; ; startRow += 25000) {
    const page = await postJson<{ rows?: SearchRow[] }>(url, token, { startDate, endDate, dimensions, rowLimit: 25000, startRow, dataState: 'final' });
    rows.push(...(page.rows ?? []));
    if (!page.rows || page.rows.length < 25000) return rows;
  }
}

export type AnalyticsTotals = { sessions: number; screenPageViews: number; totalUsers: number };
export async function analyticsTotals(token: string, propertyId: string, startDate: string, endDate: string): Promise<AnalyticsTotals> {
  const report = await postJson<{ rows?: { metricValues: { value: string }[] }[] }>(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`, token, {
    dateRanges: [{ startDate, endDate }], metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'totalUsers' }],
  });
  const [sessions = 0, screenPageViews = 0, totalUsers = 0] = report.rows?.[0]?.metricValues.map(metric => Number(metric.value)) ?? [];
  return { sessions, screenPageViews, totalUsers };
}

/** YYYY-MM-DD for `days` before today (UTC). Search Console data lags about 2–3 days. */
export const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
