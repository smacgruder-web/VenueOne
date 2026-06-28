import { SECTIONS } from '../data/constants';
import type { Order } from '../types/venue';
import { fmtMoney } from '../utils/format';

interface SeatingHeatmapProps {
  orders: Order[];
}

export default function SeatingHeatmap({ orders }: SeatingHeatmapProps) {
  const sectionRevenue: Record<string, number> = {};
  orders.forEach((o) => {
    sectionRevenue[o.section] = (sectionRevenue[o.section] || 0) + o.total;
  });
  const maxRev = Math.max(...SECTIONS.map((s) => sectionRevenue[s] || 0), 1);

  const cx = 300;
  const cy = 300;
  const rInner = 110;
  const rOuter = 215;
  const startAngle = -80;
  const totalAngle = 160;
  const gap = 2.5;
  const n = SECTIONS.length;
  const wedgeAngle = (totalAngle - gap * (n - 1)) / n;

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const polar = (r: number, angleDeg: number) => {
    const rad = toRad(angleDeg);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
  };
  const wedgePath = (a0: number, a1: number, rI: number, rO: number) => {
    const [x0o, y0o] = polar(rO, a0);
    const [x1o, y1o] = polar(rO, a1);
    const [x1i, y1i] = polar(rI, a1);
    const [x0i, y0i] = polar(rI, a0);
    return `M ${x0o} ${y0o} A ${rO} ${rO} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rI} ${rI} 0 0 0 ${x0i} ${y0i} Z`;
  };
  const heatColor = (t: number) => {
    const cold = [26, 35, 53];
    const hot = [245, 166, 35];
    const r = Math.round(cold[0] + (hot[0] - cold[0]) * t);
    const g = Math.round(cold[1] + (hot[1] - cold[1]) * t);
    const b = Math.round(cold[2] + (hot[2] - cold[2]) * t);
    return `rgb(${r},${g},${b})`;
  };

  const allEmpty = orders.length === 0;

  return (
    <div>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 280, display: 'block' }}>
        <ellipse cx={cx} cy={cy + 60} rx={95} ry={36} fill="#0A2010" stroke="#1E2A3A" strokeWidth="1.5" />
        <text x={cx} y={cy + 64} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1" fill="#3A4557" fontFamily="system-ui">
          FIELD
        </text>
        {SECTIONS.map((s, i) => {
          const a0 = startAngle + i * (wedgeAngle + gap);
          const a1 = a0 + wedgeAngle;
          const rev = sectionRevenue[s] || 0;
          const t = allEmpty ? 0 : rev / maxRev;
          const [lx, ly] = polar((rInner + rOuter) / 2, (a0 + a1) / 2);
          return (
            <g key={s}>
              <path d={wedgePath(a0, a1, rInner, rOuter)} fill={allEmpty ? '#111827' : heatColor(t)} stroke="#060C18" strokeWidth="2" />
              <text x={lx} y={ly - 6} textAnchor="middle" fontSize="13" fontWeight="800" fill="#F8F9FC" fontFamily="system-ui">
                {s}
              </text>
              <text x={lx} y={ly + 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#F8F9FC" fontFamily="system-ui">
                {rev > 0 ? fmtMoney(rev) : '—'}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 11, color: '#8B95A8' }}>
        <span>Low</span>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #1A2335, #F5A623)' }} />
        <span>High revenue</span>
      </div>
    </div>
  );
}