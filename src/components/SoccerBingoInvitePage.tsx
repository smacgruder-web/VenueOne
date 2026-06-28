import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

interface SoccerBingoInvitePageProps {
  open: boolean;
  onClose: () => void;
  onPlay: () => void;
}

const PRIZES = [
  { icon: '🛵', title: 'Free Seat Delivery', detail: 'Waives the delivery fee on your next in-game order.' },
  { icon: '💵', title: '$5 Off Coupon', detail: 'Five dollars off food or drinks during the match.' },
];

const STEPS = [
  'Watch the match and mark squares as plays happen',
  'Get five in a row — goal, card, corner, save, and more',
  'Win a prize applied automatically at checkout',
];

export default function SoccerBingoInvitePage({ open, onClose, onPlay }: SoccerBingoInvitePageProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu-detail-page soccer-bingo-invite-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="menu-detail-scroll">
            <div className="menu-detail-hero soccer-bingo-invite-hero">
              <div
                className="soccer-bingo-invite-hero-img"
                style={{ backgroundImage: "url('/images/soccer-ball.png')" }}
              />
              <div className="menu-detail-hero-scrim" />
              <button type="button" className="menu-detail-close" onClick={onClose} aria-label="Close">
                ✕
              </button>
              <span className="menu-detail-popular soccer-bingo-invite-badge">⚽ MATCH NIGHT</span>
              <div className="menu-detail-hero-copy">
                <h1 className="menu-detail-title">Soccer Bingo</h1>
                <p className="soccer-bingo-invite-tagline">Play during the match · Win stadium perks</p>
              </div>
            </div>

            <div className="menu-detail-body">
              <section className="menu-detail-section">
                <h2 className="menu-detail-section-title">How It Works</h2>
                <ul className="soccer-bingo-invite-steps">
                  {STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </section>

              <section className="menu-detail-section">
                <h2 className="menu-detail-section-title">Prizes You Can Win</h2>
                <div className="soccer-bingo-invite-prizes">
                  {PRIZES.map((prize) => (
                    <div key={prize.title} className="soccer-bingo-invite-prize-card">
                      <span className="soccer-bingo-invite-prize-icon">{prize.icon}</span>
                      <div>
                        <p className="soccer-bingo-invite-prize-title">{prize.title}</p>
                        <p className="soccer-bingo-invite-prize-detail">{prize.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="menu-detail-footer soccer-bingo-invite-footer">
            <div className="menu-detail-footer-price">
              <span className="menu-detail-footer-label">Ready to play?</span>
              <span className="menu-detail-footer-amount soccer-bingo-invite-cta-label">Free to join</span>
            </div>
            <motion.button
              type="button"
              className="soccer-bingo-invite-play"
              onClick={onPlay}
              whileTap={{ scale: 0.97 }}
            >
              Play Now →
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}