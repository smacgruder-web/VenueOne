import type { CSSProperties } from 'react';

interface PeculiarLogoProps {
  size?: number;
}

const PIXIE_DUST = [
  { x: -18, y: -12, c: '#F5A623', s: 3, d: 0, dur: 2.2 },
  { x: 20, y: -10, c: '#FFF8E7', s: 2, d: 0.35, dur: 1.8 },
  { x: -14, y: 16, c: '#0EA5A0', s: 2.5, d: 0.7, dur: 2.5 },
  { x: 18, y: 14, c: '#F5A623', s: 2, d: 1.1, dur: 2.0 },
  { x: -22, y: 2, c: '#FFFFFF', s: 2, d: 0.55, dur: 1.6 },
  { x: 22, y: -2, c: '#F97316', s: 2.5, d: 1.4, dur: 2.3 },
  { x: 0, y: -20, c: '#F5A623', s: 3, d: 0.2, dur: 2.1 },
  { x: -6, y: 20, c: '#FFF8E7', s: 2, d: 0.9, dur: 1.9 },
  { x: 10, y: 18, c: '#0EA5A0', s: 2, d: 1.6, dur: 2.4 },
  { x: -10, y: -18, c: '#FFFFFF', s: 2.5, d: 1.25, dur: 2.0 },
] as const;

export default function PeculiarLogo({ size = 40 }: PeculiarLogoProps) {
  const srcSet =
    size > 32
      ? '/images/soccer-ball@2x.png 2x, /images/soccer-ball.png 1x'
      : '/images/soccer-ball.png 1x, /images/soccer-ball@2x.png 2x';

  const wrap = Math.round(size * 1.35);

  return (
    <div
      className="logo-ball-wrap"
      style={{ width: wrap, height: wrap }}
      aria-hidden
    >
      <div className="logo-ball-glow" style={{ width: size, height: size }} />
      {PIXIE_DUST.map((p, i) => (
        <span
          key={i}
          className="logo-pixie"
          style={
            {
              '--px': `${p.x}px`,
              '--py': `${p.y}px`,
              '--pc': p.c,
              '--ps': `${p.s}px`,
              '--pd': `${p.d}s`,
              '--pdu': `${p.dur}s`,
            } as CSSProperties
          }
        />
      ))}
      <img
        src="/images/soccer-ball.png"
        srcSet={srcSet}
        alt=""
        className="logo-ball-img"
        style={{ width: size, height: size }}
        width={size}
        height={size}
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}