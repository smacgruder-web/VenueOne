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
      className={`menu-food-card overflow-hidden rounded-2xl bg-[#0D1320] ${inCart ? 'glow-accent ring-2 ring-[#F5A623]' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => qty === 0 && onAdd()}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#060C18]">
        <FoodImage
          src={item.image}
          alt={item.name}
          emoji={item.emoji}
          className="h-full w-full object-cover"
        />

        {item.popular && (
          <span className="absolute top-2.5 left-2.5 z-10 rounded-md border border-[#F5A623] bg-[#0A0F1Edd] px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#F5A623] backdrop-blur-sm">
            🔥 POPULAR
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold text-white">{item.name}</h3>
          <p className="mt-0.5 truncate text-[11px] text-[#8B95A8]">{item.desc}</p>
          <p className="mt-1 text-sm font-bold text-white">{fmtMoney(item.price)}</p>
        </div>

        {qty > 0 ? (
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#F5A62355] bg-[#1A2335] px-1.5 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A0F1E] text-base font-bold text-white"
              onClick={onDec}
              whileTap={{ scale: 0.9 }}
            >
              −
            </motion.button>
            <span className="min-w-[18px] text-center text-xs font-bold">{qty}</span>
            <motion.button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5A623] text-base font-bold text-[#0A0F1E]"
              onClick={onInc}
              whileTap={{ scale: 0.9 }}
            >
              +
            </motion.button>
          </div>
        ) : (
          <motion.div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-lg font-bold text-[#0A0F1E]"
            style={{ boxShadow: '0 4px 14px rgba(245,166,35,0.4)' }}
            whileHover={{ scale: 1.08 }}
          >
            +
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}