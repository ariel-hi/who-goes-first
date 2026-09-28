import type { AnalyticsTotals, AnalyticsCountryTraffic } from './google-api';

// Mediavine names these four examples, but does not publish an exhaustive Tier 1 list.
export const namedJourneyCountries = ['US', 'CA', 'GB', 'AU'] as const;
export const raptiveCountries = [...namedJourneyCountries, 'NZ'] as const;

export type CountryTrafficSummary = {
  status: 'available'; periodStart: string; periodEnd: string;
  source: 'Google Analytics 4 Data API (countryId; sessions and screenPageViews)';
  totalSessions: number; totalScreenPageViews: number;
  namedJourneySessions: number; raptiveCountrySessions: number; raptiveCountryScreenPageViews: number;
  unattributedSessions: number; unattributedScreenPageViews: number;
  reportRowCount: number; returnedRows: number;
  subjectToThresholding: boolean; dataLossFromOtherRow: boolean; dataTruncation: boolean;
  topCountries: Array<{ countryId: string; sessions: number; screenPageViews: number }>;
};

export type UnavailableCountryTraffic = {
  status: 'unavailable'; periodStart: string; periodEnd: string;
  reason: 'GA4 property not configured' | 'GA4 totals unavailable' | 'GA4 country report unavailable';
};

export function summarizeCountryTraffic(periodStart: string, periodEnd: string, totals: AnalyticsTotals, report: AnalyticsCountryTraffic): CountryTrafficSummary {
  const sum = (field: 'sessions' | 'screenPageViews') => report.rows.reduce((total, row) => total + row[field], 0);
  const byCountry = new Map(report.rows.map(row => [row.countryId, row]));
  const forCountries = (countries: readonly string[], field: 'sessions' | 'screenPageViews') =>
    countries.reduce((total, country) => total + (byCountry.get(country)?.[field] ?? 0), 0);
  const reportedSessions = sum('sessions');
  const reportedViews = sum('screenPageViews');
  if (reportedSessions > totals.sessions || reportedViews > totals.screenPageViews) {
    throw new Error('GA4 country rows exceed undimensioned totals; do not report a misleading country share');
  }
  return {
    status: 'available', periodStart, periodEnd,
    source: 'Google Analytics 4 Data API (countryId; sessions and screenPageViews)',
    totalSessions: totals.sessions, totalScreenPageViews: totals.screenPageViews,
    namedJourneySessions: forCountries(namedJourneyCountries, 'sessions'),
    raptiveCountrySessions: forCountries(raptiveCountries, 'sessions'),
    raptiveCountryScreenPageViews: forCountries(raptiveCountries, 'screenPageViews'),
    unattributedSessions: totals.sessions - reportedSessions,
    unattributedScreenPageViews: totals.screenPageViews - reportedViews,
    reportRowCount: report.rowCount, returnedRows: report.rows.length,
    subjectToThresholding: report.subjectToThresholding,
    dataLossFromOtherRow: report.dataLossFromOtherRow,
    dataTruncation: report.dataTruncation,
    topCountries: report.rows.toSorted((a, b) => b.sessions - a.sessions || a.countryId.localeCompare(b.countryId)).slice(0, 10),
  };
}
