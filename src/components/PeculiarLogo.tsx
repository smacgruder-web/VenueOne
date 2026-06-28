import { motion } from 'framer-motion';

const NODES = [
  { x: 16, y: 8, color: '#0EA5A0' },
  { x: 28, y: 16, color: '#F97316' },
  { x: 24, y: 28, color: '#0EA5A0' },
  { x: 8, y: 28, color: '#EF4444' },
  { x: 4, y: 16, color: '#14B8A6' },
  { x: 16, y: 20, color: '#F5A623' },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
  [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
  [0, 2], [1, 3],
];

interface PeculiarLogoProps {
  size?: number;
}

export default function PeculiarLogo({ size = 32 }: PeculiarLogoProps) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 32 32" width={size} height={size}>
          <circle cx="16" cy="18" r="11" fill="none" stroke="url(#peculiarGrad)" strokeWidth="1" opacity="0.5" />
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              stroke="url(#peculiarGrad)"
              strokeWidth="1.2"
              opacity="0.9"
            />
          ))}
          {NODES.map((n, i) => (
            <motion.circle
              key={i}
              cx={n.x}
              cy={n.y}
              r="2.2"
              fill={n.color}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          <defs>
            <linearGradient id="peculiarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5A0" />
              <stop offset="50%" stopColor="#F5A623" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}