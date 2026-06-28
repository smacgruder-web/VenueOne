import type { Order } from '../types/venue';
import { fmtDateTime, fmtMoney, fmtTime } from './format';

export function getDuration(
  history: Order['statusHistory'] | undefined,
  fromStatus: string,
  toStatus: string,
): number | null {
  if (!history) return null;
  const from = history.find((h) => h.status === fromStatus);
  const to = history.find((h) => h.status === toStatus);
  if (!from || !to) return null;
  return (to.ts - from.ts) / 1000;
}

export function bucketize(
  orders: Order[],
  bucketCount: number,
  bucketSizeMs: number,
  valueFn: (order: Order) => number,
): number[] {
  const now = Date.now();
  const buckets = Array.from({ length: bucketCount }, () => 0);
  orders.forEach((o) => {
    const age = now - o.ts;
    const idx = bucketCount - 1 - Math.floor(age / bucketSizeMs);
    if (idx >= 0 && idx < bucketCount) buckets[idx] += valueFn(o);
  });
  return buckets;
}

export function bucketLabel(idx: number, bucketCount: number, bucketSizeMs: number): string {
  const bucketsAgo = bucketCount - 1 - idx;
  const t = Date.now() - bucketsAgo * bucketSizeMs;
  return fmtTime(t);
}

export function exportOrdersCSV(orders: Order[]): void {
  const header = 'Order ID,Section,Fulfillment,Window/Seat,Runner,Total,Tip,Status,Time\n';
  const rows = orders
    .map((o) =>
      [
        o.id,
        o.section,
        o.fulfillment,
        o.fulfillment === 'delivery' ? o.seat || '' : `Window ${o.window || ''}`,
        o.runner || '',
        o.total.toFixed(2),
        (o.tip || 0).toFixed(2),
        o.status,
        fmtDateTime(o.ts),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `venue-one-orders-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface RecapKPI {
  label: string;
  value: string | number;
  delta: string;
  pos: boolean;
}

interface RecapData {
  recapText: string;
  kpis: RecapKPI[];
  topItems: [string, number][];
  topSections: [string, number][];
  runnerRows: Array<{
    name: string;
    total: number;
    completed: number;
    avgTime: number | null;
    tips: number;
  }>;
}

function esc(v: string | number): string {
  return String(v).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
}

export function buildRecapHTML(data: RecapData): string {
  const { recapText, kpis, topItems, topSections, runnerRows } = data;
  const generatedAt = fmtDateTime(Date.now());

  const kpiCards = kpis
    .map(
      (k) => `
    <div class="kpi-card">
      <div class="kpi-label">${esc(k.label)}</div>
      <div class="kpi-value">${esc(k.value)}</div>
      <div class="kpi-delta" style="color:${k.pos ? '#2a9d4a' : '#c0392b'}">${esc(k.delta)}</div>
    </div>`,
    )
    .join('');

  const itemRows = topItems.length
    ? topItems.map(([name, count]) => `<tr><td>${esc(name)}</td><td style="text-align:right">${count}</td></tr>`).join('')
    : '<tr><td colspan="2" style="color:#999">No items yet</td></tr>';

  const sectionRows = topSections.length
    ? topSections
        .map(([sec, rev]) => `<tr><td>Section ${esc(sec)}</td><td style="text-align:right">${esc(fmtMoney(rev))}</td></tr>`)
        .join('')
    : '<tr><td colspan="2" style="color:#999">No data yet</td></tr>';

  const runnersWithActivity = runnerRows.filter((r) => r.total > 0);
  const runnerRowsHtml = runnersWithActivity.length
    ? runnersWithActivity
        .map(
          (r) => `
        <tr>
          <td>${esc(r.name)}</td>
          <td style="text-align:right">${r.completed}/${r.total}</td>
          <td style="text-align:right">${r.avgTime != null ? esc(fmtSecs(r.avgTime)) : '—'}</td>
          <td style="text-align:right">${esc(fmtMoney(r.tips))}</td>
        </tr>`,
        )
        .join('')
    : '<tr><td colspan="4" style="color:#999">No deliveries yet</td></tr>';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Venue One — Tonight's Recap</title>
<style>
  @page { margin: 0.6in; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; margin: 0; padding: 28px 36px; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  .sub { font-size: 12px; color: #666; margin-bottom: 4px; }
  .accent { height: 3px; background: #F5A623; margin: 14px 0 22px; border-radius: 2px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.07em; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 26px 0 10px; }
  .recap { font-size: 13px; line-height: 1.7; background: #f7f7f7; border: 1px solid #e3e3e3; border-radius: 8px; padding: 14px 16px; page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; page-break-inside: avoid; }
  td { padding: 6px 4px; border-bottom: 1px solid #eee; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; page-break-inside: avoid; }
  .kpi-card { border: 1px solid #e3e3e3; border-radius: 8px; padding: 10px 12px; }
  .kpi-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
  .kpi-value { font-size: 17px; font-weight: 800; margin-top: 2px; }
  .kpi-delta { font-size: 10px; margin-top: 2px; }
  footer { margin-top: 28px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>Venue One <span style="color:#F5A623">·</span> Tonight's Event Recap</h1>
  <div class="sub">Riverside Arena · Generated ${esc(generatedAt)}</div>
  <div class="accent"></div>
  <h2>Executive Summary</h2>
  <div class="recap">${esc(recapText)}</div>
  <h2>Key Metrics</h2>
  <div class="kpi-grid">${kpiCards}</div>
  <h2>Top Items Tonight</h2>
  <table><tbody>${itemRows}</tbody></table>
  <h2>Revenue by Section</h2>
  <table><tbody>${sectionRows}</tbody></table>
  <h2>Runner Performance</h2>
  <table>
    <thead><tr><td><strong>Runner</strong></td><td style="text-align:right"><strong>Delivered</strong></td><td style="text-align:right"><strong>Avg Time</strong></td><td style="text-align:right"><strong>Tips</strong></td></tr></thead>
    <tbody>${runnerRowsHtml}</tbody>
  </table>
  <footer>Generated automatically by Venue One · Riverside Arena</footer>
</body>
</html>`;
}

function fmtSecs(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function downloadRecapPDF(data: RecapData): void {
  const html = buildRecapHTML(data);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups for this page to generate the PDF report.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
}