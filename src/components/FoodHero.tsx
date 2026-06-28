import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HERO_IMAGE_URLS } from '../data/constants';

const SLIDES = [
  {
    image: HERO_IMAGE_URLS[0],
    tagline: 'Game night cravings',
    sub: 'Hot food. Cold drinks. Delivered to your seat.',
  },
  {
    image: HERO_IMAGE_URLS[1],
    tagline: 'Stack it high',
    sub: 'Nachos, burgers, tenders — straight from the kitchen.',
  },
  {
    image: HERO_IMAGE_URLS[2],
    tagline: 'Ice-cold refreshment',
    sub: 'Craft beer, seltzers & sodas — frosted and ready.',
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
    <div className="relative mx-3 mt-2 h-[200px] overflow-hidden rounded-2xl sm:mx-4 sm:mt-3 sm:h-[220px] md:h-[240px]">
      {SLIDES.map((s, i) => (
        <motion.div
          key={s.image}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.04 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          aria-hidden={i !== index}
        >
          <img
            src={s.image}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(6,12,24,0.25) 55%, rgba(6,12,24,0.88) 100%)',
            }}
          />
        </motion.div>
      ))}

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