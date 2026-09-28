import type { AnalyticsAffiliateOpens } from './google-api';

export const affiliateMeasurementStart = '2026-09-28';

export type AffiliateEventsSnapshot = {
  status: 'available'; periodStart: string; periodEnd: string; eventCount: number;
  source: string; subjectToThresholding: boolean; dataLossFromOtherRow: boolean; dataTruncation: boolean;
} | {
  status: 'pending' | 'unavailable'; periodStart: string; periodEnd: string; reason: string;
};

export function affiliateEventsSummary(start: string, end: string, report: AnalyticsAffiliateOpens): AffiliateEventsSnapshot {
  return {
    status: 'available', periodStart: start, periodEnd: end, eventCount: report.eventCount,
    source: 'Google Analytics 4 Data API (eventName=affiliate_outbound; eventCount)',
    subjectToThresholding: report.subjectToThresholding,
    dataLossFromOtherRow: report.dataLossFromOtherRow,
    dataTruncation: report.dataTruncation,
  };
}

export function affiliateEventsReport(snapshot: AffiliateEventsSnapshot): string {
  if (snapshot.status !== 'available') return `## Affiliate link opens (GA4)\n_${snapshot.reason}._\n`;
  const quality = snapshot.subjectToThresholding || snapshot.dataLossFromOtherRow || snapshot.dataTruncation
    ? ' Google flags thresholding, data loss, or truncation; the reported count may be incomplete.' : '';
  return `## Affiliate link opens (GA4)\n- Amazon link opens: **${snapshot.eventCount.toLocaleString('en')}** reported events (${snapshot.periodStart} through ${snapshot.periodEnd}).${quality}\n\nMeasurement began on 2026-09-28; that first day is partial. Analytics choices can suppress events. Opens are not verified purchases, commissions, or revenue.\n`;
}
