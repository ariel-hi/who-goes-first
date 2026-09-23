export function siteSettings(env: Record<string, string | undefined> = process.env) {
  const production = env.DEPLOY_CONTEXT === 'production';
  const site = new URL(env.SITE_URL || 'http://localhost:4321');
  const contact = env.CONTACT_EMAIL?.trim() || '';
  const privacyHost = env.PRIVACY_HOST_NAME?.trim() || '';
  const privacyLogging = env.PRIVACY_LOGGING_POLICY?.trim() || '';
  if (site.username || site.password || site.search || site.hash || site.pathname !== '/') throw new Error('SITE_URL must be an origin without a path or private state.');
  if (production && (site.protocol !== 'https:' || /(^|\.)(localhost|example\.(com|org|net)|test|invalid)$/.test(site.hostname) || !site.hostname.includes('.') || /^\d+\./.test(site.hostname))) {
    throw new Error('A production release requires SITE_URL with a real HTTPS canonical domain.');
  }
  if (production && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contact)) {
    throw new Error('A production release requires a maintained CONTACT_EMAIL.');
  }
  if (production && (!privacyHost || !privacyLogging)) {
    throw new Error('A production release requires PRIVACY_HOST_NAME and PRIVACY_LOGGING_POLICY.');
  }
  return { url: site.origin, production, contact, privacyHost, privacyLogging };
}
