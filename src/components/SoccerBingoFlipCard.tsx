import { motion } from 'framer-motion';
import { useState } from 'react';

interface SoccerBingoFlipCardProps {
  onPlay: () => void;
}

export default function SoccerBingoFlipCard({ onPlay }: SoccerBingoFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <article className={`soccer-bingo-flip ${flipped ? 'is-flipped' : ''}`}>
      <div className="soccer-bingo-flip-inner">
        <button
          type="button"
          className="soccer-bingo-flip-face soccer-bingo-flip-front"
          onClick={() => setFlipped(true)}
          aria-label="Flip to see Soccer Bingo prizes"
        >
          <div
            className="soccer-bingo-flip-photo"
            style={{ backgroundImage: "url('/images/soccer-ball.png')" }}
          />
          <div className="soccer-bingo-flip-scrim" />
          <span className="soccer-bingo-flip-hint">Tap to flip</span>
          <div className="soccer-bingo-flip-caption">
            <h3>⚽ Soccer Bingo</h3>
            <p>Play &amp; win prizes</p>
          </div>
        </button>

        <div className="soccer-bingo-flip-face soccer-bingo-flip-back">
          <p className="soccer-bingo-flip-back-title">Match Night Prizes</p>
          <ul className="soccer-bingo-flip-prizes">
            <li>🛵 Free seat delivery</li>
            <li>💵 $5 off coupon</li>
          </ul>
          <p className="soccer-bingo-flip-copy">Mark five in a row while the match plays. Winners get rewards to use during the game.</p>
          <motion.button
            type="button"
            className="soccer-bingo-flip-play"
            onClick={onPlay}
            whileTap={{ scale: 0.97 }}
          >
            Play Now →
          </motion.button>
          <button type="button" className="soccer-bingo-flip-back-btn" onClick={() => setFlipped(false)}>
            ↩ Flip Back
          </button>
        </div>
      </div>
    </article>
  );
}