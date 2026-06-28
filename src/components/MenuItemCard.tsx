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
  const isDrink = item.cat === 'Drinks';
  const inCart = qty > 0;

  return (
    <motion.article
      className={`menu-food-card relative overflow-hidden rounded-2xl border border-[#1E2A3A] ${inCart ? 'glow-accent ring-2 ring-[#F5A623]' : ''}`}
      style={{ minHeight: 148 }}
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
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div
        className="absolute inset-0"
        style={{
          background: isDrink
            ? 'linear-gradient(135deg, rgba(6,12,24,0.2) 0%, rgba(14,165,160,0.25) 40%, rgba(6,12,24,0.88) 100%)'
            : 'linear-gradient(135deg, rgba(6,12,24,0.1) 0%, rgba(245,166,35,0.15) 30%, rgba(6,12,24,0.9) 100%)',
        }}
      />

      {!isDrink && <div className="food-steam absolute top-2 right-4 opacity-25" aria-hidden />}
      {isDrink && <div className="drink-frost absolute inset-0 opacity-20" aria-hidden />}

      {item.popular && (
        <span className="absolute top-3 left-3 z-10 rounded-md border border-[#F5A623] bg-[#0A0F1Ecc] px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#F5A623] backdrop-blur-sm">
          🔥 POPULAR
        </span>
      )}

      <div className="relative z-10 flex h-full min-h-[148px] flex-col justify-end p-4">
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