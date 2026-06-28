import { motion } from 'framer-motion';
import { useState } from 'react';
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
  const [infoOpen, setInfoOpen] = useState(false);
  const inCart = qty > 0;

  return (
    <motion.article
      className={`menu-food-card relative isolate aspect-[3/2] min-h-[152px] overflow-hidden rounded-2xl border-2 border-[#F5A623] sm:min-h-[200px] ${inCart ? 'menu-food-card--active glow-accent' : ''} ${infoOpen ? 'menu-food-card--expanded' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <FoodImage
        src={item.image}
        alt={item.name}
        emoji={item.emoji}
        priority
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="menu-card-scrim pointer-events-none absolute inset-0" />

      {item.popular && (
        <span className="absolute top-2 left-2 z-10 rounded-md border border-[#F5A623] bg-[#0A0F1Ecc] px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-[#F5A623] backdrop-blur-sm sm:top-3 sm:left-3 sm:px-2 sm:text-[9px] sm:tracking-widest">
          🔥 POPULAR
        </span>
      )}

      <div
        className={`menu-card-caption absolute inset-x-0 bottom-0 z-10 flex items-end gap-2 p-2.5 sm:gap-3 sm:p-3.5 ${infoOpen ? 'menu-card-caption--expanded' : ''}`}
      >
        <motion.button
          type="button"
          className={`menu-card-info-btn min-w-0 flex-1 text-left ${infoOpen ? 'menu-card-info-btn--expanded' : ''}`}
          onClick={() => setInfoOpen((open) => !open)}
          aria-expanded={infoOpen}
          aria-label={infoOpen ? `Collapse ${item.name}` : `Expand ${item.name} details`}
          whileTap={{ scale: 0.98 }}
        >
          <h3
            className={`menu-card-title text-[13px] font-extrabold leading-snug text-white sm:text-base ${infoOpen ? 'whitespace-normal' : 'truncate'}`}
          >
            {item.name}
          </h3>
          {infoOpen && <p className="menu-card-desc mt-1 text-[11px] leading-snug text-[#C9D2E0] sm:text-xs">{item.desc}</p>}
          <p className="menu-card-price mt-1 text-[15px] font-black leading-none text-[#F5A623] sm:mt-1.5 sm:text-lg">
            {fmtMoney(item.price)}
          </p>
        </motion.button>

        <div className="shrink-0">
          {qty > 0 ? (
            <div className="flex items-center gap-1 rounded-full border border-[#F5A62355] bg-[#0A0F1Eee] px-1 py-0.5 backdrop-blur-md sm:gap-2 sm:px-2 sm:py-1">
              <motion.button
                type="button"
                className="menu-qty-btn flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2335] text-base font-bold text-white sm:h-11 sm:w-11 sm:text-lg"
                onClick={onDec}
                whileTap={{ scale: 0.9 }}
                aria-label={`Remove one ${item.name}`}
              >
                −
              </motion.button>
              <span className="min-w-[18px] text-center text-xs font-bold text-white sm:min-w-[20px] sm:text-sm">{qty}</span>
              <motion.button
                type="button"
                className="menu-qty-btn flex h-9 w-9 items-center justify-center rounded-full bg-[#F5A623] text-base font-bold text-[#0A0F1E] sm:h-11 sm:w-11 sm:text-lg"
                onClick={onInc}
                whileTap={{ scale: 0.9 }}
                aria-label={`Add one ${item.name}`}
              >
                +
              </motion.button>
            </div>
          ) : (
            <motion.button
              type="button"
              className="menu-add-btn flex h-10 w-10 items-center justify-center rounded-full bg-[#F5A623] text-lg font-bold text-[#0A0F1E] shadow-lg sm:h-11 sm:w-11 sm:text-xl"
              style={{ boxShadow: '0 4px 16px rgba(245,166,35,0.45)' }}
              onClick={onAdd}
              whileTap={{ scale: 0.9 }}
              aria-label={`Add ${item.name} to cart`}
            >
              +
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}