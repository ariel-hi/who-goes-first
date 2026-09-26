import { describe, expect, it } from 'vitest';
import { adNetworkReadiness } from '../../scripts/lib/ad-network-readiness';

const row = (report: string, network: string) => report.split('\n').find(line => line.startsWith(`| ${network} |`))!;

describe('ad-network observations with totals only', () => {
  it('cannot promise eligibility from large session or view totals', () => {
    const report = adNetworkReadiness({ sessions: 1_000_000, screenPageViews: 2_000_000 });
    expect(report).not.toMatch(/\beligible\b|apply\*\*|50,000 sessions|10,000 sessions/i);
    expect(row(report, 'Journey by Mediavine')).toContain('Unknown — Tier 1 sessions not collected');
    expect(row(report, 'Mediavine')).toContain('$5,000 annual ad revenue');
    expect(row(report, 'Mediavine')).toContain('Unknown — annual ad revenue not collected');
    expect(row(report, 'Raptive')).toContain('website pageviews and eligibility unassessed');
  });

  it('uses totals only as an upper bound for Journey, without inventing qualified sessions', () => {
    expect(row(adNetworkReadiness({ sessions: 999, screenPageViews: 1_500 }), 'Journey by Mediavine')).toContain('Total sessions below the minimum; Tier 1 sessions unknown');
    expect(row(adNetworkReadiness({ sessions: 1_000, screenPageViews: 1_500 }), 'Journey by Mediavine')).toContain('Unknown — Tier 1 sessions not collected');
  });

  it.each([
    [24_999, 'Observed views below the minimum'],
    [25_000, 'Combined view total reaches the threshold; website pageviews and eligibility unassessed'],
    [99_999, 'Combined view total reaches the threshold; website pageviews and eligibility unassessed'],
    [100_000, 'Combined view total reaches the threshold; website pageviews and eligibility unassessed'],
  ])('keeps Raptive view and country requirements distinct at %i views', (screenPageViews, observation) => {
    const raptive = row(adNetworkReadiness({ sessions: 500_000, screenPageViews }), 'Raptive');
    expect(raptive).toContain(observation);
    expect(raptive).toContain('US/CA/UK/AU/NZ requirement: 50% at 25,000–99,999 website pageviews; 40% at 100,000+');
    expect(raptive).toContain('Applicable website-pageview tier unknown');
    expect(raptive).toContain('qualifying-country share unknown');
    expect(raptive).toContain('domain age ≥6 months');
    expect(raptive).toContain('majority long-form pages');
  });

  it('keeps unavailable totals unknown rather than reporting zero or progress', () => {
    const report = adNetworkReadiness();
    expect(row(report, 'Journey by Mediavine')).toContain('Unknown total sessions');
    expect(row(report, 'Raptive')).toContain('Unknown GA4 screenPageViews');
    expect(report).toContain('Unknown — GA4 totals unavailable');
    expect(report).not.toContain('0 total sessions');
  });

  it('records dated primary policies and flags the actual GA4 metric limitation', () => {
    const report = adNetworkReadiness({ sessions: 0, screenPageViews: 0 });
    expect(report).toContain('Official policies checked 2026-09-26');
    expect(report).toContain('screenPageViews combines screen and page views');
    expect(report).toContain('prior-calendar-year ad revenue');
    expect(report).toContain('https://www.mediavine.com/mediavine-requirements/');
    expect(report).toContain('https://help.raptive.com/hc/en-us/articles/360031181471-Raptive-FAQs');
  });
});
