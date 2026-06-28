import { useState, useEffect, useRef } from "react";

// ─── Seed Data ───────────────────────────────────────────────────────────────
const MENU = [
  { id: 1, name: "Stadium Dog", desc: "All-beef frank, mustard, relish", price: 7.00, emoji: "🌭", cat: "Food", popular: true },
  { id: 2, name: "Nachos", desc: "Chips, cheddar, jalapeños", price: 9.50, emoji: "🧀", cat: "Food", popular: true },
  { id: 3, name: "Pretzel", desc: "Salted, with cheese dip", price: 6.50, emoji: "🥨", cat: "Food" },
  { id: 4, name: "Burger", desc: "1/3 lb beef, LTO, special sauce", price: 12.00, emoji: "🍔", cat: "Food", popular: true },
  { id: 5, name: "Chicken Tenders", desc: "3-piece, honey mustard", price: 10.50, emoji: "🍗", cat: "Food" },
  { id: 6, name: "Pizza Slice", desc: "Pepperoni or cheese", price: 5.50, emoji: "🍕", cat: "Food" },
  { id: 7, name: "Domestic Beer", desc: "Bud, Miller, Coors — 16oz", price: 9.00, emoji: "🍺", cat: "Drinks", popular: true },
  { id: 8, name: "Craft Beer", desc: "Local IPA — 16oz", price: 11.00, emoji: "🍻", cat: "Drinks" },
  { id: 9, name: "Hard Seltzer", desc: "White Claw variety — 12oz", price: 8.50, emoji: "🥂", cat: "Drinks" },
  { id: 10, name: "Soda", desc: "Pepsi, Diet Pepsi, Mountain Dew", price: 5.00, emoji: "🥤", cat: "Drinks" },
  { id: 11, name: "Water", desc: "Dasani 20oz", price: 4.00, emoji: "💧", cat: "Drinks" },
  { id: 12, name: "Loaded Fries", desc: "Fries, bacon, cheddar, sour cream", price: 8.50, emoji: "🍟", cat: "Food" },
];

const SECTIONS = ["101", "102", "103", "104", "105", "106", "107", "108"];
const WINDOWS = ["A", "B", "C"];
const RUNNERS = ["Marcus", "Devon", "Aaliyah", "Trey", "Nia"];
const DELIVERY_FEE = 2.50;

function genId() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtMoney(n) { return "$" + n.toFixed(2); }

// What button/action a staff card should show next. Staff own the kitchen
// (received → preparing → ready); for delivery orders, "ready" hands off to
// the Runner tab, which owns claim + final delivery from there.
function nextAction(order) {
  if (order.status === "received") return { next: "preparing", label: "▶ START PREPARING" };
  if (order.status === "preparing") return { next: "ready", label: order.fulfillment === "delivery" ? "🛵 STAGE FOR RUNNER" : "✓ MARK READY" };
  return null;
}

// Soft alert chime for new orders hitting the staff board.
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) { /* audio not available — fail silently */ }
}

// Append a status transition to an order's history (used by every status change,
// manual or simulated) so the analytics layer can compute real timing metrics.
function withStatus(order, status) {
  return { ...order, status, statusHistory: [...(order.statusHistory || []), { status, ts: Date.now() }] };
}

// Auto-progress timers should never regress an order staff has already moved
// forward (or completed) manually — only advance if the target stage is later.
const STATUS_ORDER = ["received", "preparing", "ready", "delivered"];
function advanceIfLater(order, status) {
  if (STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(order.status)) return order;
  return withStatus(order, status);
}

// Kitchen + delivery timing simulation, shared by every order (fan-placed or
// background-generated) so the whole board behaves consistently. Staff can
// still jump ahead manually at any point via updateStatus. Delivery orders only
// auto-complete if a runner is already assigned (background sim pre-assigns
// one); unclaimed orders sit at "ready" until a real runner claims + delivers.
function scheduleAutoProgress(setOrders, orderId, isDelivery) {
  setTimeout(() => {
    setOrders(prev => prev.map(o => o.id === orderId ? advanceIfLater(o, "preparing") : o));
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === orderId ? advanceIfLater(o, "ready") : o));
      if (isDelivery) {
        setTimeout(() => {
          setOrders(prev => prev.map(o => {
            if (o.id !== orderId || !o.runner) return o;
            return advanceIfLater(o, "delivered");
          }));
        }, 6000 + Math.random() * 5000);
      }
    }, 8000 + Math.random() * 6000);
  }, 2000 + Math.random() * 3000);
}

// Seconds elapsed between two status events in an order's history, or null if
// either event hasn't happened yet.
function getDuration(history, fromStatus, toStatus) {
  if (!history) return null;
  const from = history.find(h => h.status === fromStatus);
  const to = history.find(h => h.status === toStatus);
  if (!from || !to) return null;
  return (to.ts - from.ts) / 1000;
}

function fmtSecs(s) {
  if (s == null || isNaN(s)) return "—";
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// Buckets orders into fixed-size time windows ending now, summing valueFn(order)
// per bucket. Used to drive every trend sparkline in GM Analytics.
function bucketize(orders, bucketCount, bucketSizeMs, valueFn) {
  const now = Date.now();
  const buckets = Array.from({ length: bucketCount }, () => 0);
  orders.forEach(o => {
    const age = now - o.ts;
    const idx = bucketCount - 1 - Math.floor(age / bucketSizeMs);
    if (idx >= 0 && idx < bucketCount) buckets[idx] += valueFn(o);
  });
  return buckets;
}

function bucketLabel(idx, bucketCount, bucketSizeMs) {
  const bucketsAgo = bucketCount - 1 - idx;
  const t = Date.now() - bucketsAgo * bucketSizeMs;
  return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function exportOrdersCSV(orders) {
  const header = "Order ID,Section,Fulfillment,Window/Seat,Runner,Total,Tip,Status,Time\n";
  const rows = orders.map(o => [
    o.id,
    o.section,
    o.fulfillment,
    o.fulfillment === "delivery" ? (o.seat || "") : `Window ${o.window || ""}`,
    o.runner || "",
    o.total.toFixed(2),
    (o.tip || 0).toFixed(2),
    o.status,
    new Date(o.ts).toLocaleString(),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `venue-one-orders-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Builds a clean, print-ready HTML document for the GM recap. Deliberately a
// light/print theme (not the app's dark UI) since this is meant to be printed
// or saved as a PDF and shared, not viewed on a kiosk screen.
function buildRecapHTML({ recapText, kpis, topItems, topSections, runnerRows }) {
  const esc = (v) => String(v).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const generatedAt = new Date().toLocaleString([], { dateStyle: "long", timeStyle: "short" });

  const kpiCards = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${esc(k.label)}</div>
      <div class="kpi-value">${esc(k.value)}</div>
      <div class="kpi-delta" style="color:${k.pos ? "#2a9d4a" : "#c0392b"}">${esc(k.delta)}</div>
    </div>`).join("");

  const itemRows = topItems.length
    ? topItems.map(([name, count]) => `<tr><td>${esc(name)}</td><td style="text-align:right">${count}</td></tr>`).join("")
    : `<tr><td colspan="2" style="color:#999">No items yet</td></tr>`;

  const sectionRows = topSections.length
    ? topSections.map(([sec, rev]) => `<tr><td>Section ${esc(sec)}</td><td style="text-align:right">${esc(fmtMoney(rev))}</td></tr>`).join("")
    : `<tr><td colspan="2" style="color:#999">No data yet</td></tr>`;

  const runnersWithActivity = runnerRows.filter(r => r.total > 0);
  const runnerRowsHtml = runnersWithActivity.length
    ? runnersWithActivity.map(r => `
        <tr>
          <td>${esc(r.name)}</td>
          <td style="text-align:right">${r.completed}/${r.total}</td>
          <td style="text-align:right">${r.avgTime != null ? esc(fmtSecs(r.avgTime)) : "—"}</td>
          <td style="text-align:right">${esc(fmtMoney(r.tips))}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" style="color:#999">No deliveries yet</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Venue One — Tonight's Recap</title>
<style>
  @page { margin: 0.6in; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; margin: 0; padding: 28px 36px; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  .sub { font-size: 12px; color: #666; margin-bottom: 4px; }
  .accent { height: 3px; background: #F5A623; margin: 14px 0 22px; border-radius: 2px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.07em; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 26px 0 10px; }
  .recap { font-size: 13px; line-height: 1.7; background: #f7f7f7; border: 1px solid #e3e3e3; border-radius: 8px; padding: 14px 16px; page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; page-break-inside: avoid; }
  td { padding: 6px 4px; border-bottom: 1px solid #eee; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; page-break-inside: avoid; }
  .kpi-card { border: 1px solid #e3e3e3; border-radius: 8px; padding: 10px 12px; }
  .kpi-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
  .kpi-value { font-size: 17px; font-weight: 800; margin-top: 2px; }
  .kpi-delta { font-size: 10px; margin-top: 2px; }
  footer { margin-top: 28px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>Venue One <span style="color:#F5A623">·</span> Tonight's Event Recap</h1>
  <div class="sub">Riverside Arena · Generated ${esc(generatedAt)}</div>
  <div class="accent"></div>

  <h2>Executive Summary</h2>
  <div class="recap">${esc(recapText)}</div>

  <h2>Key Metrics</h2>
  <div class="kpi-grid">${kpiCards}</div>

  <h2>Top Items Tonight</h2>
  <table><tbody>${itemRows}</tbody></table>

  <h2>Revenue by Section</h2>
  <table><tbody>${sectionRows}</tbody></table>

  <h2>Runner Performance</h2>
  <table>
    <thead><tr><td><strong>Runner</strong></td><td style="text-align:right"><strong>Delivered</strong></td><td style="text-align:right"><strong>Avg Time</strong></td><td style="text-align:right"><strong>Tips</strong></td></tr></thead>
    <tbody>${runnerRowsHtml}</tbody>
  </table>

  <footer>Generated automatically by Venue One · Riverside Arena</footer>
</body>
</html>`;
}

// Opens the recap as a print-ready document and triggers the browser's native
// print dialog, where "Save as PDF" produces a real file — zero dependencies,
// works everywhere, no PDF library needed.
function downloadRecapPDF(data) {
  const html = buildRecapHTML(data);
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups for this page to generate the PDF report.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
}

// ─── Shared State Hook ────────────────────────────────────────────────────────

// Persists the full event ledger (orders + stats) to a shared storage key so
// every session of this dashboard (fan, staff, GM) reads and writes the same
// live data set and survives a page refresh.
const LEDGER_KEY = "venue-ledger-v1";
const DEFAULT_STATS = {
  totalRevenue: 0,
  totalOrders: 0,
  scans: 0,
  avgOrderValue: 0,
  perCap: 0,
  attendance: 6214,
  baselinePerCap: 14.20,
};

function useVenueState() {
  const [orders, setOrders] = useState([]);
  const [eventStats, setEventStats] = useState(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);

  // Load whatever's already in the shared ledger before doing anything else.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await window.storage.get(LEDGER_KEY, true);
        if (mounted && result && result.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
          if (parsed.eventStats) setEventStats(parsed.eventStats);
        }
      } catch (e) {
        // No ledger saved yet — start fresh.
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Debounced save of the full ledger any time it changes, once loaded.
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      window.storage
        .set(LEDGER_KEY, JSON.stringify({ orders: orders.slice(0, 200), eventStats }), true)
        .catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [orders, eventStats, loaded]);

  const registerOrder = (order) => {
    setOrders(prev => [order, ...prev]);
    setEventStats(prev => {
      const newTotal = prev.totalRevenue + order.total;
      const newOrders = prev.totalOrders + 1;
      return {
        ...prev,
        totalRevenue: newTotal,
        totalOrders: newOrders,
        scans: prev.scans + Math.floor(Math.random() * 3) + 1,
        avgOrderValue: newTotal / newOrders,
        perCap: newTotal / prev.attendance,
      };
    });
  };

  const addOrder = (items, section, fulfillment = "pickup", seatInfo = null, tip = 0) => {
    const baseTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const total = baseTotal + (fulfillment === "delivery" ? DELIVERY_FEE : 0);
    const isDelivery = fulfillment === "delivery";
    const order = {
      id: genId(),
      items,
      total,
      tip: isDelivery ? tip : 0,
      section,
      fulfillment,
      window: isDelivery ? null : WINDOWS[Math.floor(Math.random() * WINDOWS.length)],
      seat: isDelivery ? seatInfo : null,
      runner: null, // unclaimed — waits in the runner pool once the kitchen marks it ready
      status: "received",
      ts: Date.now(),
      statusHistory: [{ status: "received", ts: Date.now() }],
      name: ["Alex M.", "Jordan K.", "Sam T.", "Riley P.", "Casey W."][Math.floor(Math.random() * 5)],
    };
    registerOrder(order);
    scheduleAutoProgress(setOrders, order.id, isDelivery);
    return order;
  };

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? withStatus(o, status) : o));
  };

  // A runner claims an unclaimed delivery — records the dispatch-latency event
  // (ready → claimed) for analytics without touching the order's status.
  const claimOrder = (id, runnerName) => {
    setOrders(prev => prev.map(o => o.id === id
      ? { ...o, runner: runnerName, statusHistory: [...(o.statusHistory || []), { status: "claimed", ts: Date.now() }] }
      : o));
  };

  const resetData = async () => {
    setOrders([]);
    setEventStats(DEFAULT_STATS);
    try { await window.storage.delete(LEDGER_KEY, true); } catch (e) { /* nothing to clear */ }
  };

  // Simulate background orders every 12-20s, mixing pickup and delivery.
  // Waits for the initial load so we don't double-seed on top of saved data.
  useEffect(() => {
    if (!loaded) return;
    const tick = () => {
      const count = Math.floor(Math.random() * 3) + 1;
      const items = Array.from({ length: count }, () => {
        const m = MENU[Math.floor(Math.random() * MENU.length)];
        return { ...m, qty: 1 };
      });
      const section = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];
      const isDelivery = Math.random() < 0.35;
      const baseTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const total = baseTotal + (isDelivery ? DELIVERY_FEE : 0);
      const tipPct = isDelivery && Math.random() < 0.7 ? [0.15, 0.18, 0.20, 0.25][Math.floor(Math.random() * 4)] : 0;
      const tip = isDelivery ? Math.round(baseTotal * tipPct * 100) / 100 : 0;
      const order = {
        id: genId(),
        items,
        total,
        tip,
        section,
        fulfillment: isDelivery ? "delivery" : "pickup",
        window: isDelivery ? null : WINDOWS[Math.floor(Math.random() * WINDOWS.length)],
        seat: isDelivery ? `Sec ${section}, Row ${Math.floor(Math.random() * 20) + 1}, Seat ${Math.floor(Math.random() * 30) + 1}` : null,
        runner: isDelivery ? RUNNERS[Math.floor(Math.random() * RUNNERS.length)] : null,
        status: "received",
        ts: Date.now(),
        statusHistory: [{ status: "received", ts: Date.now() }],
        name: ["Taylor B.", "Morgan L.", "Drew F.", "Jamie C.", "Quinn R."][Math.floor(Math.random() * 5)],
        auto: true,
      };
      setOrders(prev => [order, ...prev.slice(0, 199)]);
      setEventStats(prev => {
        const newTotal = prev.totalRevenue + total;
        const newOrders = prev.totalOrders + 1;
        return {
          ...prev,
          totalRevenue: newTotal,
          totalOrders: newOrders,
          scans: prev.scans + Math.floor(Math.random() * 4) + 1,
          avgOrderValue: newTotal / newOrders,
          perCap: newTotal / prev.attendance,
        };
      });
      scheduleAutoProgress(setOrders, order.id, isDelivery);
    };
    const interval = setInterval(tick, 14000 + Math.random() * 8000);
    // Seed a few initial orders
    setTimeout(() => tick(), 1000);
    setTimeout(() => tick(), 3000);
    setTimeout(() => tick(), 5500);
    return () => clearInterval(interval);
  }, [loaded]);

  return { orders, eventStats, addOrder, updateStatus, claimOrder, resetData, loaded };
}

// ─── Fan Identity Hook ─────────────────────────────────────────────────────────
// Tracks "my active order" and "my order history" per-device (shared: false),
// separate from the shared venue ledger. This is what lets the fan switch
// between Fan/Staff/Analytics tabs — or refresh — without losing their place
// in an order they just placed; the live status itself always comes from the
// real order record in the shared ledger, never a local timer.
const FAN_KEY = "my-fan-state-v1";
function useFanIdentity() {
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [myOrderIds, setMyOrderIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await window.storage.get(FAN_KEY, false);
        if (mounted && r && r.value) {
          const parsed = JSON.parse(r.value);
          if (parsed.activeOrderId) setActiveOrderId(parsed.activeOrderId);
          if (Array.isArray(parsed.myOrderIds)) setMyOrderIds(parsed.myOrderIds);
        }
      } catch (e) { /* nothing saved yet on this device */ }
      if (mounted) setLoaded(true);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      window.storage.set(FAN_KEY, JSON.stringify({ activeOrderId, myOrderIds: myOrderIds.slice(0, 50) }), false).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [activeOrderId, myOrderIds, loaded]);

  const trackOrder = (id) => {
    setActiveOrderId(id);
    setMyOrderIds(prev => prev.includes(id) ? prev : [id, ...prev]);
  };

  return { activeOrderId, setActiveOrderId, myOrderIds, trackOrder };
}

// ─── Runner Identity Hook ───────────────────────────────────────────────────
// Remembers which runner this device is signed in as (per-device, shared:false)
// so a runner's claimed/active deliveries survive a tab switch or refresh.
const RUNNER_KEY = "my-runner-state-v1";
function useRunnerIdentity() {
  const [me, setMe] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await window.storage.get(RUNNER_KEY, false);
        if (mounted && r && r.value) {
          const parsed = JSON.parse(r.value);
          if (parsed.me) setMe(parsed.me);
        }
      } catch (e) { /* nothing saved yet on this device */ }
      if (mounted) setLoaded(true);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      window.storage.set(RUNNER_KEY, JSON.stringify({ me }), false).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [me, loaded]);

  return { me, setMe };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  // nav
  nav: { display: "flex", alignItems: "center", gap: 0, background: "#0A0F1E", borderBottom: "1px solid #1E2A3A", padding: "0 16px" },
  brandBlock: { display: "flex", alignItems: "baseline", paddingRight: 16, marginRight: 8, borderRight: "1px solid #1E2A3A" },
  brandMark: { fontSize: 14, fontWeight: 800, color: "#F8F9FC", letterSpacing: "0.05em" },
  brandAccent: { fontSize: 14, fontWeight: 800, color: "#F5A623", letterSpacing: "0.05em" },
  navBtn: (a) => ({
    padding: "14px 18px", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
    textTransform: "uppercase", border: "none", cursor: "pointer", transition: "all 0.15s",
    background: "transparent", color: a ? "#F5A623" : "#8B95A8",
    borderBottom: a ? "2px solid #F5A623" : "2px solid transparent",
  }),
  // fan view
  fanWrap: { background: "#0A0F1E", minHeight: "100vh", color: "#F8F9FC", fontFamily: "system-ui, -apple-system, sans-serif" },
  fanHeader: { background: "linear-gradient(180deg, #0D1929 0%, #0A0F1E 100%)", padding: "20px 16px 16px", borderBottom: "1px solid #1E2A3A" },
  fanHeaderTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  liveTag: { display: "inline-flex", alignItems: "center", gap: 6, background: "#F5A623", color: "#0A0F1E", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 4 },
  liveDot: { width: 6, height: 6, borderRadius: "50%", background: "#0A0F1E", animation: "pulse 1.5s infinite" },
  historyBtn: { background: "transparent", border: "1px solid #2A3547", color: "#8B95A8", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 20, cursor: "pointer" },
  fanTitle: { fontSize: 22, fontWeight: 800, color: "#F8F9FC", marginBottom: 2 },
  fanSub: { fontSize: 13, color: "#8B95A8" },
  catRow: { display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", borderBottom: "1px solid #1E2A3A" },
  catBtn: (a) => ({
    padding: "6px 14px", borderRadius: 20, border: a ? "1px solid #F5A623" : "1px solid #2A3547",
    background: a ? "#F5A623" : "transparent", color: a ? "#0A0F1E" : "#8B95A8",
    fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
  }),
  fulfillRow: { display: "flex", gap: 8, padding: "12px 16px 0" },
  fulfillBtn: (a) => ({
    flex: 1, padding: "10px 12px", borderRadius: 10, border: a ? "1px solid #F5A623" : "1px solid #1E2A3A",
    background: a ? "#1A1400" : "#111827", color: a ? "#F5A623" : "#8B95A8",
    fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center",
  }),
  seatRow: { display: "flex", gap: 8, padding: "10px 16px 0" },
  seatInput: { flex: 1, background: "#111827", border: "1px solid #1E2A3A", borderRadius: 8, padding: "9px 12px", color: "#F8F9FC", fontSize: 13, outline: "none" },
  tipLabel: { fontSize: 12, color: "#8B95A8", margin: "10px 0 6px" },
  tipRow: { display: "flex", gap: 6 },
  tipBtn: (a) => ({
    flex: 1, padding: "8px 6px", borderRadius: 8, border: a ? "1px solid #F5A623" : "1px solid #2A3547",
    background: a ? "#1A1400" : "transparent", color: a ? "#F5A623" : "#8B95A8",
    fontSize: 12, fontWeight: 700, cursor: "pointer",
  }),
  menuGrid: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 },
  menuCard: (inCart) => ({
    background: inCart ? "#0D1929" : "#111827", border: inCart ? "1px solid #F5A623" : "1px solid #1E2A3A",
    borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
    transition: "all 0.15s",
  }),
  menuEmoji: { fontSize: 32, flexShrink: 0 },
  menuInfo: { flex: 1, minWidth: 0 },
  menuName: { fontSize: 14, fontWeight: 700, color: "#F8F9FC", marginBottom: 2 },
  menuDesc: { fontSize: 12, color: "#8B95A8", marginBottom: 4 },
  menuPrice: { fontSize: 14, fontWeight: 700, color: "#F5A623" },
  popularBadge: { fontSize: 9, fontWeight: 700, color: "#F5A623", border: "1px solid #F5A623", borderRadius: 4, padding: "1px 5px", letterSpacing: "0.06em", marginLeft: 6 },
  qtyRow: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: "50%", border: "1px solid #2A3547", background: "#1A2335", color: "#F8F9FC", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  qtyNum: { fontSize: 14, fontWeight: 700, color: "#F8F9FC", minWidth: 16, textAlign: "center" },
  cartBar: { position: "sticky", bottom: 0, background: "#0A0F1E", borderTop: "1px solid #1E2A3A", padding: "12px 16px" },
  cartBtn: (has) => ({
    width: "100%", padding: "14px", borderRadius: 10, border: "none", cursor: has ? "pointer" : "not-allowed",
    background: has ? "#F5A623" : "#1A2335", color: has ? "#0A0F1E" : "#3A4557",
    fontSize: 14, fontWeight: 800, letterSpacing: "0.03em", transition: "all 0.15s",
  }),
  // checkout / history modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "flex-end" },
  sheet: { background: "#111827", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxHeight: "80vh", overflowY: "auto" },
  sheetTitle: { fontSize: 18, fontWeight: 800, color: "#F8F9FC", marginBottom: 16 },
  lineItem: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2A3A", fontSize: 13, color: "#8B95A8" },
  lineTotal: { display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: 16, fontWeight: 800, color: "#F8F9FC" },
  payBtn: { width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#F5A623", color: "#0A0F1E", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 16 },
  historyEmpty: { color: "#3A4557", fontSize: 13, textAlign: "center", padding: "24px 0" },
  historyRow: { padding: "10px 0", borderBottom: "1px solid #1E2A3A" },
  historyHead: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#F8F9FC" },
  historyItems: { fontSize: 12, color: "#8B95A8", margin: "4px 0 8px" },
  reorderBtn: { background: "transparent", border: "1px solid #F5A623", color: "#F5A623", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 16, cursor: "pointer" },
  // confirmation
  confirmWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: 24, textAlign: "center" },
  bigEmoji: { fontSize: 64, marginBottom: 16 },
  confirmTitle: { fontSize: 24, fontWeight: 800, color: "#F8F9FC", marginBottom: 8 },
  confirmSub: { fontSize: 14, color: "#8B95A8", marginBottom: 24, lineHeight: 1.6 },
  windowTag: { background: "#F5A623", color: "#0A0F1E", fontSize: 28, fontWeight: 900, padding: "12px 32px", borderRadius: 12, marginBottom: 16, letterSpacing: "0.04em" },
  runnerCard: { background: "#111827", border: "1px solid #F5A623", borderRadius: 12, padding: "16px 24px", marginBottom: 16, minWidth: 220 },
  runnerName: { fontSize: 18, fontWeight: 800, color: "#F5A623", marginBottom: 4 },
  runnerSeat: { fontSize: 12, color: "#8B95A8" },
  statusPill: (s) => ({
    display: "inline-block", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
    background: s === "ready" || s === "delivered" ? "#2ECC71" : s === "preparing" ? "#F5A623" : "#2A3547",
    color: s === "ready" || s === "delivered" ? "#fff" : s === "preparing" ? "#0A0F1E" : "#8B95A8",
  }),
  // staff
  staffWrap: { background: "#060C18", minHeight: "100vh", color: "#F8F9FC", fontFamily: "system-ui, sans-serif" },
  staffHeader: { background: "#0A0F1E", borderBottom: "1px solid #1E2A3A", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
  staffTitle: { fontSize: 18, fontWeight: 800, color: "#F5A623" },
  staffSub: { fontSize: 12, color: "#8B95A8", marginTop: 2 },
  filterRow: { display: "flex", gap: 8, padding: "12px 20px 0" },
  filterBtn: (a) => ({
    padding: "6px 14px", borderRadius: 20, border: a ? "1px solid #F5A623" : "1px solid #2A3547",
    background: a ? "#F5A623" : "transparent", color: a ? "#0A0F1E" : "#8B95A8",
    fontSize: 12, fontWeight: 700, cursor: "pointer",
  }),
  orderGrid: { padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 },
  orderCard: (s) => ({
    background: s === "ready" ? "#0A2010" : s === "preparing" ? "#1A1400" : "#111827",
    border: `1px solid ${s === "ready" ? "#2ECC71" : s === "preparing" ? "#F5A623" : "#1E2A3A"}`,
    borderRadius: 12, padding: 14, transition: "all 0.3s",
    animation: s === "received" ? "flash 1.6s infinite" : "none",
  }),
  orderCardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  orderId: { fontSize: 18, fontWeight: 900, color: "#F8F9FC", letterSpacing: "0.05em" },
  orderMeta: { fontSize: 11, color: "#8B95A8", marginTop: 2 },
  windowBadge: (w) => ({
    background: w === "A" ? "#1A2060" : w === "B" ? "#1A3A1A" : "#3A1A20",
    color: w === "A" ? "#7B9EF5" : w === "B" ? "#2ECC71" : "#F5A623",
    fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.06em",
  }),
  deliveryBadge: { background: "#3A1A4A", color: "#C77DFF", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.06em" },
  deliveryMeta: { fontSize: 11, color: "#C77DFF", marginTop: 4 },
  orderItems: { fontSize: 12, color: "#8B95A8", lineHeight: 1.8, marginBottom: 10 },
  orderTotal: { fontSize: 16, fontWeight: 800, color: "#F5A623", marginBottom: 10 },
  actionBtn: (s) => ({
    width: "100%", padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
    background: s === "received" ? "#F5A623" : s === "preparing" ? "#2ECC71" : "#9B59B6",
    color: s === "received" ? "#0A0F1E" : "#fff",
  }),
  // analytics
  analyticsWrap: { background: "#060C18", minHeight: "100vh", color: "#F8F9FC", fontFamily: "system-ui, sans-serif" },
  analyticsHeader: { background: "#0A0F1E", borderBottom: "1px solid #1E2A3A", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 },
  analyticsTitle: { fontSize: 20, fontWeight: 900, color: "#F8F9FC" },
  analyticsSub: { fontSize: 13, color: "#8B95A8", marginTop: 4 },
  exportBtn: { background: "#1A2335", border: "1px solid #2A3547", color: "#F8F9FC", fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 8, cursor: "pointer" },
  resetBtn: { background: "transparent", border: "1px solid #E74C3C", color: "#E74C3C", fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 8, cursor: "pointer" },
  headerBtns: { display: "flex", gap: 8, flexWrap: "wrap" },
  syncTag: { fontSize: 11, color: "#5DADE2", marginTop: 6 },
  statChip: { background: "#0D1929", border: "1px solid #1E2A3A", borderRadius: 12, padding: "14px 16px", flex: "1 1 160px" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, padding: "20px 20px 0" },
  kpiCard: { background: "#0D1929", border: "1px solid #1E2A3A", borderRadius: 12, padding: "14px 16px" },
  kpiLabel: { fontSize: 10, color: "#8B95A8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  kpiValue: { fontSize: 26, fontWeight: 900, color: "#F8F9FC", lineHeight: 1.1, marginBottom: 4 },
  kpiDelta: (pos) => ({ fontSize: 11, fontWeight: 700, color: pos ? "#2ECC71" : "#E74C3C" }),
  chartSection: { padding: "20px" },
  chartTitle: { fontSize: 13, fontWeight: 700, color: "#8B95A8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 },
  barWrap: { display: "flex", flexDirection: "column", gap: 8 },
  barRow: { display: "flex", alignItems: "center", gap: 10 },
  barLabel: { fontSize: 12, color: "#8B95A8", width: 80, flexShrink: 0, textAlign: "right" },
  barTrack: { flex: 1, height: 24, background: "#1A2335", borderRadius: 6, overflow: "hidden", position: "relative" },
  barFill: (w, c) => ({ height: "100%", width: w, background: c, borderRadius: 6, transition: "width 0.8s ease", display: "flex", alignItems: "center", paddingLeft: 8 }),
  barVal: { fontSize: 11, fontWeight: 700, color: "#F8F9FC" },
  feedSection: { padding: "0 20px 24px" },
  feedTitle: { fontSize: 13, fontWeight: 700, color: "#8B95A8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 },
  feedItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1E2A3A" },
  feedLeft: { display: "flex", gap: 10, alignItems: "center" },
  feedDot: (s) => ({ width: 8, height: 8, borderRadius: "50%", background: s === "ready" || s === "delivered" ? "#2ECC71" : s === "preparing" ? "#F5A623" : "#3A4557", flexShrink: 0 }),
  feedText: { fontSize: 12, color: "#F8F9FC" },
  feedSub: { fontSize: 11, color: "#8B95A8", marginTop: 1 },
  feedAmt: { fontSize: 13, fontWeight: 700, color: "#F5A623" },
  toast: { position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: "#111827", border: "1px solid #F5A623", color: "#F8F9FC", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 24, zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", animation: "toastIn 0.25s ease" },
  recapCard: { background: "#0D1929", border: "1px solid #1E2A3A", borderRadius: 12, padding: "16px 18px", lineHeight: 1.6, fontSize: 13, color: "#C9D2E0" },
  copyBtn: { background: "transparent", border: "1px solid #2A3547", color: "#8B95A8", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 16, cursor: "pointer", marginTop: 10 },
};

// ─── Generic Trend Sparkline (revenue, order volume, etc.) ───────────────────
function Sparkline({ buckets, color, emptyText }) {
  const max = Math.max(...buckets, 1);
  const w = 600, h = 90, pad = 6;
  const stepX = (w - pad * 2) / (buckets.length - 1);
  const pts = buckets.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y];
  });
  const lineStr = pts.map(p => p.join(",")).join(" ");
  const areaStr = `${pad},${h - pad} ${lineStr} ${w - pad},${h - pad}`;

  if (buckets.every(v => v === 0)) {
    return <div style={{ fontSize: 13, color: "#3A4557" }}>{emptyText}</div>;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 100, display: "block" }}>
      <polygon points={areaStr} fill={`${color}22`} />
      <polyline points={lineStr} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={color} />)}
    </svg>
  );
}

// ─── Seating Heatmap (stylized lower-bowl arc, color-coded by revenue) ───────
function SeatingHeatmap({ orders }) {
  const sectionRevenue = {};
  const sectionCount = {};
  orders.forEach(o => {
    sectionRevenue[o.section] = (sectionRevenue[o.section] || 0) + o.total;
    sectionCount[o.section] = (sectionCount[o.section] || 0) + 1;
  });
  const maxRev = Math.max(...SECTIONS.map(s => sectionRevenue[s] || 0), 1);

  const cx = 300, cy = 300, rInner = 110, rOuter = 215;
  const startAngle = -80, totalAngle = 160, gap = 2.5;
  const n = SECTIONS.length;
  const wedgeAngle = (totalAngle - gap * (n - 1)) / n;

  const toRad = (deg) => (deg - 90) * Math.PI / 180;
  const polar = (r, angleDeg) => {
    const rad = toRad(angleDeg);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const wedgePath = (a0, a1, rI, rO) => {
    const [x0o, y0o] = polar(rO, a0);
    const [x1o, y1o] = polar(rO, a1);
    const [x1i, y1i] = polar(rI, a1);
    const [x0i, y0i] = polar(rI, a0);
    return `M ${x0o} ${y0o} A ${rO} ${rO} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rI} ${rI} 0 0 0 ${x0i} ${y0i} Z`;
  };
  const heatColor = (t) => {
    const cold = [26, 35, 53], hot = [245, 166, 35];
    const r = Math.round(cold[0] + (hot[0] - cold[0]) * t);
    const g = Math.round(cold[1] + (hot[1] - cold[1]) * t);
    const b = Math.round(cold[2] + (hot[2] - cold[2]) * t);
    return `rgb(${r},${g},${b})`;
  };

  const allEmpty = orders.length === 0;

  return (
    <div>
      <svg viewBox="0 0 600 340" style={{ width: "100%", height: 280, display: "block" }}>
        <ellipse cx={cx} cy={cy + 60} rx={95} ry={36} fill="#0A2010" stroke="#1E2A3A" strokeWidth="1.5" />
        <text x={cx} y={cy + 64} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1" fill="#3A4557" fontFamily="system-ui">FIELD</text>
        {SECTIONS.map((s, i) => {
          const a0 = startAngle + i * (wedgeAngle + gap);
          const a1 = a0 + wedgeAngle;
          const rev = sectionRevenue[s] || 0;
          const t = allEmpty ? 0 : rev / maxRev;
          const [lx, ly] = polar((rInner + rOuter) / 2, (a0 + a1) / 2);
          return (
            <g key={s}>
              <path d={wedgePath(a0, a1, rInner, rOuter)} fill={allEmpty ? "#111827" : heatColor(t)} stroke="#060C18" strokeWidth="2" />
              <text x={lx} y={ly - 6} textAnchor="middle" fontSize="13" fontWeight="800" fill="#F8F9FC" fontFamily="system-ui">{s}</text>
              <text x={lx} y={ly + 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#F8F9FC" fontFamily="system-ui">{rev > 0 ? fmtMoney(rev) : "—"}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 11, color: "#8B95A8" }}>
        <span>Low</span>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "linear-gradient(90deg, #1A2335, #F5A623)" }} />
        <span>High revenue</span>
      </div>
    </div>
  );
}

// ─── Fan View ─────────────────────────────────────────────────────────────────
function FanView({ onOrder, orders, fanIdentity }) {
  const [cat, setCat] = useState("All");
  const [cart, setCart] = useState({});
  const [section] = useState(SECTIONS[2]);
  const [fulfillment, setFulfillment] = useState("pickup");
  const [seatRow, setSeatRow] = useState("");
  const [seatNum, setSeatNum] = useState("");
  const [tipPct, setTipPct] = useState(0.18);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { activeOrderId, setActiveOrderId, myOrderIds, trackOrder } = fanIdentity;
  // The live order — and its status — always comes from the real shared ledger,
  // so it stays correct across tab switches and reflects what staff actually do.
  const confirmedOrder = orders.find(o => o.id === activeOrderId) || null;
  const orderStatus = confirmedOrder?.status || "received";
  const history = myOrderIds.map(id => orders.find(o => o.id === id)).filter(Boolean);

  const cats = ["All", "Food", "Drinks"];
  const filtered = cat === "All" ? MENU : MENU.filter(m => m.cat === cat);
  const cartItems = Object.entries(cart).filter(([_, q]) => q > 0).map(([id, qty]) => ({ ...MENU.find(m => m.id == id), qty }));
  const itemsTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartTotal = itemsTotal + (fulfillment === "delivery" ? DELIVERY_FEE : 0);
  const tipAmount = fulfillment === "delivery" ? Math.round(itemsTotal * tipPct * 100) / 100 : 0;
  const grandTotal = cartTotal + tipAmount;
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const isDelivery = confirmedOrder?.fulfillment === "delivery";
  const claimed = !!confirmedOrder?.runner;

  const setQty = (id, delta) => setCart(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const placeOrder = () => {
    const seatInfo = fulfillment === "delivery" ? `Sec ${section}, Row ${seatRow || "—"}, Seat ${seatNum || "—"}` : null;
    const order = onOrder(cartItems, section, fulfillment, seatInfo, tipAmount);
    trackOrder(order.id);
    setShowCheckout(false);
    setCart({});
  };

  const reorder = (entry) => {
    const newCart = {};
    entry.items.forEach(i => { newCart[i.id] = i.qty; });
    setCart(newCart);
    setFulfillment(entry.fulfillment || "pickup");
    setShowHistory(false);
    setActiveOrderId(null);
  };

  const statusIcon = orderStatus === "delivered" ? "🎉" : orderStatus === "ready" ? (isDelivery ? (claimed ? "🛵" : "⏳") : "✅") : orderStatus === "preparing" ? "👨‍🍳" : "📱";
  const statusTitle = orderStatus === "delivered" ? "Delivered!" : orderStatus === "ready" ? (isDelivery ? (claimed ? "On The Way" : "Awaiting Runner") : "Order Ready!") : orderStatus === "preparing" ? "Being Prepared" : "Order Received";
  const statusSub = confirmedOrder ? (
    orderStatus === "delivered"
      ? `Enjoy! Delivered to ${confirmedOrder.seat}.`
      : orderStatus === "ready"
        ? (isDelivery
            ? (claimed ? `${confirmedOrder.runner} is on the way to ${confirmedOrder.seat}.` : `Your order is ready — we're lining up a runner for ${confirmedOrder.seat}.`)
            : `Head to Express Window ${confirmedOrder.window} — your order is waiting.`)
        : orderStatus === "preparing"
          ? "Your order is being prepared. We'll notify you when ready."
          : "Your order is in the queue. Stay in your seat — we'll text you when ready."
  ) : "";
  const canOrderAgain = (orderStatus === "ready" && !isDelivery) || orderStatus === "delivered";

  // Pop a toast + soft chime whenever the live order's status actually changes
  // (not on every render) so the fan notices without staring at the screen.
  const [toast, setToast] = useState(null);
  const prevStatusRef = useRef(null);
  useEffect(() => {
    if (!confirmedOrder) { prevStatusRef.current = null; return; }
    if (prevStatusRef.current !== null && prevStatusRef.current !== orderStatus) {
      setToast(statusTitle);
      playChime();
      const t = setTimeout(() => setToast(null), 4000);
      prevStatusRef.current = orderStatus;
      return () => clearTimeout(t);
    }
    prevStatusRef.current = orderStatus;
  }, [orderStatus, confirmedOrder]);

  return (
    <div style={S.fanWrap}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} } @keyframes flash { 0%,100%{box-shadow:0 0 0 0 rgba(245,166,35,0)} 50%{box-shadow:0 0 0 3px rgba(245,166,35,0.35)} } @keyframes toastIn { from{opacity:0; transform:translate(-50%,-8px)} to{opacity:1; transform:translate(-50%,0)} } ::-webkit-scrollbar{display:none}`}</style>
      {toast && <div style={S.toast}>🔔 {toast}</div>}

      {confirmedOrder ? (
        <>
          <div style={S.fanHeader}>
            <div style={S.fanHeaderTop}>
              <div style={S.liveTag}><div style={S.liveDot} />{`SECTION ${section}`}</div>
              <button style={S.historyBtn} onClick={() => setShowHistory(true)}>📋 My Orders{history.length > 0 ? ` (${history.length})` : ""}</button>
            </div>
            <div style={S.fanTitle}>In-Venue Order</div>
          </div>
          <div style={S.confirmWrap}>
            <div style={S.bigEmoji}>{statusIcon}</div>
            <div style={S.confirmTitle}>{statusTitle}</div>
            <div style={S.confirmSub}>{statusSub}</div>

            {isDelivery ? (
              <div style={S.runnerCard}>
                <div style={{ fontSize: 11, color: "#8B95A8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Your Runner</div>
                <div style={S.runnerName}>{confirmedOrder.runner ? `🛵 ${confirmedOrder.runner}` : "⏳ Finding a runner..."}</div>
                <div style={S.runnerSeat}>Delivering to {confirmedOrder.seat}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11, color: "#8B95A8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Express Pickup Window</div>
                <div style={S.windowTag}>Window {confirmedOrder.window}</div>
              </div>
            )}

            <div style={S.statusPill(orderStatus)}>
              {orderStatus === "delivered" ? "DELIVERED" : orderStatus === "ready" ? (isDelivery ? (claimed ? "OUT FOR DELIVERY" : "AWAITING RUNNER") : "READY FOR PICKUP") : orderStatus === "preparing" ? "PREPARING NOW" : "ORDER RECEIVED"}
            </div>
            <div style={{ marginTop: 24, fontSize: 13, color: "#8B95A8" }}>Order #{confirmedOrder.id} · {fmtMoney(confirmedOrder.total)}{confirmedOrder.tip > 0 ? ` + ${fmtMoney(confirmedOrder.tip)} tip` : ""}</div>
            {canOrderAgain && (
              <button style={{ ...S.payBtn, marginTop: 24, maxWidth: 280 }} onClick={() => setActiveOrderId(null)}>
                Order Again
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={S.fanHeader}>
            <div style={S.fanHeaderTop}>
              <div style={S.liveTag}><div style={S.liveDot} />LIVE · Q2 14:32</div>
              <button style={S.historyBtn} onClick={() => setShowHistory(true)}>📋 My Orders{history.length > 0 ? ` (${history.length})` : ""}</button>
            </div>
            <div style={S.fanTitle}>Order Food & Drinks</div>
            <div style={S.fanSub}>Section {section} · Express pickup or seat delivery</div>
          </div>

          <div style={S.fulfillRow}>
            <button style={S.fulfillBtn(fulfillment === "pickup")} onClick={() => setFulfillment("pickup")}>🏃 Express Pickup</button>
            <button style={S.fulfillBtn(fulfillment === "delivery")} onClick={() => setFulfillment("delivery")}>🛵 Seat Delivery · +{fmtMoney(DELIVERY_FEE)}</button>
          </div>
          {fulfillment === "delivery" && (
            <div style={S.seatRow}>
              <input style={S.seatInput} placeholder="Row" value={seatRow} onChange={e => setSeatRow(e.target.value)} />
              <input style={S.seatInput} placeholder="Seat #" value={seatNum} onChange={e => setSeatNum(e.target.value)} />
            </div>
          )}

          <div style={S.catRow}>
            {cats.map(c => <button key={c} style={S.catBtn(cat === c)} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div style={S.menuGrid}>
            {filtered.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <div key={item.id} style={S.menuCard(qty > 0)} onClick={() => qty === 0 && setQty(item.id, 1)}>
                  <div style={S.menuEmoji}>{item.emoji}</div>
                  <div style={S.menuInfo}>
                    <div style={S.menuName}>
                      {item.name}
                      {item.popular && <span style={S.popularBadge}>POPULAR</span>}
                    </div>
                    <div style={S.menuDesc}>{item.desc}</div>
                    <div style={S.menuPrice}>{fmtMoney(item.price)}</div>
                  </div>
                  {qty > 0 ? (
                    <div style={S.qtyRow} onClick={e => e.stopPropagation()}>
                      <button style={S.qtyBtn} onClick={() => setQty(item.id, -1)}>−</button>
                      <div style={S.qtyNum}>{qty}</div>
                      <button style={S.qtyBtn} onClick={() => setQty(item.id, 1)}>+</button>
                    </div>
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F5A623", display: "flex", alignItems: "center", justifyContent: "center", color: "#0A0F1E", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>+</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ height: 80 }} />
          <div style={S.cartBar}>
            <button style={S.cartBtn(cartCount > 0)} onClick={() => cartCount > 0 && setShowCheckout(true)}>
              {cartCount > 0 ? `Review Order · ${fmtMoney(grandTotal)} (${cartCount} item${cartCount > 1 ? "s" : ""})` : "Add items to order"}
            </button>
          </div>

          {showCheckout && (
            <div style={S.overlay} onClick={() => setShowCheckout(false)}>
              <div style={S.sheet} onClick={e => e.stopPropagation()}>
                <div style={S.sheetTitle}>Your Order</div>
                {cartItems.map(i => (
                  <div key={i.id} style={S.lineItem}>
                    <span>{i.qty}× {i.name}</span>
                    <span style={{ color: "#F8F9FC" }}>{fmtMoney(i.price * i.qty)}</span>
                  </div>
                ))}
                {fulfillment === "delivery" && (
                  <div style={S.lineItem}>
                    <span>🛵 Seat delivery fee</span>
                    <span style={{ color: "#F8F9FC" }}>{fmtMoney(DELIVERY_FEE)}</span>
                  </div>
                )}
                {fulfillment === "delivery" && (
                  <>
                    <div style={S.tipLabel}>Tip your runner</div>
                    <div style={S.tipRow}>
                      {[{ label: "No Tip", v: 0 }, { label: "15%", v: 0.15 }, { label: "18%", v: 0.18 }, { label: "20%", v: 0.20 }].map(t => (
                        <button key={t.label} style={S.tipBtn(tipPct === t.v)} onClick={() => setTipPct(t.v)}>{t.label}</button>
                      ))}
                    </div>
                    {tipAmount > 0 && (
                      <div style={{ ...S.lineItem, marginTop: 4 }}>
                        <span>Tip ({Math.round(tipPct * 100)}%)</span>
                        <span style={{ color: "#F8F9FC" }}>{fmtMoney(tipAmount)}</span>
                      </div>
                    )}
                  </>
                )}
                <div style={S.lineTotal}>
                  <span>Total</span>
                  <span style={{ color: "#F5A623" }}>{fmtMoney(grandTotal)}</span>
                </div>
                <div style={{ fontSize: 12, color: "#8B95A8", marginTop: 8 }}>
                  {fulfillment === "delivery"
                    ? <>🛵 Delivering to <strong style={{ color: "#F8F9FC" }}>Sec {section}, Row {seatRow || "—"}, Seat {seatNum || "—"}</strong></>
                    : <>📍 Pickup at <strong style={{ color: "#F8F9FC" }}>Express Window</strong> · We'll text you when ready</>}
                </div>
                <button style={S.payBtn} onClick={placeOrder}>
                  Pay with Apple Pay / Card →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showHistory && (
        <div style={S.overlay} onClick={() => setShowHistory(false)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.sheetTitle}>My Orders</div>
            {history.length === 0 && <div style={S.historyEmpty}>No orders yet tonight.</div>}
            {history.map(h => (
              <div key={h.id} style={S.historyRow}>
                <div style={S.historyHead}>
                  <span>#{h.id} · {h.fulfillment === "delivery" ? "🛵 Delivery" : "🏃 Pickup"}</span>
                  <span style={{ color: "#F5A623" }}>{fmtMoney(h.total)}</span>
                </div>
                <div style={S.historyItems}>{h.items.map(i => `${i.qty}× ${i.name}`).join(", ")} · {fmtTime(h.ts)} · {h.status}{h.tip > 0 ? ` · ${fmtMoney(h.tip)} tip` : ""}</div>
                <button style={S.reorderBtn} onClick={() => reorder(h)}>↻ Reorder</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Staff View ───────────────────────────────────────────────────────────────
function StaffView({ orders, updateStatus }) {
  const [filter, setFilter] = useState("all");
  const allActive = orders.filter(o => o.fulfillment === "delivery" ? o.status !== "delivered" : o.status !== "ready");
  const active = (filter === "all" ? allActive : allActive.filter(o => o.fulfillment === filter)).slice(0, 24);
  const newCount = orders.filter(o => o.status === "received").length;
  const prevNewCount = useRef(0);

  useEffect(() => {
    if (newCount > prevNewCount.current) playChime();
    prevNewCount.current = newCount;
  }, [newCount]);

  return (
    <div style={S.staffWrap}>
      <div style={S.staffHeader}>
        <div>
          <div style={S.staffTitle}>Staff Fulfillment Board</div>
          <div style={S.staffSub}>Express Windows A · B · C + Seat Runners — {fmtTime(Date.now())}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {newCount > 0 && (
            <div style={{ background: "#F5A623", color: "#0A0F1E", fontSize: 13, fontWeight: 800, padding: "6px 12px", borderRadius: 8 }}>
              {newCount} NEW
            </div>
          )}
          <div style={{ background: "#1A2335", color: "#8B95A8", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8 }}>
            {orders.length} today
          </div>
        </div>
      </div>

      <div style={S.filterRow}>
        {[
          { id: "all", label: "All" },
          { id: "pickup", label: "🏃 Pickup" },
          { id: "delivery", label: "🛵 Delivery" },
        ].map(f => (
          <button key={f.id} style={S.filterBtn(filter === f.id)} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      {active.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#3A4557" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>All caught up</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>New orders will appear here</div>
        </div>
      ) : (
        <div style={S.orderGrid}>
          {active.map(order => {
            const action = nextAction(order);
            const isDelivery = order.fulfillment === "delivery";
            return (
              <div key={order.id} style={S.orderCard(order.status)}>
                <div style={S.orderCardHead}>
                  <div>
                    <div style={S.orderId}>#{order.id}</div>
                    <div style={S.orderMeta}>Section {order.section} · {fmtTime(order.ts)}</div>
                  </div>
                  {isDelivery ? <div style={S.deliveryBadge}>🛵 DELIVERY</div> : <div style={S.windowBadge(order.window)}>WIN {order.window}</div>}
                </div>
                {isDelivery && (
                  <div style={S.deliveryMeta}>{order.runner ? `${order.runner} → ${order.seat}${order.status === "ready" ? " · en route" : ""}` : `${order.seat} · awaiting runner`}</div>
                )}
                <div style={S.orderItems}>
                  {order.items.map((i, idx) => <div key={idx}>{i.qty}× {i.name}</div>)}
                </div>
                <div style={S.orderTotal}>{fmtMoney(order.total)}</div>
                {action && (
                  <button style={S.actionBtn(order.status)} onClick={() => updateStatus(order.id, action.next)}>
                    {action.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Runner View ──────────────────────────────────────────────────────────────
function RunnerView({ orders, claimOrder, updateStatus, runnerIdentity }) {
  const { me, setMe } = runnerIdentity;

  const pool = orders.filter(o => o.fulfillment === "delivery" && o.status === "ready" && !o.runner);
  const mine = orders.filter(o => o.runner === me && o.status === "ready");
  const completed = me ? orders.filter(o => o.runner === me && o.status === "delivered") : [];
  const myTips = completed.reduce((s, o) => s + (o.tip || 0), 0);

  if (!me) {
    return (
      <div style={S.staffWrap}>
        <div style={S.staffHeader}>
          <div>
            <div style={S.staffTitle}>Runner Dispatch</div>
            <div style={S.staffSub}>Pick your name to start claiming seat deliveries</div>
          </div>
        </div>
        <div style={{ padding: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {RUNNERS.map(r => (
            <button key={r} style={{ ...S.fulfillBtn(false), flex: "0 1 140px", minWidth: 120 }} onClick={() => setMe(r)}>{r}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={S.staffWrap}>
      <div style={S.staffHeader}>
        <div>
          <div style={S.staffTitle}>🛵 {me}'s Dispatch</div>
          <div style={S.staffSub}>{completed.length} delivered tonight · {fmtMoney(myTips)} in tips</div>
        </div>
        <button style={S.historyBtn} onClick={() => setMe(null)}>Switch Runner</button>
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Available Deliveries ({pool.length})</div>
        {pool.length === 0 ? (
          <div style={{ fontSize: 13, color: "#3A4557" }}>No unclaimed deliveries right now</div>
        ) : (
          <div style={S.orderGrid}>
            {pool.map(order => (
              <div key={order.id} style={S.orderCard("ready")}>
                <div style={S.orderCardHead}>
                  <div>
                    <div style={S.orderId}>#{order.id}</div>
                    <div style={S.orderMeta}>Section {order.section} · {fmtTime(order.ts)}</div>
                  </div>
                  <div style={S.deliveryBadge}>🛵 UNCLAIMED</div>
                </div>
                <div style={S.deliveryMeta}>{order.seat}</div>
                <div style={S.orderItems}>
                  {order.items.map((i, idx) => <div key={idx}>{i.qty}× {i.name}</div>)}
                </div>
                <div style={S.orderTotal}>{fmtMoney(order.total)}{order.tip > 0 ? ` + ${fmtMoney(order.tip)} tip` : ""}</div>
                <button style={S.actionBtn("received")} onClick={() => claimOrder(order.id, me)}>🛵 CLAIM DELIVERY</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>My Active Deliveries ({mine.length})</div>
        {mine.length === 0 ? (
          <div style={{ fontSize: 13, color: "#3A4557" }}>Claim a delivery above to get started</div>
        ) : (
          <div style={S.orderGrid}>
            {mine.map(order => (
              <div key={order.id} style={S.orderCard("preparing")}>
                <div style={S.orderCardHead}>
                  <div>
                    <div style={S.orderId}>#{order.id}</div>
                    <div style={S.orderMeta}>Section {order.section} · {fmtTime(order.ts)}</div>
                  </div>
                  <div style={S.deliveryBadge}>🛵 EN ROUTE</div>
                </div>
                <div style={S.deliveryMeta}>{order.seat}</div>
                <div style={S.orderItems}>
                  {order.items.map((i, idx) => <div key={idx}>{i.qty}× {i.name}</div>)}
                </div>
                <div style={S.orderTotal}>{fmtMoney(order.total)}{order.tip > 0 ? ` + ${fmtMoney(order.tip)} tip` : ""}</div>
                <button style={S.actionBtn("preparing")} onClick={() => updateStatus(order.id, "delivered")}>✓ MARK DELIVERED</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={S.feedSection}>
        <div style={S.feedTitle}>Delivered Tonight</div>
        {completed.slice(0, 12).map(order => (
          <div key={order.id} style={S.feedItem}>
            <div style={S.feedLeft}>
              <div style={S.feedDot("delivered")} />
              <div>
                <div style={S.feedText}>#{order.id} · {order.seat}</div>
                <div style={S.feedSub}>{order.items.map(i => `${i.qty}× ${i.name}`).join(", ")}</div>
              </div>
            </div>
            <div style={S.feedAmt}>{fmtMoney(order.total)}{order.tip > 0 ? ` +${fmtMoney(order.tip)}` : ""}</div>
          </div>
        ))}
        {completed.length === 0 && <div style={{ fontSize: 13, color: "#3A4557" }}>No deliveries completed yet</div>}
      </div>
    </div>
  );
}

// ─── Analytics View ───────────────────────────────────────────────────────────
function AnalyticsView({ orders, stats, onReset }) {
  const itemCounts = {};
  orders.forEach(o => o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
  const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = topItems[0]?.[1] || 1;

  const sectionRevenue = {};
  orders.forEach(o => { sectionRevenue[o.section] = (sectionRevenue[o.section] || 0) + o.total; });
  const topSections = Object.entries(sectionRevenue).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxRev = topSections[0]?.[1] || 1;

  const adoptionRate = stats.attendance > 0 ? ((stats.scans / stats.attendance) * 100).toFixed(1) : 0;
  const perCapLift = stats.perCap > 0 ? (((stats.perCap - stats.baselinePerCap) / stats.baselinePerCap) * 100).toFixed(1) : 0;
  const isPositive = perCapLift > 0;

  const deliveryOrders = orders.filter(o => o.fulfillment === "delivery");
  const deliveryCount = deliveryOrders.length;
  const deliveryPct = orders.length ? Math.round((deliveryCount / orders.length) * 100) : 0;

  // Operational timing — derived from each order's status-change history.
  const prepTimes = orders.map(o => getDuration(o.statusHistory, "received", "ready")).filter(v => v != null);
  const avgPrepTime = prepTimes.length ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length : null;
  const deliveryTimes = deliveryOrders.map(o => getDuration(o.statusHistory, "ready", "delivered")).filter(v => v != null);
  const avgDeliveryTime = deliveryTimes.length ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length : null;
  const dispatchTimes = deliveryOrders.map(o => getDuration(o.statusHistory, "ready", "claimed")).filter(v => v != null);
  const avgDispatchTime = dispatchTimes.length ? dispatchTimes.reduce((a, b) => a + b, 0) / dispatchTimes.length : null;
  const unclaimedCount = deliveryOrders.filter(o => o.status === "ready" && !o.runner).length;
  const totalTips = orders.reduce((s, o) => s + (o.tip || 0), 0);

  // Trend buckets — last hour, 5-minute resolution.
  const bucketCount = 12, bucketSizeMs = 5 * 60 * 1000;
  const revenueBuckets = bucketize(orders, bucketCount, bucketSizeMs, o => o.total);
  const orderBuckets = bucketize(orders, bucketCount, bucketSizeMs, () => 1);
  const peakIdx = orderBuckets.indexOf(Math.max(...orderBuckets));
  const peakLabel = orders.length ? bucketLabel(peakIdx, bucketCount, bucketSizeMs) : "—";
  const peakCount = orders.length ? orderBuckets[peakIdx] : 0;

  // Window load balancing — pickup orders only.
  const windowAgg = {};
  orders.filter(o => o.fulfillment !== "delivery").forEach(o => {
    if (!windowAgg[o.window]) windowAgg[o.window] = { count: 0, totalPrep: 0, prepN: 0 };
    windowAgg[o.window].count++;
    const d = getDuration(o.statusHistory, "received", "ready");
    if (d != null) { windowAgg[o.window].totalPrep += d; windowAgg[o.window].prepN++; }
  });
  const windowRows = WINDOWS.map(w => ({
    window: w,
    count: windowAgg[w]?.count || 0,
    avgPrep: windowAgg[w]?.prepN ? windowAgg[w].totalPrep / windowAgg[w].prepN : null,
  }));
  const maxWindowCount = Math.max(...windowRows.map(r => r.count), 1);

  // Runner performance — delivery orders only.
  const runnerAgg = {};
  deliveryOrders.forEach(o => {
    if (!o.runner) return;
    if (!runnerAgg[o.runner]) runnerAgg[o.runner] = { total: 0, completed: 0, totalTime: 0, timeN: 0, active: 0, tips: 0 };
    runnerAgg[o.runner].total++;
    if (o.status === "delivered") {
      runnerAgg[o.runner].completed++;
      runnerAgg[o.runner].tips += (o.tip || 0);
      const d = getDuration(o.statusHistory, "ready", "delivered");
      if (d != null) { runnerAgg[o.runner].totalTime += d; runnerAgg[o.runner].timeN++; }
    } else if (o.status === "ready") {
      runnerAgg[o.runner].active++;
    }
  });
  const runnerRows = RUNNERS.map(r => ({
    name: r,
    total: runnerAgg[r]?.total || 0,
    completed: runnerAgg[r]?.completed || 0,
    active: runnerAgg[r]?.active || 0,
    tips: runnerAgg[r]?.tips || 0,
    avgTime: runnerAgg[r]?.timeN ? runnerAgg[r].totalTime / runnerAgg[r].timeN : null,
  })).sort((a, b) => b.total - a.total);
  const maxRunnerTotal = Math.max(...runnerRows.map(r => r.total), 1);

  // Basket composition.
  const totalItemQty = orders.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + i.qty, 0), 0);
  const avgItemsPerOrder = orders.length ? (totalItemQty / orders.length).toFixed(1) : "0";
  const hasFood = o => o.items.some(i => i.cat === "Food");
  const hasDrink = o => o.items.some(i => i.cat === "Drinks");
  const comboOrders = orders.filter(o => hasFood(o) && hasDrink(o)).length;
  const foodOnlyOrders = orders.filter(o => hasFood(o) && !hasDrink(o)).length;
  const drinksOnlyOrders = orders.filter(o => hasDrink(o) && !hasFood(o)).length;
  const comboPct = orders.length ? Math.round((comboOrders / orders.length) * 100) : 0;
  const foodOnlyPct = orders.length ? Math.round((foodOnlyOrders / orders.length) * 100) : 0;
  const drinksOnlyPct = orders.length ? Math.round((drinksOnlyOrders / orders.length) * 100) : 0;

  const kpis = [
    { label: "Total Revenue", value: fmtMoney(stats.totalRevenue), delta: `+${perCapLift}% vs baseline`, pos: isPositive },
    { label: "Orders", value: stats.totalOrders, delta: "this event", pos: true },
    { label: "Avg Order Value", value: stats.avgOrderValue > 0 ? fmtMoney(stats.avgOrderValue) : "$0.00", delta: `vs $${stats.baselinePerCap.toFixed(2)} baseline`, pos: stats.avgOrderValue > stats.baselinePerCap },
    { label: "Per-Cap Spend", value: stats.perCap > 0 ? fmtMoney(stats.perCap) : "$0.00", delta: `${isPositive ? "+" : ""}${perCapLift}% vs baseline`, pos: isPositive },
    { label: "QR Scan Rate", value: `${adoptionRate}%`, delta: "of attendance", pos: parseFloat(adoptionRate) > 10 },
    { label: "Delivery Mix", value: `${deliveryPct}%`, delta: `${deliveryCount} of ${orders.length} orders`, pos: true },
    { label: "Avg Prep Time", value: fmtSecs(avgPrepTime), delta: "received → ready", pos: avgPrepTime == null || avgPrepTime < 600 },
    { label: "Avg Dispatch Time", value: fmtSecs(avgDispatchTime), delta: "ready → claimed", pos: avgDispatchTime == null || avgDispatchTime < 180 },
    { label: "Avg Delivery Time", value: fmtSecs(avgDeliveryTime), delta: "claimed → seat", pos: avgDeliveryTime == null || avgDeliveryTime < 600 },
    { label: "Awaiting Runner", value: unclaimedCount, delta: "unclaimed right now", pos: unclaimedCount === 0 },
    { label: "Tips Collected", value: fmtMoney(totalTips), delta: "to runners tonight", pos: true },
    { label: "Peak Order Time", value: peakLabel, delta: `${peakCount} orders in 5 min`, pos: true },
    { label: "Attendance", value: stats.attendance.toLocaleString(), delta: "tonight", pos: true },
  ];

  const handleReset = () => {
    if (window.confirm("Reset the shared venue ledger? This clears tonight's orders and stats for everyone viewing this dashboard.")) {
      onReset();
    }
  };

  // Tonight's Recap — a deterministic executive-summary narrative built from the
  // same numbers already on this dashboard, so it never says anything the
  // charts above don't already support.
  const topRunner = runnerRows.find(r => r.completed > 0) || null;
  const recapText = (() => {
    if (orders.length === 0) return "No orders yet tonight — the recap will write itself as the event gets underway.";
    const lines = [];
    lines.push(`Tonight's event has generated ${fmtMoney(stats.totalRevenue)} in concession revenue across ${stats.totalOrders} orders, a per-cap spend of ${fmtMoney(stats.perCap)} (${isPositive ? "+" : ""}${perCapLift}% vs. the ${fmtMoney(stats.baselinePerCap)} season baseline).`);
    lines.push(`${deliveryPct}% of orders chose seat delivery over express pickup, with an average kitchen prep time of ${fmtSecs(avgPrepTime)}${avgDeliveryTime != null ? ` and a ${fmtSecs(avgDeliveryTime)} runner delivery time once claimed` : ""}.`);
    if (topItems[0]) lines.push(`${topItems[0][0]} is the top seller, and Section ${topSections[0]?.[0] ?? "—"} leads all sections in concession revenue.`);
    if (topRunner) lines.push(`${topRunner.name} leads the runner team with ${topRunner.completed} completed deliveries${topRunner.tips > 0 ? ` and ${fmtMoney(topRunner.tips)} in tips` : ""}.`);
    if (unclaimedCount > 0) lines.push(`${unclaimedCount} delivery order${unclaimedCount > 1 ? "s" : ""} ${unclaimedCount > 1 ? "are" : "is"} currently awaiting a runner.`);
    lines.push(`Order volume peaked around ${peakLabel} with ${peakCount} orders in a 5-minute window.`);
    return lines.join(" ");
  })();
  const [copied, setCopied] = useState(false);
  const copyRecap = () => {
    try {
      navigator.clipboard.writeText(recapText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* clipboard unavailable in this context */ }
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
          <button style={S.exportBtn} onClick={() => downloadRecapPDF({ recapText, kpis, topItems, topSections, runnerRows })}>📄 Download PDF Report</button>
          <button style={S.exportBtn} onClick={() => exportOrdersCSV(orders)}>⬇ Export CSV</button>
          <button style={S.resetBtn} onClick={handleReset}>↺ Reset Demo Data</button>
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
            <button style={S.copyBtn} onClick={copyRecap}>{copied ? "✓ Copied" : "📋 Copy Recap"}</button>
          </div>
        </div>
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Revenue — Last Hour</div>
        <Sparkline buckets={revenueBuckets} color="#F5A623" emptyText="Revenue trend will appear as orders come in" />
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Order Volume — Last Hour</div>
        <Sparkline buckets={orderBuckets} color="#5DADE2" emptyText="Order volume will appear as orders come in" />
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Window Load Balancing</div>
        <div style={S.barWrap}>
          {windowRows.map((w, i) => (
            <div key={w.window} style={S.barRow}>
              <div style={S.barLabel}>Window {w.window}</div>
              <div style={S.barTrack}>
                <div style={S.barFill(`${(w.count / maxWindowCount) * 100}%`, i === 0 ? "#7B9EF5" : "#1A2A4A")}>
                  <span style={S.barVal}>{w.count} orders{w.avgPrep != null ? ` · ${fmtSecs(w.avgPrep)} avg` : ""}</span>
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
                <div style={S.barFill(`${(r.total / maxRunnerTotal) * 100}%`, i === 0 ? "#C77DFF" : "#3A2A5A")}>
                  <span style={S.barVal}>{r.completed}/{r.total} delivered{r.avgTime != null ? ` · ${fmtSecs(r.avgTime)} avg` : ""}{r.tips > 0 ? ` · ${fmtMoney(r.tips)} tips` : ""}{r.active > 0 ? ` · ${r.active} out now` : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {deliveryOrders.length === 0 && <div style={{ fontSize: 13, color: "#3A4557", marginTop: 8 }}>Runner stats will appear once delivery orders come in</div>}
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Basket Composition</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                <div style={S.barFill(`${(count / maxCount) * 100}%`, i === 0 ? "#F5A623" : "#2A3D5A")}>
                  <span style={S.barVal}>{count}</span>
                </div>
              </div>
            </div>
          ))}
          {topItems.length === 0 && <div style={{ fontSize: 13, color: "#3A4557" }}>Orders will appear as fans buy</div>}
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
                <div style={S.barFill(`${(rev / maxRev) * 100}%`, i === 0 ? "#2ECC71" : "#1A3A2A")}>
                  <span style={S.barVal}>{fmtMoney(rev)}</span>
                </div>
              </div>
            </div>
          ))}
          {topSections.length === 0 && <div style={{ fontSize: 13, color: "#3A4557" }}>Section data will appear here</div>}
        </div>
      </div>

      <div style={S.feedSection}>
        <div style={S.feedTitle}>Live Order Feed</div>
        {orders.slice(0, 12).map(order => (
          <div key={order.id} style={S.feedItem}>
            <div style={S.feedLeft}>
              <div style={S.feedDot(order.status)} />
              <div>
                <div style={S.feedText}>#{order.id} · Sec {order.section} · {order.fulfillment === "delivery" ? `🛵 ${order.runner}` : `Win ${order.window}`}</div>
                <div style={S.feedSub}>{order.items.map(i => `${i.qty}× ${i.name}`).join(", ")}</div>
              </div>
            </div>
            <div style={S.feedAmt}>{fmtMoney(order.total)}</div>
          </div>
        ))}
        {orders.length === 0 && <div style={{ fontSize: 13, color: "#3A4557" }}>No orders yet tonight</div>}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("fan");
  const { orders, eventStats, addOrder, updateStatus, claimOrder, resetData } = useVenueState();
  const fanIdentity = useFanIdentity();
  const runnerIdentity = useRunnerIdentity();
  const newOrders = orders.filter(o => o.status === "received").length;
  const unclaimedCount = orders.filter(o => o.fulfillment === "delivery" && o.status === "ready" && !o.runner).length;

  useEffect(() => {
    document.title = "Venue One — Riverside Arena";
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#060C18", minHeight: "100vh" }}>
      <div style={S.nav}>
        <div style={S.brandBlock}>
          <span style={S.brandMark}>VENUE</span><span style={S.brandAccent}>ONE</span>
        </div>
        {[
          { id: "fan", label: "📱 Fan Order" },
          { id: "staff", label: `🎛 Staff${newOrders > 0 ? ` (${newOrders})` : ""}` },
          { id: "runners", label: `🛵 Runners${unclaimedCount > 0 ? ` (${unclaimedCount})` : ""}` },
          { id: "analytics", label: "📊 GM Analytics" },
        ].map(v => (
          <button key={v.id} style={S.navBtn(view === v.id)} onClick={() => setView(v.id)}>{v.label}</button>
        ))}
      </div>
      {view === "fan" && <FanView onOrder={addOrder} orders={orders} fanIdentity={fanIdentity} />}
      {view === "staff" && <StaffView orders={orders} updateStatus={updateStatus} />}
      {view === "runners" && <RunnerView orders={orders} claimOrder={claimOrder} updateStatus={updateStatus} runnerIdentity={runnerIdentity} />}
      {view === "analytics" && <AnalyticsView orders={orders} stats={eventStats} onReset={resetData} />}
    </div>
  );
}
