import { motion } from 'framer-motion';

interface SoccerBingoPromoCardProps {
  onOpen: () => void;
}

export default function SoccerBingoPromoCard({ onOpen }: SoccerBingoPromoCardProps) {
  return (
    <motion.article
      className="soccer-bingo-promo menu-food-card menu-card-flip"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <button type="button" className="soccer-bingo-promo-open" onClick={onOpen} aria-label="Open Soccer Bingo">
        <div
          className="soccer-bingo-promo-photo"
          style={{ backgroundImage: "url('/images/soccer-ball.png')" }}
        />
        <div className="menu-card-scrim soccer-bingo-promo-scrim" />
        <span className="soccer-bingo-promo-hint">Tap to open</span>
        <div className="menu-card-caption">
          <div className="menu-card-info-btn soccer-bingo-promo-info">
            <h3 className="menu-card-title truncate text-[13px] font-extrabold text-white sm:text-base">
              ⚽ Soccer Bingo
            </h3>
            <p className="menu-card-price mt-1 text-[15px] font-black text-[#2ecc71] sm:text-lg">Win prizes</p>
          </div>
        </div>
      </button>
    </motion.article>
  );
}