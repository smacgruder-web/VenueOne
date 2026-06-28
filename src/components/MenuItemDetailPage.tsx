import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { getMenuModGroups } from '../data/menuCustomizations';
import type { MenuItem, ModSelection } from '../types/venue';
import { applyModSelection } from '../utils/cartMods';
import { fmtMoney } from '../utils/format';
import FoodImage from './FoodImage';

interface MenuItemDetailPageProps {
  item: MenuItem;
  relatedItems: MenuItem[];
  mods: ModSelection[];
  qty: number;
  open: boolean;
  onClose: () => void;
  onModsChange: (mods: ModSelection[]) => void;
  onSelectItem: (item: MenuItem) => void;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}

export default function MenuItemDetailPage({
  item,
  relatedItems,
  mods,
  qty,
  open,
  onClose,
  onModsChange,
  onSelectItem,
  onAdd,
  onInc,
  onDec,
}: MenuItemDetailPageProps) {
  const modGroups = getMenuModGroups(item.id);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const selectMod = (groupId: string, optionId: string) => {
    onModsChange(applyModSelection(modGroups, mods, groupId, optionId));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu-detail-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="menu-detail-scroll">
            <div className="menu-detail-hero">
              <FoodImage
                src={item.image}
                alt={item.name}
                emoji={item.emoji}
                priority
                className="menu-detail-hero-img"
              />
              <div className="menu-detail-hero-scrim" />
              <button type="button" className="menu-detail-close" onClick={onClose} aria-label="Close">
                ✕
              </button>
              {item.popular && <span className="menu-detail-popular">🔥 POPULAR</span>}
              <div className="menu-detail-hero-copy">
                <h1 className="menu-detail-title">{item.name}</h1>
                <p className="menu-detail-price">{fmtMoney(item.price)}</p>
              </div>
            </div>

            <div className="menu-detail-body">
              <section className="menu-detail-section">
                <h2 className="menu-detail-section-title">About</h2>
                <p className="menu-detail-desc">{item.desc}</p>
              </section>

              {modGroups.length > 0 && (
                <section className="menu-detail-section">
                  <h2 className="menu-detail-section-title">Customize Your Order</h2>
                  <div className="menu-detail-mods">
                    {modGroups.map((group) => (
                      <div key={group.id} className="menu-detail-mod-group">
                        <p className="menu-detail-mod-label">{group.label}</p>
                        <div className="menu-detail-mod-options">
                          {group.options.map((option) => {
                            const active = mods.some(
                              (mod) => mod.groupId === group.id && mod.optionId === option.id,
                            );
                            return (
                              <button
                                key={option.id}
                                type="button"
                                className={`menu-detail-mod-chip ${active ? 'menu-detail-mod-chip--active' : ''}`}
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
                </section>
              )}

              {relatedItems.length > 0 && (
                <section className="menu-detail-section">
                  <h2 className="menu-detail-section-title">More {item.cat} Offerings</h2>
                  <div className="menu-detail-related">
                    {relatedItems.map((related) => (
                      <button
                        key={related.id}
                        type="button"
                        className="menu-detail-related-card"
                        onClick={() => onSelectItem(related)}
                      >
                        <FoodImage
                          src={related.image}
                          alt={related.name}
                          emoji={related.emoji}
                          className="menu-detail-related-img"
                        />
                        <span className="menu-detail-related-name">{related.name}</span>
                        <span className="menu-detail-related-price">{fmtMoney(related.price)}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="menu-detail-footer">
            <div className="menu-detail-footer-price">
              <span className="menu-detail-footer-label">Your order</span>
              <span className="menu-detail-footer-amount">{fmtMoney(item.price)}</span>
            </div>
            {qty > 0 ? (
              <div className="menu-detail-qty">
                <motion.button
                  type="button"
                  className="menu-detail-qty-btn"
                  onClick={onDec}
                  whileTap={{ scale: 0.92 }}
                  aria-label={`Remove one ${item.name}`}
                >
                  −
                </motion.button>
                <span className="menu-detail-qty-count">{qty}</span>
                <motion.button
                  type="button"
                  className="menu-detail-qty-btn menu-detail-qty-btn--add"
                  onClick={onInc}
                  whileTap={{ scale: 0.92 }}
                  aria-label={`Add one ${item.name}`}
                >
                  +
                </motion.button>
              </div>
            ) : (
              <motion.button
                type="button"
                className="menu-detail-add-btn"
                onClick={onAdd}
                whileTap={{ scale: 0.97 }}
              >
                Add to Order +
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}