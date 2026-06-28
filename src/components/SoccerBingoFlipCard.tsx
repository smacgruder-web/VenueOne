import { motion } from 'framer-motion';
import { useState, type MouseEvent } from 'react';

interface SoccerBingoFlipCardProps {
  onPlay: () => void;
}

const MINI_EVENTS = ['⚽', '🟨', '🚩', '🧤', '⭐', 'FREE', '📣', '🎯'];

export default function SoccerBingoFlipCard({ onPlay }: SoccerBingoFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handlePlay = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFlipped(false);
    onPlay();
  };

  return (
    <article className="soccer-bingo-flip">
      <div className={`soccer-bingo-flip-inner ${flipped ? 'is-flipped' : ''}`}>
        <button
          type="button"
          className="soccer-bingo-flip-face soccer-bingo-flip-front"
          onClick={() => setFlipped(true)}
          aria-label="Flip Soccer Bingo card"
        >
          <div
            className="soccer-bingo-flip-photo"
            style={{ backgroundImage: "url('/images/soccer-ball.png')" }}
          />
          <div className="soccer-bingo-flip-scrim" />
          <span className="soccer-bingo-flip-hint">Tap to flip</span>
          <div className="soccer-bingo-flip-caption">
            <div className="soccer-bingo-flip-info">
              <h3>⚽ Soccer Bingo</h3>
              <p>Flip for prizes</p>
            </div>
          </div>
        </button>

        <div className="soccer-bingo-flip-face soccer-bingo-flip-back">
          <button
            type="button"
            className="soccer-bingo-flip-back-tap"
            onClick={() => setFlipped(false)}
            aria-label="Flip card back to front"
          />
          <div className="soccer-bingo-flip-back-bg" />
          <div className="soccer-bingo-flip-back-content">
            <p className="soccer-bingo-flip-back-kicker">Match Night Game</p>
            <h3 className="soccer-bingo-flip-back-title">Soccer Bingo</h3>
            <p className="soccer-bingo-flip-back-sub">Get 5 in a row during the match</p>

            <div className="soccer-bingo-flip-mini" aria-hidden>
              {MINI_EVENTS.map((cell, i) => (
                <span
                  key={i}
                  className={`soccer-bingo-flip-mini-cell ${i === 5 ? 'soccer-bingo-flip-mini-cell--free' : ''}`}
                >
                  {cell}
                </span>
              ))}
            </div>

            <div className="soccer-bingo-flip-prize-row">
              <span className="soccer-bingo-flip-prize-chip">🛵 Free Delivery</span>
              <span className="soccer-bingo-flip-prize-chip">💵 $5 Off</span>
            </div>
          </div>

          <div className="soccer-bingo-flip-caption soccer-bingo-flip-caption--back">
            <button
              type="button"
              className="soccer-bingo-flip-info soccer-bingo-flip-info--back"
              onClick={() => setFlipped(false)}
            >
              <span className="soccer-bingo-flip-back-link">↩ Flip back</span>
            </button>
            <motion.button
              type="button"
              className="soccer-bingo-flip-play"
              onClick={handlePlay}
              whileTap={{ scale: 0.94 }}
              aria-label="Play Soccer Bingo now"
            >
              Play Now
            </motion.button>
          </div>
        </div>
      </div>
    </article>
  );
}