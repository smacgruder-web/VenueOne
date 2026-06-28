import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import FoodImage from './FoodImage';

const SLIDES = [
  {
    image: '/images/hero-game-night.jpg',
    tagline: 'Game night cravings',
    sub: 'Hot food. Cold drinks. Delivered to your seat.',
    mood: 'food' as const,
  },
  {
    image: '/images/menu/nachos.jpg',
    tagline: 'Stack it high',
    sub: 'Nachos, burgers, tenders — straight from the kitchen.',
    mood: 'food' as const,
  },
  {
    image: '/images/menu/craft-beer.jpg',
    tagline: 'Ice-cold refreshment',
    sub: 'Craft beer, seltzers & sodas — frosted and ready.',
    mood: 'drink' as const,
  },
];

export default function FoodHero() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-4 mt-3 overflow-hidden rounded-2xl" style={{ height: 200 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <FoodImage src={slide.image} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(6,12,24,0.1) 0%, rgba(6,12,24,0.5) 50%, rgba(6,12,24,0.92) 100%)',
            }}
          />
          {slide.mood === 'food' && (
            <div className="food-steam absolute bottom-16 left-1/4 opacity-40" aria-hidden />
          )}
          {slide.mood === 'drink' && (
            <div className="drink-frost absolute inset-0 opacity-30" aria-hidden />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <motion.p
          key={slide.tagline}
          className="text-2xl font-black tracking-tight text-white drop-shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {slide.tagline}
        </motion.p>
        <motion.p
          key={slide.sub}
          className="mt-1 text-sm text-[#C9D2E0]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {slide.sub}
        </motion.p>
        <div className="mt-3 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 20 : 6,
                background: i === index ? '#F5A623' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}