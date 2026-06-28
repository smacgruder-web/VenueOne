import { useEffect, useState } from 'react';
import PeculiarLogo from './components/PeculiarLogo';
import { useFanIdentity } from './hooks/useFanIdentity';
import { useRunnerIdentity } from './hooks/useRunnerIdentity';
import { useVenueState } from './hooks/useVenueState';
import { S } from './styles/venueStyles';
import type { ViewId } from './types/venue';
import AnalyticsView from './views/AnalyticsView';
import FanView from './views/FanView';
import RunnerView from './views/RunnerView';
import StaffView from './views/StaffView';

export default function App() {
  const [view, setView] = useState<ViewId>('fan');
  const venueState = useVenueState();
  const fanIdentity = useFanIdentity();
  const runnerIdentity = useRunnerIdentity();

  const { orders, eventStats, addOrder, updateStatus, claimOrder, resetData, newOrders, unclaimedCount } =
    venueState;

  useEffect(() => {
    document.title = 'Venue One — Riverside Arena';
  }, []);

  const navItems: { id: ViewId; label: string }[] = [
    { id: 'fan', label: '📱 Fan Order' },
    { id: 'staff', label: `🎛 Staff${newOrders > 0 ? ` (${newOrders})` : ''}` },
    { id: 'runners', label: `🛵 Runners${unclaimedCount > 0 ? ` (${unclaimedCount})` : ''}` },
    { id: 'analytics', label: '📊 GM Analytics' },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#060C18', minHeight: '100vh' }}>
      <nav style={S.nav}>
        <div style={S.brandBlock}>
          <PeculiarLogo size={28} />
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={S.brandMark}>VENUE</span>
            <span style={S.brandAccent}>ONE</span>
          </div>
        </div>
        {navItems.map((v) => (
          <button key={v.id} style={S.navBtn(view === v.id)} onClick={() => setView(v.id)}>
            {v.label}
          </button>
        ))}
      </nav>

      {view === 'fan' && <FanView onOrder={addOrder} orders={orders} fanIdentity={fanIdentity} />}
      {view === 'staff' && <StaffView orders={orders} updateStatus={updateStatus} />}
      {view === 'runners' && (
        <RunnerView
          orders={orders}
          claimOrder={claimOrder}
          updateStatus={updateStatus}
          runnerIdentity={runnerIdentity}
        />
      )}
      {view === 'analytics' && (
        <AnalyticsView orders={orders} stats={eventStats} onReset={resetData} />
      )}
    </div>
  );
}