import { motion } from 'framer-motion';
import type { MenuItem } from '../types/venue';
import { fmtMoney } from '../utils/format';
import FoodImage from './FoodImage';

interface MenuItemCardProps {
  item: MenuItem;
  qty: number;
  index: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}

export default function MenuItemCard({ item, qty, index, onAdd, onInc, onDec }: MenuItemCardProps) {
  const inCart = qty > 0;

  return (
    <motion.article
      className={`menu-food-card relative isolate aspect-[3/2] min-h-[200px] overflow-hidden rounded-2xl border-2 border-[#F5A623] ${inCart ? 'glow-accent ring-2 ring-[#F5A623] ring-offset-2 ring-offset-[#0A0F1E]' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => qty === 0 && onAdd()}
    >
      <FoodImage
        src={item.image}
        alt={item.name}
        emoji={item.emoji}
        priority
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, transparent 42%, rgba(6,12,24,0.35) 68%, rgba(6,12,24,0.82) 100%)',
        }}
      />

      {item.popular && (
        <span className="absolute top-3 left-3 z-10 rounded-md border border-[#F5A623] bg-[#0A0F1Ecc] px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#F5A623] backdrop-blur-sm">
          🔥 POPULAR
        </span>
      )}

      <div className="relative z-10 flex h-full flex-col justify-end p-3.5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-white drop-shadow-md">{item.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-[#C9D2E0]">{item.desc}</p>
            <p className="mt-1.5 text-lg font-black text-[#F5A623] drop-shadow">{fmtMoney(item.price)}</p>
          </div>

          {qty > 0 ? (
            <div
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#F5A62355] bg-[#0A0F1Ecc] px-2 py-1 backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2335] text-lg font-bold text-white"
                onClick={onDec}
                whileTap={{ scale: 0.9 }}
              >
                −
              </motion.button>
              <span className="min-w-[20px] text-center text-sm font-bold">{qty}</span>
              <motion.button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5A623] text-lg font-bold text-[#0A0F1E]"
                onClick={onInc}
                whileTap={{ scale: 0.9 }}
              >
                +
              </motion.button>
            </div>
          ) : (
            <motion.div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-xl font-bold text-[#0A0F1E] shadow-lg"
              style={{ boxShadow: '0 4px 16px rgba(245,166,35,0.45)' }}
              whileHover={{ scale: 1.1 }}
            >
              +
            </motion.div>
          )}
        </div>
      </div>
    </motion.article>
  );
}