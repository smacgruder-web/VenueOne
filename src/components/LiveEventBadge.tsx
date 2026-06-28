import { useEffect, useState } from 'react';
import { fmtLiveVenueTime } from '../utils/format';

export default function LiveEventBadge() {
  const [label, setLabel] = useState(() => `LIVE · ${fmtLiveVenueTime()}`);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLabel(`LIVE · ${fmtLiveVenueTime()}`);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="live-event-badge" aria-live="polite" aria-label={`Event status ${label}`}>
      <span className="live-event-dot" aria-hidden />
      <span>{label}</span>
    </div>
  );
}