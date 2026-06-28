import { motion } from 'framer-motion';
import type { MenuItem } from '../types/venue';
import { fmtMoney } from '../utils/format';
import FoodImage from './FoodImage';

interface MenuItemCardProps {
  item: MenuItem;
  qty: number;
  index: number;
  onOpenDetail: () => void;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}

export default function MenuItemCard({
  item,
  qty,
  index,
  onOpenDetail,
  onAdd,
  onInc,
  onDec,
}: MenuItemCardProps) {
  const inCart = qty > 0;

  return (
    <motion.article
      className={`menu-food-card menu-card-flip ${inCart ? 'menu-food-card--active glow-accent' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <FoodImage
        src={item.image}
        alt={item.name}
        emoji={item.emoji}
        priority
        className="menu-card-photo"
      />

      <button
        type="button"
        className="menu-photo-flip-btn"
        onClick={onOpenDetail}
        aria-label={`View and customize ${item.name}`}
      />

      <div className="menu-card-face menu-card-front">
        <div className="menu-card-scrim" />

        <span className="menu-flip-hint">Tap photo</span>

        {item.popular && <span className="menu-card-popular">🔥 POPULAR</span>}

        <div className="menu-card-caption absolute inset-x-0 bottom-0 z-10 flex items-end gap-2 p-2.5 sm:gap-3 sm:p-3.5">
          <motion.button
            type="button"
            className="menu-card-info-btn min-w-0 flex-1 text-left"
            onClick={onOpenDetail}
            aria-label={`View ${item.name} details and customizations`}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="menu-card-title truncate text-[13px] font-extrabold leading-snug text-white sm:text-base">
              {item.name}
            </h3>
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
      </div>
    </motion.article>
  );
}