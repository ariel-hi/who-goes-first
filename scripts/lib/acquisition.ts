import type { AnalyticsAcquisition, AnalyticsTotals } from './google-api';

type Group = { name: string; sessions: number; engagedSessions: number };
export type AcquisitionSummary = {
  status: 'available'; periodStart: string; periodEnd: string; source: string;
  totalSessions: number; rowSessions: number; rowTotalDifference: number;
  subjectToThresholding: boolean; dataLossFromOtherRow: boolean; dataTruncation: boolean;
  rowCount: number; channels: Group[]; topSources: Array<Group & { channel: string }>;
};
export type UnavailableAcquisition = {
  status: 'unavailable'; periodStart: string; periodEnd: string; reason: string;
};

export function summarizeAcquisition(start: string, end: string, totals: AnalyticsTotals, report: AnalyticsAcquisition): AcquisitionSummary {
  // GA4 dimension rows can differ from a deduplicated total. Keep the
  // undimensioned total separate and never force row counts to reconcile.
  const rowSessions = report.rows.reduce((sum, row) => sum + row.sessions, 0);
  const byChannel = new Map<string, Group>();
  for (const row of report.rows) {
    const group = byChannel.get(row.channel) ?? { name: row.channel, sessions: 0, engagedSessions: 0 };
    group.sessions += row.sessions;
    group.engagedSessions += row.engagedSessions;
    byChannel.set(row.channel, group);
  }
  const rank = (a: Group, b: Group) => b.sessions - a.sessions || a.name.localeCompare(b.name, 'en');
  return {
    status: 'available', periodStart: start, periodEnd: end,
    source: 'Google Analytics 4 Data API (sessionDefaultChannelGroup; sessionSourceMedium; sessions; engagedSessions)',
    totalSessions: totals.sessions, rowSessions, rowTotalDifference: rowSessions - totals.sessions,
    subjectToThresholding: report.subjectToThresholding, dataLossFromOtherRow: report.dataLossFromOtherRow,
    dataTruncation: report.dataTruncation, rowCount: report.rowCount,
    channels: [...byChannel.values()].sort(rank),
    topSources: report.rows.map(row => ({ name: row.sourceMedium, channel: row.channel, sessions: row.sessions, engagedSessions: row.engagedSessions })).sort(rank).slice(0, 10),
  };
}

const markdown = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/[\r\n]+/g, ' ').replace(/[\\`*_{}[\]()#+.!|]/g, '\\$&');
const share = (part: number, total: number) => total ? `${(part / total * 100).toFixed(1)}%` : '—';

export function acquisitionReport(summary: AcquisitionSummary | UnavailableAcquisition): string {
  if (summary.status === 'unavailable') return `## Traffic acquisition (GA4)\n_${summary.reason}._\n`;
  const reconciles = summary.rowTotalDifference === 0;
  const channels = summary.channels.slice(0, 8).map(row =>
    `- ${markdown(row.name)}: ${row.sessions.toLocaleString('en')} reported row sessions${reconciles ? ` (${share(row.sessions, summary.totalSessions)} of GA4 sessions)` : ''}, ${row.engagedSessions.toLocaleString('en')} engaged row sessions.`).join('\n') || '- No channel rows returned.';
  const sources = summary.topSources.slice(0, 5).map(row =>
    `- ${markdown(row.name)} (${markdown(row.channel)}): ${row.sessions.toLocaleString('en')} reported row sessions.`).join('\n') || '- No source/medium rows returned.';
  const quality = summary.subjectToThresholding || summary.dataLossFromOtherRow || summary.dataTruncation
    ? ' Google flags thresholding, an other row, or truncation; visible rows may be incomplete.' : '';
  const reconciliation = summary.rowTotalDifference > 0
    ? `Dimension rows sum to ${summary.rowSessions.toLocaleString('en')}, which is ${summary.rowTotalDifference.toLocaleString('en')} above the undimensioned ${summary.totalSessions.toLocaleString('en')} sessions. Do not add row counts or interpret them as unique-session shares.`
    : summary.rowTotalDifference < 0
      ? `${(-summary.rowTotalDifference).toLocaleString('en')} sessions are outside the returned rows; channel shares are incomplete.`
      : `Dimension rows reconcile with the undimensioned ${summary.totalSessions.toLocaleString('en')} sessions.`;
  return `## Traffic acquisition (GA4)\n${channels}\n\nTop source / medium pairs:\n${sources}\n\n${reconciliation}${quality} Engaged sessions are GA4 sessions lasting over 10 seconds, recording a key event, or showing at least two pages/screens. These are reported sessions, not verified human visitors or revenue.\n`;
}
