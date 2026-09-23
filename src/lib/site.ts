export function siteSettings(env: Record<string, string | undefined> = process.env) {
  const production = env.DEPLOY_CONTEXT === 'production';
  const site = new URL(env.SITE_URL || 'http://localhost:4321');
  if (site.username || site.password || site.search || site.hash || site.pathname !== '/') throw new Error('SITE_URL must be an origin without a path or private state.');
  if (production && (site.protocol !== 'https:' || /(^|\.)(localhost|example\.(com|org|net)|test|invalid)$/.test(site.hostname) || !site.hostname.includes('.') || /^\d+\./.test(site.hostname))) {
    throw new Error('A production release requires SITE_URL with a real HTTPS canonical domain.');
  }
  return { url: site.origin, production, contact: env.CONTACT_EMAIL || '' };
}
