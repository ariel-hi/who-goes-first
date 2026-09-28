import type { AnalyticsTotals } from './google-api';
import type { CountryTrafficSummary } from './country-traffic';

export const adPolicyCheckedOn = '2026-09-28';
export const adPolicySources = {
  mediavine: 'https://www.mediavine.com/mediavine-requirements/',
  mediavinePrograms: 'https://help.mediavine.com/programs-and-the-publisher-path-to-growth',
  raptiveAnalytics: 'https://help.raptive.com/hc/en-us/articles/6681661647515-Applying-to-Raptive-with-Google-Analytics',
  raptiveRequirements: 'https://help.raptive.com/hc/en-us/articles/360032840891-Who-is-eligible-for-Raptive',
} as const;

/** GA4 observations guide research; they do not establish ad-network eligibility. */
export function adNetworkReadiness(traffic?: Pick<AnalyticsTotals, 'sessions' | 'screenPageViews'>, country?: CountryTrafficSummary): string {
  const sessions = traffic?.sessions;
  const views = traffic?.screenPageViews;
  const count = (value: number | undefined) => value === undefined ? 'Unknown' : value.toLocaleString('en');
  const share = (part: number, total: number) => total ? `${(100 * part / total).toFixed(1)}%` : '—';
  const journeyCountry = country ? `${count(country.namedJourneySessions)} sessions from US/CA/GB/AU (${share(country.namedJourneySessions, country.totalSessions)} of GA4 sessions); full Tier 1 set unmeasured` : 'Tier 1 sessions unknown';
  const raptiveCountry = country ? `${count(country.raptiveCountryScreenPageViews)} screen/page views from US/CA/GB/AU/NZ (${share(country.raptiveCountryScreenPageViews, country.totalScreenPageViews)} of GA4 views)` : 'qualifying-country share unknown';
  const journeyStatus = sessions !== undefined && sessions < 1_000
    ? 'Total sessions below the minimum; Tier 1 sessions unknown'
    : country ? 'Four named countries measured; complete Tier 1 count and eligibility unassessed' : 'Unknown — Tier 1 sessions not collected';
  const raptiveStatus = views === undefined ? 'Unknown — GA4 totals unavailable'
    : views < 25_000 ? 'Observed views below the minimum'
      : 'Combined view total reaches the threshold; website pageviews and eligibility unassessed';

  return `## Ad network requirements and observations
Official policies checked ${adPolicyCheckedOn}; confirm current requirements before an application. Totals alone do not establish eligibility or approval.

| Network | Published minimum | Available observation | Status / unassessed requirements |
| --- | --- | --- | --- |
| Journey by Mediavine | 1,000 Tier 1-country sessions within 30 days | ${count(sessions)} total sessions; ${journeyCountry} | ${journeyStatus}. Grow, original content, content quality and traffic standards unassessed. |
| Raptive | 25,000 monthly pageviews within 30 days | ${count(views)} GA4 screenPageViews; ${raptiveCountry} | ${raptiveStatus}. US/CA/UK/AU/NZ requirement: 50% at 25,000–99,999 website pageviews; 40% at 100,000+. Applicable website-pageview tier unknown. Original content with meaningful human involvement, majority long-form pages, domain age ≥6 months, correct Analytics and ad-compatible site unassessed. |
| Mediavine | $5,000 annual ad revenue | Unknown — annual ad revenue not collected | Unknown. Original content, clean human brand-safe traffic, Google AdSense/AdExchange standing and advertising-compatible reader experience unassessed. |

GA4 screenPageViews combines screen and page views; confirm website pageviews for Raptive. ${country ? `The country report shows ${count(country.unattributedSessions)} sessions outside the returned country rows${country.subjectToThresholding || country.dataLossFromOtherRow || country.dataTruncation ? '; Google flagged thresholding, an (other) row, or truncation, so shares may undercount' : ''}.` : 'No country report was available.'} No annual ad-revenue evidence is supplied by this job. Mediavine's 2026 publisher programs use prior-calendar-year ad revenue; monthly traffic is not a substitute.

Sources: [Mediavine and Journey requirements](${adPolicySources.mediavine}), [Mediavine 2026 programs](${adPolicySources.mediavinePrograms}), [Raptive Analytics requirements](${adPolicySources.raptiveAnalytics}), [Raptive full requirements](${adPolicySources.raptiveRequirements}).
`;
}
