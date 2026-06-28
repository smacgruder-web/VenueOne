import { motion } from 'framer-motion';
import PeculiarLogo from './PeculiarLogo';
import type { ViewId } from '../types/venue';

interface NavItem {
  id: ViewId;
  label: string;
  badge?: number;
}

interface NavBarProps {
  view: ViewId;
  items: NavItem[];
  onChange: (id: ViewId) => void;
}

export default function NavBar({ view, items, onChange }: NavBarProps) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center gap-0 border-b border-[#1E2A3A] px-4"
      style={{
        background: 'rgba(10, 15, 30, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div className="mr-2 flex items-center gap-2.5 border-r border-[#1E2A3A] pr-4">
        <PeculiarLogo size={40} />
        <div className="flex items-baseline">
          <span className="text-sm font-extrabold tracking-[0.05em] text-[#F8F9FC]">VENUE</span>
          <span className="text-sm font-extrabold tracking-[0.05em] text-[#F5A623]">ONE</span>
        </div>
      </div>

      <div className="relative flex">
        {items.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className="relative px-5 py-4 text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{ color: active ? '#F5A623' : '#8B95A8' }}
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#F5A623]"
                  style={{ boxShadow: '0 0 12px rgba(245,166,35,0.6)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {item.label}
                {item.badge != null && item.badge > 0 && (
                  <motion.span
                    className="rounded-full bg-[#F5A623] px-1.5 py-0.5 text-[10px] font-black text-[#0A0F1E]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {item.badge}
                    </motion.span>
                  </motion.span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}