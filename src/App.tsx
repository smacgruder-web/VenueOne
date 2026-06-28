import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AmbientBackground from './components/AmbientBackground';
import NavBar from './components/NavBar';
import { useFanIdentity } from './hooks/useFanIdentity';
import { useRunnerIdentity } from './hooks/useRunnerIdentity';
import { useVenueState } from './hooks/useVenueState';
import type { ViewId } from './types/venue';
import AnalyticsView from './views/AnalyticsView';
import FanView from './views/FanView';
import RunnerView from './views/RunnerView';
import StaffView from './views/StaffView';

const viewVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

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

  const navItems = [
    { id: 'fan' as ViewId, label: '📱 Fan Order', icon: '📱', mobileLabel: 'Fan' },
    { id: 'staff' as ViewId, label: '🎛 Staff', icon: '🎛', mobileLabel: 'Staff', badge: newOrders },
    { id: 'runners' as ViewId, label: '🛵 Runners', icon: '🛵', mobileLabel: 'Run', badge: unclaimedCount },
    { id: 'analytics' as ViewId, label: '📊 GM Analytics', icon: '📊', mobileLabel: 'Stats' },
  ];

  return (
    <div className="app-shell relative min-h-[100dvh] font-sans text-white">
      <AmbientBackground />
      <NavBar view={view} items={navItems} onChange={setView} />

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
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
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}