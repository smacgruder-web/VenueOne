import { VENUE_TIMEZONE } from '../data/constants';

const venueTimeOptions: Intl.DateTimeFormatOptions = {
  timeZone: VENUE_TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

const venueDateTimeOptions: Intl.DateTimeFormatOptions = {
  timeZone: VENUE_TIMEZONE,
  dateStyle: 'long',
  timeStyle: 'short',
};

export function genId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function fmtVenueTzAbbr(ts: number = Date.now()): string {
  const part = new Intl.DateTimeFormat('en-US', {
    timeZone: VENUE_TIMEZONE,
    timeZoneName: 'short',
  })
    .formatToParts(new Date(ts))
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? 'ET';
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', venueTimeOptions);
}

export function fmtLiveVenueTime(ts: number = Date.now()): string {
  return `${fmtTime(ts)} ${fmtVenueTzAbbr(ts)}`;
}

export function fmtDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-US', venueDateTimeOptions);
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