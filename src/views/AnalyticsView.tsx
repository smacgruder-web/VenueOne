import { useState, type CSSProperties } from 'react';
import SeatingHeatmap from '../components/SeatingHeatmap';
import Sparkline from '../components/Sparkline';
import { RUNNERS, WINDOWS } from '../data/constants';
import { S } from '../styles/venueStyles';
import type { EventStats, Order } from '../types/venue';
import {
  bucketize,
  bucketLabel,
  downloadRecapPDF,
  exportOrdersCSV,
  getDuration,
} from '../utils/analytics';
import { fmtMoney, fmtSecs } from '../utils/format';

interface AnalyticsViewProps {
  orders: Order[];
  stats: EventStats;
  onReset: () => void;
}

const barFill = S.barFill as (w: string, c: string) => CSSProperties;

export default function AnalyticsView({ orders, stats, onReset }: AnalyticsViewProps) {
  const itemCounts: Record<string, number> = {};
  orders.forEach((o) =>
    o.items.forEach((i) => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
    }),
  );
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCount = topItems[0]?.[1] || 1;

  const sectionRevenue: Record<string, number> = {};
  orders.forEach((o) => {
    sectionRevenue[o.section] = (sectionRevenue[o.section] || 0) + o.total;
  });
  const topSections = Object.entries(sectionRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxRev = topSections[0]?.[1] || 1;

  const adoptionRate = stats.attendance > 0 ? ((stats.scans / stats.attendance) * 100).toFixed(1) : 0;
  const perCapLift =
    stats.perCap > 0
      ? (((stats.perCap - stats.baselinePerCap) / stats.baselinePerCap) * 100).toFixed(1)
      : 0;
  const isPositive = Number(perCapLift) > 0;

  const deliveryOrders = orders.filter((o) => o.fulfillment === 'delivery');
  const deliveryCount = deliveryOrders.length;
  const deliveryPct = orders.length ? Math.round((deliveryCount / orders.length) * 100) : 0;

  const prepTimes = orders
    .map((o) => getDuration(o.statusHistory, 'received', 'ready'))
    .filter((v): v is number => v != null);
  const avgPrepTime = prepTimes.length ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length : null;
  const deliveryTimes = deliveryOrders
    .map((o) => getDuration(o.statusHistory, 'ready', 'delivered'))
    .filter((v): v is number => v != null);
  const avgDeliveryTime = deliveryTimes.length
    ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
    : null;
  const dispatchTimes = deliveryOrders
    .map((o) => getDuration(o.statusHistory, 'ready', 'claimed'))
    .filter((v): v is number => v != null);
  const avgDispatchTime = dispatchTimes.length
    ? dispatchTimes.reduce((a, b) => a + b, 0) / dispatchTimes.length
    : null;
  const unclaimedCount = deliveryOrders.filter((o) => o.status === 'ready' && !o.runner).length;
  const totalTips = orders.reduce((s, o) => s + (o.tip || 0), 0);

  const bucketCount = 12;
  const bucketSizeMs = 5 * 60 * 1000;
  const revenueBuckets = bucketize(orders, bucketCount, bucketSizeMs, (o) => o.total);
  const orderBuckets = bucketize(orders, bucketCount, bucketSizeMs, () => 1);
  const peakIdx = orderBuckets.indexOf(Math.max(...orderBuckets));
  const peakLabel = orders.length ? bucketLabel(peakIdx, bucketCount, bucketSizeMs) : '—';
  const peakCount = orders.length ? orderBuckets[peakIdx] : 0;

  const windowAgg: Record<string, { count: number; totalPrep: number; prepN: number }> = {};
  orders
    .filter((o) => o.fulfillment !== 'delivery')
    .forEach((o) => {
      const w = o.window as string;
      if (!windowAgg[w]) windowAgg[w] = { count: 0, totalPrep: 0, prepN: 0 };
      windowAgg[w].count++;
      const d = getDuration(o.statusHistory, 'received', 'ready');
      if (d != null) {
        windowAgg[w].totalPrep += d;
        windowAgg[w].prepN++;
      }
    });
  const windowRows = WINDOWS.map((w) => ({
    window: w,
    count: windowAgg[w]?.count || 0,
    avgPrep: windowAgg[w]?.prepN ? windowAgg[w].totalPrep / windowAgg[w].prepN : null,
  }));
  const maxWindowCount = Math.max(...windowRows.map((r) => r.count), 1);

  const runnerAgg: Record<
    string,
    { total: number; completed: number; totalTime: number; timeN: number; active: number; tips: number }
  > = {};
  deliveryOrders.forEach((o) => {
    if (!o.runner) return;
    if (!runnerAgg[o.runner])
      runnerAgg[o.runner] = { total: 0, completed: 0, totalTime: 0, timeN: 0, active: 0, tips: 0 };
    runnerAgg[o.runner].total++;
    if (o.status === 'delivered') {
      runnerAgg[o.runner].completed++;
      runnerAgg[o.runner].tips += o.tip || 0;
      const d = getDuration(o.statusHistory, 'ready', 'delivered');
      if (d != null) {
        runnerAgg[o.runner].totalTime += d;
        runnerAgg[o.runner].timeN++;
      }
    } else if (o.status === 'ready') {
      runnerAgg[o.runner].active++;
    }
  });
  const runnerRows = RUNNERS.map((r) => ({
    name: r,
    total: runnerAgg[r]?.total || 0,
    completed: runnerAgg[r]?.completed || 0,
    active: runnerAgg[r]?.active || 0,
    tips: runnerAgg[r]?.tips || 0,
    avgTime: runnerAgg[r]?.timeN ? runnerAgg[r].totalTime / runnerAgg[r].timeN : null,
  })).sort((a, b) => b.total - a.total);
  const maxRunnerTotal = Math.max(...runnerRows.map((r) => r.total), 1);

  const totalItemQty = orders.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + i.qty, 0), 0);
  const avgItemsPerOrder = orders.length ? (totalItemQty / orders.length).toFixed(1) : '0';
  const hasFood = (o: Order) => o.items.some((i) => i.cat === 'Food');
  const hasDrink = (o: Order) => o.items.some((i) => i.cat === 'Drinks');
  const comboOrders = orders.filter((o) => hasFood(o) && hasDrink(o)).length;
  const foodOnlyOrders = orders.filter((o) => hasFood(o) && !hasDrink(o)).length;
  const drinksOnlyOrders = orders.filter((o) => hasDrink(o) && !hasFood(o)).length;
  const comboPct = orders.length ? Math.round((comboOrders / orders.length) * 100) : 0;
  const foodOnlyPct = orders.length ? Math.round((foodOnlyOrders / orders.length) * 100) : 0;
  const drinksOnlyPct = orders.length ? Math.round((drinksOnlyOrders / orders.length) * 100) : 0;

  const kpis = [
    {
      label: 'Total Revenue',
      value: fmtMoney(stats.totalRevenue),
      delta: `+${perCapLift}% vs baseline`,
      pos: isPositive,
    },
    { label: 'Orders', value: stats.totalOrders, delta: 'this event', pos: true },
    {
      label: 'Avg Order Value',
      value: stats.avgOrderValue > 0 ? fmtMoney(stats.avgOrderValue) : '$0.00',
      delta: `vs $${stats.baselinePerCap.toFixed(2)} baseline`,
      pos: stats.avgOrderValue > stats.baselinePerCap,
    },
    {
      label: 'Per-Cap Spend',
      value: stats.perCap > 0 ? fmtMoney(stats.perCap) : '$0.00',
      delta: `${isPositive ? '+' : ''}${perCapLift}% vs baseline`,
      pos: isPositive,
    },
    {
      label: 'QR Scan Rate',
      value: `${adoptionRate}%`,
      delta: 'of attendance',
      pos: parseFloat(String(adoptionRate)) > 10,
    },
    {
      label: 'Delivery Mix',
      value: `${deliveryPct}%`,
      delta: `${deliveryCount} of ${orders.length} orders`,
      pos: true,
    },
    {
      label: 'Avg Prep Time',
      value: fmtSecs(avgPrepTime),
      delta: 'received → ready',
      pos: avgPrepTime == null || avgPrepTime < 600,
    },
    {
      label: 'Avg Dispatch Time',
      value: fmtSecs(avgDispatchTime),
      delta: 'ready → claimed',
      pos: avgDispatchTime == null || avgDispatchTime < 180,
    },
    {
      label: 'Avg Delivery Time',
      value: fmtSecs(avgDeliveryTime),
      delta: 'claimed → seat',
      pos: avgDeliveryTime == null || avgDeliveryTime < 600,
    },
    {
      label: 'Awaiting Runner',
      value: unclaimedCount,
      delta: 'unclaimed right now',
      pos: unclaimedCount === 0,
    },
    { label: 'Tips Collected', value: fmtMoney(totalTips), delta: 'to runners tonight', pos: true },
    {
      label: 'Peak Order Time',
      value: peakLabel,
      delta: `${peakCount} orders in 5 min`,
      pos: true,
    },
    { label: 'Attendance', value: stats.attendance.toLocaleString(), delta: 'tonight', pos: true },
  ];

  const handleReset = () => {
    if (
      window.confirm(
        "Reset the shared venue ledger? This clears tonight's orders and stats for everyone viewing this dashboard.",
      )
    ) {
      onReset();
    }
  };

  const topRunner = runnerRows.find((r) => r.completed > 0) || null;
  const recapText = (() => {
    if (orders.length === 0)
      return "No orders yet tonight — the recap will write itself as the event gets underway.";
    const lines: string[] = [];
    lines.push(
      `Tonight's event has generated ${fmtMoney(stats.totalRevenue)} in concession revenue across ${stats.totalOrders} orders, a per-cap spend of ${fmtMoney(stats.perCap)} (${isPositive ? '+' : ''}${perCapLift}% vs. the ${fmtMoney(stats.baselinePerCap)} season baseline).`,
    );
    lines.push(
      `${deliveryPct}% of orders chose seat delivery over express pickup, with an average kitchen prep time of ${fmtSecs(avgPrepTime)}${avgDeliveryTime != null ? ` and a ${fmtSecs(avgDeliveryTime)} runner delivery time once claimed` : ''}.`,
    );
    if (topItems[0])
      lines.push(
        `${topItems[0][0]} is the top seller, and Section ${topSections[0]?.[0] ?? '—'} leads all sections in concession revenue.`,
      );
    if (topRunner)
      lines.push(
        `${topRunner.name} leads the runner team with ${topRunner.completed} completed deliveries${topRunner.tips > 0 ? ` and ${fmtMoney(topRunner.tips)} in tips` : ''}.`,
      );
    if (unclaimedCount > 0)
      lines.push(
        `${unclaimedCount} delivery order${unclaimedCount > 1 ? 's' : ''} ${unclaimedCount > 1 ? 'are' : 'is'} currently awaiting a runner.`,
      );
    lines.push(`Order volume peaked around ${peakLabel} with ${peakCount} orders in a 5-minute window.`);
    return lines.join(' ');
  })();
  const [copied, setCopied] = useState(false);
  const copyRecap = () => {
    try {
      navigator.clipboard.writeText(recapText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable in this context */
    }
  };

  return (
    <div style={S.analyticsWrap}>
      <div style={S.analyticsHeader}>
        <div>
          <div style={S.analyticsTitle}>Venue One — GM Analytics</div>
          <div style={S.analyticsSub}>Riverside Arena · Tonight's Event · Live</div>
          <div style={S.syncTag}>🔄 Shared live ledger — synced across every session of this dashboard</div>
        </div>
        <div style={S.headerBtns}>
          <button
            style={S.exportBtn}
            onClick={() => downloadRecapPDF({ recapText, kpis, topItems, topSections, runnerRows })}
          >
            📄 Download PDF Report
          </button>
          <button style={S.exportBtn} onClick={() => exportOrdersCSV(orders)}>
            ⬇ Export CSV
          </button>
          <button style={S.resetBtn} onClick={handleReset}>
            ↺ Reset Demo Data
          </button>
        </div>
      </div>

      <div style={S.kpiGrid}>
        {kpis.map((k, i) => (
          <div key={i} style={S.kpiCard}>
            <div style={S.kpiLabel}>{k.label}</div>
            <div style={S.kpiValue}>{k.value}</div>
            <div style={S.kpiDelta(k.pos)}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Tonight's Recap</div>
        <div style={S.recapCard}>
          {recapText}
          <div>
            <button style={S.copyBtn} onClick={copyRecap}>
              {copied ? '✓ Copied' : '📋 Copy Recap'}
            </button>
          </div>
        </div>
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Revenue — Last Hour</div>
        <Sparkline
          buckets={revenueBuckets}
          color="#F5A623"
          emptyText="Revenue trend will appear as orders come in"
        />
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Order Volume — Last Hour</div>
        <Sparkline
          buckets={orderBuckets}
          color="#5DADE2"
          emptyText="Order volume will appear as orders come in"
        />
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Window Load Balancing</div>
        <div style={S.barWrap}>
          {windowRows.map((w, i) => (
            <div key={w.window} style={S.barRow}>
              <div style={S.barLabel}>Window {w.window}</div>
              <div style={S.barTrack}>
                <div
                  style={barFill(`${(w.count / maxWindowCount) * 100}%`, i === 0 ? '#7B9EF5' : '#1A2A4A')}
                >
                  <span style={S.barVal}>
                    {w.count} orders{w.avgPrep != null ? ` · ${fmtSecs(w.avgPrep)} avg` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Runner Performance</div>
        <div style={S.barWrap}>
          {runnerRows.map((r, i) => (
            <div key={r.name} style={S.barRow}>
              <div style={S.barLabel}>{r.name}</div>
              <div style={S.barTrack}>
                <div
                  style={barFill(`${(r.total / maxRunnerTotal) * 100}%`, i === 0 ? '#C77DFF' : '#3A2A5A')}
                >
                  <span style={S.barVal}>
                    {r.completed}/{r.total} delivered
                    {r.avgTime != null ? ` · ${fmtSecs(r.avgTime)} avg` : ''}
                    {r.tips > 0 ? ` · ${fmtMoney(r.tips)} tips` : ''}
                    {r.active > 0 ? ` · ${r.active} out now` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {deliveryOrders.length === 0 && (
          <div style={{ fontSize: 13, color: '#3A4557', marginTop: 8 }}>
            Runner stats will appear once delivery orders come in
          </div>
        )}
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Basket Composition</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={S.statChip}>
            <div style={S.kpiLabel}>Avg Items / Order</div>
            <div style={S.kpiValue}>{avgItemsPerOrder}</div>
          </div>
          <div style={S.statChip}>
            <div style={S.kpiLabel}>Food + Drink Combo</div>
            <div style={S.kpiValue}>{comboPct}%</div>
          </div>
          <div style={S.statChip}>
            <div style={S.kpiLabel}>Food-Only Orders</div>
            <div style={S.kpiValue}>{foodOnlyPct}%</div>
          </div>
          <div style={S.statChip}>
            <div style={S.kpiLabel}>Drinks-Only Orders</div>
            <div style={S.kpiValue}>{drinksOnlyPct}%</div>
          </div>
        </div>
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Top Items Tonight</div>
        <div style={S.barWrap}>
          {topItems.map(([name, count], i) => (
            <div key={i} style={S.barRow}>
              <div style={S.barLabel}>{name}</div>
              <div style={S.barTrack}>
                <div
                  style={barFill(`${(count / maxCount) * 100}%`, i === 0 ? '#F5A623' : '#2A3D5A')}
                >
                  <span style={S.barVal}>{count}</span>
                </div>
              </div>
            </div>
          ))}
          {topItems.length === 0 && (
            <div style={{ fontSize: 13, color: '#3A4557' }}>Orders will appear as fans buy</div>
          )}
        </div>
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Seating Heatmap</div>
        <SeatingHeatmap orders={orders} />
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Revenue by Section</div>
        <div style={S.barWrap}>
          {topSections.map(([sec, rev], i) => (
            <div key={i} style={S.barRow}>
              <div style={S.barLabel}>Sec {sec}</div>
              <div style={S.barTrack}>
                <div
                  style={barFill(`${(rev / maxRev) * 100}%`, i === 0 ? '#2ECC71' : '#1A3A2A')}
                >
                  <span style={S.barVal}>{fmtMoney(rev)}</span>
                </div>
              </div>
            </div>
          ))}
          {topSections.length === 0 && (
            <div style={{ fontSize: 13, color: '#3A4557' }}>Section data will appear here</div>
          )}
        </div>
      </div>

      <div style={S.feedSection}>
        <div style={S.feedTitle}>Live Order Feed</div>
        {orders.slice(0, 12).map((order) => (
          <div key={order.id} style={S.feedItem}>
            <div style={S.feedLeft}>
              <div style={S.feedDot(order.status)} />
              <div>
                <div style={S.feedText}>
                  #{order.id} · Sec {order.section} ·{' '}
                  {order.fulfillment === 'delivery' ? `🛵 ${order.runner}` : `Win ${order.window}`}
                </div>
                <div style={S.feedSub}>{order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</div>
              </div>
            </div>
            <div style={S.feedAmt}>{fmtMoney(order.total)}</div>
          </div>
        ))}
        {orders.length === 0 && (
          <div style={{ fontSize: 13, color: '#3A4557' }}>No orders yet tonight</div>
        )}
      </div>
    </div>
  );
}