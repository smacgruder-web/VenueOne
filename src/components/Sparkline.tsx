import { motion } from 'framer-motion';

interface SparklineProps {
  buckets: number[];
  color: string;
  emptyText: string;
}

export default function Sparkline({ buckets, color, emptyText }: SparklineProps) {
  const max = Math.max(...buckets, 1);
  const w = 600;
  const h = 90;
  const pad = 6;
  const stepX = (w - pad * 2) / (buckets.length - 1);
  const pts = buckets.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y] as const;
  });
  const lineStr = pts.map((p) => p.join(',')).join(' ');
  const areaStr = `${pad},${h - pad} ${lineStr} ${w - pad},${h - pad}`;

  if (buckets.every((v) => v === 0)) {
    return <div style={{ fontSize: 13, color: '#3A4557' }}>{emptyText}</div>;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 100, display: 'block' }}>
      <motion.polygon
        points={areaStr}
        fill={`${color}22`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.polyline
        points={lineStr}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {pts.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill={color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 + i * 0.05, type: 'spring', stiffness: 400 }}
        />
      ))}
    </svg>
  );
}