import { motion } from 'framer-motion';
import { useState } from 'react';
import { getMenuModGroups } from '../data/menuCustomizations';
import type { MenuItem, ModSelection } from '../types/venue';
import { applyModSelection } from '../utils/cartMods';
import { fmtMoney } from '../utils/format';
import FoodImage from './FoodImage';

interface MenuItemCardProps {
  item: MenuItem;
  qty: number;
  index: number;
  mods: ModSelection[];
  onModsChange: (mods: ModSelection[]) => void;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}

function CaptionControls({
  item,
  qty,
  infoOpen,
  onToggleInfo,
  onAdd,
  onInc,
  onDec,
}: {
  item: MenuItem;
  qty: number;
  infoOpen: boolean;
  onToggleInfo: () => void;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div
      className={`menu-card-caption absolute inset-x-0 bottom-0 z-10 flex items-end gap-2 p-2.5 sm:gap-3 sm:p-3.5 ${infoOpen ? 'menu-card-caption--expanded' : ''}`}
    >
      <motion.button
        type="button"
        className={`menu-card-info-btn min-w-0 flex-1 text-left ${infoOpen ? 'menu-card-info-btn--expanded' : ''}`}
        onClick={onToggleInfo}
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
  );
}

export default function MenuItemCard({
  item,
  qty,
  index,
  mods,
  onModsChange,
  onAdd,
  onInc,
  onDec,
}: MenuItemCardProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const inCart = qty > 0;
  const modGroups = getMenuModGroups(item.id);

  const selectMod = (groupId: string, optionId: string) => {
    onModsChange(applyModSelection(modGroups, mods, groupId, optionId));
  };

  return (
    <motion.article
      className={`menu-food-card menu-card-flip ${inCart ? 'menu-food-card--active glow-accent' : ''} ${flipped ? 'menu-food-card--flipped' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <FoodImage
        src={item.image}
        alt={item.name}
        emoji={item.emoji}
        priority
        className={`menu-card-photo ${flipped ? 'menu-card-photo--hidden' : ''}`}
      />

      <button
        type="button"
        className="menu-photo-flip-btn"
        onClick={() => setFlipped(true)}
        aria-label={`Customize ${item.name}`}
      />

      <div className={`menu-card-flip-inner ${flipped ? 'is-flipped' : ''}`}>
        <div className="menu-card-face menu-card-front">
          <div className="menu-card-scrim" />

          <span className="menu-flip-hint">
            Tap photo
          </span>

          {item.popular && (
            <span className="menu-card-popular">
              🔥 POPULAR
            </span>
          )}

          <CaptionControls
            item={item}
            qty={qty}
            infoOpen={infoOpen}
            onToggleInfo={() => setInfoOpen((open) => !open)}
            onAdd={onAdd}
            onInc={onInc}
            onDec={onDec}
          />
        </div>

        <div className="menu-card-face menu-card-back">
          <button
            type="button"
            className="menu-card-back-header flex w-full items-center justify-between border-b border-[#F5A62333] bg-[#060C18] px-2.5 py-2 text-left sm:px-3"
            onClick={() => setFlipped(false)}
            aria-label={`Back to ${item.name} photo`}
          >
            <span className="truncate text-[11px] font-extrabold text-white sm:text-sm">Special Order · {item.name}</span>
            <span className="shrink-0 text-[10px] font-bold text-[#F5A623]">↩ Photo</span>
          </button>

          <div className="menu-mods-panel absolute inset-x-0 bottom-[3.5rem] top-[2.35rem] overflow-y-auto px-2.5 py-2 sm:bottom-[3.75rem] sm:px-3">
            {modGroups.map((group) => (
              <div key={group.id} className="mb-2.5 last:mb-0">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#8B95A8]">{group.label}</p>
                <div className="flex flex-wrap gap-1">
                  {group.options.map((option) => {
                    const active = mods.some((mod) => mod.groupId === group.id && mod.optionId === option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`menu-mod-chip ${active ? 'menu-mod-chip--active' : ''}`}
                        onClick={() => selectMod(group.id, option.id)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <CaptionControls
            item={item}
            qty={qty}
            infoOpen={false}
            onToggleInfo={() => setFlipped(false)}
            onAdd={onAdd}
            onInc={onInc}
            onDec={onDec}
          />
        </div>
      </div>
    </motion.article>
  );
}