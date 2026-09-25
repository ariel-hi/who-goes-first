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
  // Revenue settings are optional and inert until set. Each is validated so a
  // typo fails the build instead of shipping a broken ad tag or affiliate link.
  const adsenseClient = env.ADSENSE_CLIENT?.trim() || '';
  const amazonTag = env.AMAZON_ASSOCIATES_TAG?.trim() || '';
  const tipUrl = env.TIP_JAR_URL?.trim() || '';
  if (adsenseClient && !/^ca-pub-\d{10,20}$/.test(adsenseClient)) throw new Error('ADSENSE_CLIENT must look like ca-pub-1234567890123456.');
  if (amazonTag && !/^[a-z0-9-]{3,40}-\d{2}$/i.test(amazonTag)) throw new Error('AMAZON_ASSOCIATES_TAG must look like yourtag-20.');
  if (tipUrl && !/^https:\/\/[^\s/?#]+\.[^\s/?#]+\/\S*$/.test(tipUrl)) throw new Error('TIP_JAR_URL must be an HTTPS link.');
  // Ads never run in previews: AdSense serves only on the approved public domain.
  return { url: site.origin, production, contact, privacyHost, privacyLogging, adsenseClient: production ? adsenseClient : '', amazonTag, tipUrl };
}
