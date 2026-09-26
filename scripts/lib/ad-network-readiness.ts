import type { AnalyticsTotals } from './google-api';

export const adPolicyCheckedOn = '2026-09-26';
export const adPolicySources = {
  mediavine: 'https://www.mediavine.com/mediavine-requirements/',
  mediavinePrograms: 'https://help.mediavine.com/programs-and-the-publisher-path-to-growth',
  raptiveAnalytics: 'https://help.raptive.com/hc/en-us/articles/6681661647515-Applying-to-Raptive-with-Google-Analytics',
  raptiveRequirements: 'https://help.raptive.com/hc/en-us/articles/360031181471-Raptive-FAQs',
} as const;

/** Totals cannot establish country-qualified traffic, annual ad revenue or site quality. */
export function adNetworkReadiness(traffic?: Pick<AnalyticsTotals, 'sessions' | 'screenPageViews'>): string {
  const sessions = traffic?.sessions;
  const views = traffic?.screenPageViews;
  const count = (value: number | undefined) => value === undefined ? 'Unknown' : value.toLocaleString('en');
  const journeyStatus = sessions !== undefined && sessions < 1_000
    ? 'Total sessions below the minimum; Tier 1 sessions unknown'
    : 'Unknown — Tier 1 sessions not collected';
  const raptiveStatus = views === undefined ? 'Unknown — GA4 totals unavailable'
    : views < 25_000 ? 'Observed views below the minimum'
      : 'Combined view total reaches the threshold; website pageviews and eligibility unassessed';

  return `## Ad network requirements and observations
Official policies checked ${adPolicyCheckedOn}; confirm current requirements before an application. Totals alone do not establish eligibility or approval.

| Network | Published minimum | Available observation | Status / unassessed requirements |
| --- | --- | --- | --- |
| Journey by Mediavine | 1,000 Tier 1-country sessions within 30 days | ${count(sessions)} total sessions; Tier 1 sessions unknown | ${journeyStatus}. Original content, content quality and traffic standards unassessed. |
| Raptive | 25,000 monthly pageviews within 30 days | ${count(views)} GA4 screenPageViews; qualifying-country share unknown | ${raptiveStatus}. US/CA/UK/AU/NZ requirement: 50% at 25,000–99,999 website pageviews; 40% at 100,000+. Applicable website-pageview tier unknown. Original content with meaningful human involvement, majority long-form pages, domain age ≥6 months, correct Analytics and ad-compatible site unassessed. |
| Mediavine | $5,000 annual ad revenue | Unknown — annual ad revenue not collected | Unknown. Original content, clean human brand-safe traffic, Google AdSense/AdExchange standing and advertising-compatible reader experience unassessed. |

GA4 screenPageViews combines screen and page views; confirm website pageviews for Raptive. No country report or annual ad-revenue evidence is supplied by this job. Mediavine's 2026 publisher programs use prior-calendar-year ad revenue; monthly traffic is not a substitute.

Sources: [Mediavine and Journey requirements](${adPolicySources.mediavine}), [Mediavine 2026 programs](${adPolicySources.mediavinePrograms}), [Raptive Analytics requirements](${adPolicySources.raptiveAnalytics}), [Raptive full requirements](${adPolicySources.raptiveRequirements}).
`;
}
