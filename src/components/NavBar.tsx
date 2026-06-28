import { motion } from 'framer-motion';
import PeculiarLogo from './PeculiarLogo';
import type { ViewId } from '../types/venue';

interface NavItem {
  id: ViewId;
  label: string;
  icon: string;
  mobileLabel: string;
  badge?: number;
}

interface NavBarProps {
  view: ViewId;
  items: NavItem[];
  onChange: (id: ViewId) => void;
  onOpenBingo?: () => void;
}

function NavTab({
  item,
  active,
  onChange,
  layoutId,
  compact,
}: {
  item: NavItem;
  active: boolean;
  onChange: (id: ViewId) => void;
  layoutId?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(item.id)}
      className={`app-nav-tab relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 transition-colors md:min-h-0 md:min-w-0 md:flex-none md:flex-row md:gap-1.5 md:px-4 md:py-3.5 md:text-xs md:font-semibold md:uppercase md:tracking-widest ${compact ? 'px-1 py-2' : ''}`}
      style={{ color: active ? '#F5A623' : '#8B95A8' }}
      aria-current={active ? 'page' : undefined}
      aria-label={item.label}
    >
      {active && layoutId && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-x-1 bottom-0 hidden h-0.5 rounded-full bg-[#F5A623] md:block md:inset-x-2"
          style={{ boxShadow: '0 0 12px rgba(245,166,35,0.6)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {active && compact && (
        <span className="absolute top-1 h-1 w-6 rounded-full bg-[#F5A623] md:hidden" />
      )}
      {compact ? (
        <>
          <span className="relative text-lg leading-none">{item.icon}</span>
          <span className="relative text-[10px] font-bold leading-tight">{item.mobileLabel}</span>
        </>
      ) : (
        <span className="relative flex items-center gap-1.5">
          {item.label}
          {item.badge != null && item.badge > 0 && (
            <motion.span
              className="rounded-full bg-[#F5A623] px-1.5 py-0.5 text-[10px] font-black text-[#0A0F1E]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              {item.badge}
            </motion.span>
          )}
        </span>
      )}
      {compact && item.badge != null && item.badge > 0 && (
        <span className="absolute right-2 top-1 rounded-full bg-[#F5A623] px-1 py-0.5 text-[9px] font-black text-[#0A0F1E]">
          {item.badge}
        </span>
      )}
    </button>
  );
}

export default function NavBar({ view, items, onChange, onOpenBingo }: NavBarProps) {
  return (
    <>
      <header
        className="app-header sticky top-0 z-50 flex items-center justify-between border-b border-[#1E2A3A] px-3 py-2.5 md:px-4 md:py-0"
        style={{
          background: 'rgba(10, 15, 30, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          paddingTop: 'max(0.625rem, env(safe-area-inset-top))',
        }}
      >
        <div className="flex items-center gap-2 border-[#1E2A3A] md:gap-2.5 md:border-r md:pr-4">
          <PeculiarLogo size={36} />
          <div className="flex items-baseline">
            <span className="text-sm font-extrabold tracking-[0.05em] text-[#F8F9FC]">VENUE</span>
            <span className="text-sm font-extrabold tracking-[0.05em] text-[#F5A623]">ONE</span>
          </div>
        </div>

        {view === 'fan' && onOpenBingo && (
          <button type="button" className="soccer-bingo-header-cta md:mr-3" onClick={onOpenBingo}>
            <span className="soccer-bingo-header-cta-dot" aria-hidden />
            ⚽ Soccer Bingo
          </button>
        )}

        <nav className="relative hidden flex-1 md:flex" aria-label="Main">
          {items.map((item) => (
            <NavTab
              key={item.id}
              item={item}
              active={view === item.id}
              onChange={onChange}
              layoutId="nav-pill"
            />
          ))}
        </nav>
      </header>

      <nav
        className="app-bottom-nav fixed inset-x-0 bottom-0 z-50 flex border-t border-[#1E2A3A] md:hidden"
        style={{
          background: 'rgba(10, 15, 30, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label="Main"
      >
        {items.map((item) => (
          <NavTab
            key={item.id}
            item={item}
            active={view === item.id}
            onChange={onChange}
            compact
          />
        ))}
      </nav>
    </>
  );
}