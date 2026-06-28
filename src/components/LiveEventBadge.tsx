import { useEffect, useState } from 'react';

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function LiveEventBadge() {
  const [quarter, setQuarter] = useState(2);
  const [clockSeconds, setClockSeconds] = useState(14 * 60 + 32);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockSeconds((prev) => {
        if (prev > 0) return prev - 1;
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (clockSeconds !== 0 || quarter >= 4) return;
    const advance = window.setTimeout(() => {
      setQuarter((q) => q + 1);
      setClockSeconds(12 * 60);
    }, 1200);
    return () => window.clearTimeout(advance);
  }, [clockSeconds, quarter]);

  const label =
    quarter >= 4 && clockSeconds === 0
      ? 'LIVE · FINAL'
      : `LIVE · Q${quarter} ${formatClock(clockSeconds)}`;

  return (
    <div className="live-event-badge" aria-live="polite" aria-label={`Game clock ${label}`}>
      <span className="live-event-dot" aria-hidden />
      <span>{label}</span>
    </div>
  );
}