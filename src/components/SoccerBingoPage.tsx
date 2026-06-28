import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { SoccerBingoState } from '../data/soccerBingo';

interface SoccerBingoPageProps {
  open: boolean;
  state: SoccerBingoState;
  onClose: () => void;
  onToggleCell: (index: number) => void;
  onSimPlay: () => void;
  onNewGame: () => void;
}

export default function SoccerBingoPage({
  open,
  state,
  onClose,
  onToggleCell,
  onSimPlay,
  onNewGame,
}: SoccerBingoPageProps) {
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
          className="soccer-bingo-page"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
        >
          <header className="soccer-bingo-header">
            <button type="button" className="soccer-bingo-close" onClick={onClose} aria-label="Close Soccer Bingo">
              ✕
            </button>
            <div>
              <p className="soccer-bingo-kicker">VenueOne Match Night</p>
              <h1 className="soccer-bingo-title">⚽ Soccer Bingo</h1>
            </div>
            <button type="button" className="soccer-bingo-new" onClick={onNewGame}>
              New Card
            </button>
          </header>

          <div className="soccer-bingo-body">
            <div className="soccer-bingo-prizes">
              <p className="soccer-bingo-prizes-title">Win Prizes During The Match</p>
              <div className="soccer-bingo-prize-list">
                <span className="soccer-bingo-prize-pill">🛵 Free Seat Delivery</span>
                <span className="soccer-bingo-prize-pill">💵 $5 Off Coupon</span>
              </div>
            </div>

            {state.lastEvent && (
              <div className="soccer-bingo-event" aria-live="polite">
                <span className="soccer-bingo-event-label">Live Match Event</span>
                <strong>{state.lastEvent}</strong>
              </div>
            )}

            <div className="soccer-bingo-grid" role="grid" aria-label="Soccer bingo card">
              {state.cells.map((label, index) => {
                const isFree = index === 12;
                const marked = state.marked[index] || isFree;
                return (
                  <button
                    key={`${state.seed}-${index}`}
                    type="button"
                    role="gridcell"
                    className={`soccer-bingo-cell ${marked ? 'soccer-bingo-cell--marked' : ''} ${isFree ? 'soccer-bingo-cell--free' : ''}`}
                    onClick={() => onToggleCell(index)}
                    disabled={state.won && !marked}
                    aria-pressed={marked}
                  >
                    <span className="soccer-bingo-cell-text">{label}</span>
                    {marked && <span className="soccer-bingo-stamp">✓</span>}
                  </button>
                );
              })}
            </div>

            {state.won && state.prize && (
              <motion.div
                className="soccer-bingo-win"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <p className="soccer-bingo-win-title">🎉 BINGO! You Won!</p>
                <p className="soccer-bingo-win-prize">{state.prize.label}</p>
                <p className="soccer-bingo-win-detail">{state.prize.detail}</p>
                <p className="soccer-bingo-win-note">Prize auto-applies on your next order during the game.</p>
              </motion.div>
            )}

            <button type="button" className="soccer-bingo-sim" onClick={onSimPlay} disabled={state.won}>
              ▶ Sim Live Match Play
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}