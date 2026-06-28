export function genId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function fmtMoney(n: number): string {
  return '$' + n.toFixed(2);
}

export function fmtSecs(s: number | null): string {
  if (s == null || Number.isNaN(s)) return '—';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}