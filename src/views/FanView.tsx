import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import FoodHero from '../components/FoodHero';
import FoodImage from '../components/FoodImage';
import MenuItemCard from '../components/MenuItemCard';
import MenuItemDetailPage from '../components/MenuItemDetailPage';
import MotionSheet from '../components/MotionSheet';
import OrderFoodStrip from '../components/OrderFoodStrip';
import { MENU, SECTIONS, DELIVERY_FEE } from '../data/constants';
import { S } from '../styles/venueStyles';
import type { CartItem, FanIdentity, Fulfillment, ModSelection, Order } from '../types/venue';
import {
  buildCartLineKey,
  cartItemsFromLines,
  defaultModsForItem,
  formatModsSummary,
  formatOrderLine,
} from '../utils/cartMods';
import { getRelatedMenuItems } from '../utils/menuRelated';
import { fmtMoney, fmtTime } from '../utils/format';
import { playChime } from '../utils/order';

type CartLines = Record<string, { qty: number; mods: ModSelection[] }>;

interface FanViewProps {
  onOrder: (
    items: CartItem[],
    section: string,
    fulfillment: Fulfillment,
    seatInfo: string | null,
    tip: number,
  ) => Order;
  orders: Order[];
  fanIdentity: FanIdentity;
}

type CategoryFilter = 'All' | 'Food' | 'Drinks';

export default function FanView({ onOrder, orders, fanIdentity }: FanViewProps) {
  const [cat, setCat] = useState<CategoryFilter>('All');
  const [cartLines, setCartLines] = useState<CartLines>({});
  const [pendingMods, setPendingMods] = useState<Record<number, ModSelection[]>>({});
  const [section] = useState(SECTIONS[2]);
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');
  const [seatRow, setSeatRow] = useState('');
  const [seatNum, setSeatNum] = useState('');
  const [tipPct, setTipPct] = useState(0.18);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [detailItemId, setDetailItemId] = useState<number | null>(null);

  const { activeOrderId, setActiveOrderId, myOrderIds, trackOrder } = fanIdentity;
  const confirmedOrder = orders.find((o) => o.id === activeOrderId) || null;
  const orderStatus = confirmedOrder?.status || 'received';
  const history = myOrderIds
    .map((id) => orders.find((o) => o.id === id))
    .filter((o): o is Order => o != null);

  const cats: CategoryFilter[] = ['All', 'Food', 'Drinks'];
  const filtered = cat === 'All' ? MENU : MENU.filter((m) => m.cat === cat);
  const cartItems: CartItem[] = cartItemsFromLines(cartLines, MENU);

  const getMods = (itemId: number) => pendingMods[itemId] ?? defaultModsForItem(itemId);

  const getQty = (itemId: number) => {
    const key = buildCartLineKey(itemId, getMods(itemId));
    return cartLines[key]?.qty ?? 0;
  };

  const setMods = (itemId: number, mods: ModSelection[]) => {
    setPendingMods((prev) => ({ ...prev, [itemId]: mods }));
  };
  const itemsTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartTotal = itemsTotal + (fulfillment === 'delivery' ? DELIVERY_FEE : 0);
  const tipAmount = fulfillment === 'delivery' ? Math.round(itemsTotal * tipPct * 100) / 100 : 0;
  const grandTotal = cartTotal + tipAmount;
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const detailItem = detailItemId ? MENU.find((m) => m.id === detailItemId) ?? null : null;
  const isDelivery = confirmedOrder?.fulfillment === 'delivery';
  const claimed = !!confirmedOrder?.runner;

  const setQty = (id: number, delta: number) => {
    const mods = getMods(id);
    const key = buildCartLineKey(id, mods);
    setCartLines((prev) => {
      const current = prev[key]?.qty ?? 0;
      const nextQty = Math.max(0, current + delta);
      if (nextQty === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { qty: nextQty, mods } };
    });
  };

  const placeOrder = () => {
    const seatInfo =
      fulfillment === 'delivery'
        ? `Sec ${section}, Row ${seatRow || '—'}, Seat ${seatNum || '—'}`
        : null;
    const order = onOrder(cartItems, section, fulfillment, seatInfo, tipAmount);
    trackOrder(order.id);
    setShowCheckout(false);
    setCartLines({});
    setPendingMods({});
  };

  const reorder = (entry: Order) => {
    const nextLines: CartLines = {};
    const nextMods: Record<number, ModSelection[]> = {};
    entry.items.forEach((i) => {
      const mods = i.mods ?? defaultModsForItem(i.id);
      const key = i.lineKey ?? buildCartLineKey(i.id, mods);
      nextLines[key] = { qty: i.qty, mods };
      nextMods[i.id] = mods;
    });
    setCartLines(nextLines);
    setPendingMods(nextMods);
    setFulfillment(entry.fulfillment || 'pickup');
    setShowHistory(false);
    setActiveOrderId(null);
  };

  const statusIcon =
    orderStatus === 'delivered'
      ? '🎉'
      : orderStatus === 'ready'
        ? isDelivery
          ? claimed
            ? '🛵'
            : '⏳'
          : '✅'
        : orderStatus === 'preparing'
          ? '👨‍🍳'
          : '📱';
  const statusTitle =
    orderStatus === 'delivered'
      ? 'Delivered!'
      : orderStatus === 'ready'
        ? isDelivery
          ? claimed
            ? 'On The Way'
            : 'Awaiting Runner'
          : 'Order Ready!'
        : orderStatus === 'preparing'
          ? 'Being Prepared'
          : 'Order Received';
  const statusSub = confirmedOrder
    ? orderStatus === 'delivered'
      ? `Enjoy! Delivered to ${confirmedOrder.seat}.`
      : orderStatus === 'ready'
        ? isDelivery
          ? claimed
            ? `${confirmedOrder.runner} is on the way to ${confirmedOrder.seat}.`
            : `Your order is ready — we're lining up a runner for ${confirmedOrder.seat}.`
          : `Head to Express Window ${confirmedOrder.window} — your order is waiting.`
        : orderStatus === 'preparing'
          ? "Your order is being prepared. We'll notify you when ready."
          : "Your order is in the queue. Stay in your seat — we'll text you when ready."
    : '';
  const canOrderAgain = (orderStatus === 'ready' && !isDelivery) || orderStatus === 'delivered';

  const [toast, setToast] = useState<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  useEffect(() => {
    if (!confirmedOrder) {
      prevStatusRef.current = null;
      return;
    }
    if (prevStatusRef.current !== null && prevStatusRef.current !== orderStatus) {
      setToast(statusTitle);
      playChime();
      const t = setTimeout(() => setToast(null), 4000);
      prevStatusRef.current = orderStatus;
      return () => clearTimeout(t);
    }
    prevStatusRef.current = orderStatus;
    return undefined;
  }, [orderStatus, confirmedOrder, statusTitle]);

  return (
    <div style={S.fanWrap}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} } @keyframes flash { 0%,100%{box-shadow:0 0 0 0 rgba(245,166,35,0)} 50%{box-shadow:0 0 0 3px rgba(245,166,35,0.35)} } @keyframes toastIn { from{opacity:0; transform:translate(-50%,-8px)} to{opacity:1; transform:translate(-50%,0)} } ::-webkit-scrollbar{display:none}`}</style>
      <AnimatePresence>
        {toast && (
          <motion.div
            style={S.toast}
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            🔔 {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {confirmedOrder ? (
        <>
          <div style={S.fanHeader}>
            <div style={S.fanHeaderTop}>
              <div style={S.liveTag}>
                <div style={S.liveDot} />
                {`SECTION ${section}`}
              </div>
              <button style={S.historyBtn} onClick={() => setShowHistory(true)}>
                📋 My Orders{history.length > 0 ? ` (${history.length})` : ''}
              </button>
            </div>
            <div style={S.fanTitle}>In-Venue Order</div>
          </div>
          <motion.div
            style={S.confirmWrap}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <OrderFoodStrip items={confirmedOrder.items} size="lg" />
            <motion.div
              style={{ ...S.bigEmoji, fontSize: 40, marginBottom: 8 }}
              key={statusIcon}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            >
              {statusIcon}
            </motion.div>
            <motion.div
              style={S.confirmTitle}
              key={statusTitle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {statusTitle}
            </motion.div>
            <div style={S.confirmSub}>{statusSub}</div>

            {isDelivery ? (
              <div style={S.runnerCard}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#8B95A8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 6,
                  }}
                >
                  Your Runner
                </div>
                <div style={S.runnerName}>
                  {confirmedOrder.runner ? `🛵 ${confirmedOrder.runner}` : '⏳ Finding a runner...'}
                </div>
                <div style={S.runnerSeat}>Delivering to {confirmedOrder.seat}</div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#8B95A8',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Express Pickup Window
                </div>
                <div style={S.windowTag}>Window {confirmedOrder.window}</div>
              </div>
            )}

            <div style={S.statusPill(orderStatus)}>
              {orderStatus === 'delivered'
                ? 'DELIVERED'
                : orderStatus === 'ready'
                  ? isDelivery
                    ? claimed
                      ? 'OUT FOR DELIVERY'
                      : 'AWAITING RUNNER'
                    : 'READY FOR PICKUP'
                  : orderStatus === 'preparing'
                    ? 'PREPARING NOW'
                    : 'ORDER RECEIVED'}
            </div>
            <div style={{ marginTop: 24, fontSize: 13, color: '#8B95A8' }}>
              Order #{confirmedOrder.id} · {fmtMoney(confirmedOrder.total)}
              {confirmedOrder.tip > 0 ? ` + ${fmtMoney(confirmedOrder.tip)} tip` : ''}
            </div>
            <div className="mt-6 flex w-full max-w-[280px] flex-col gap-3">
              {canOrderAgain && (
                <motion.button
                  style={S.payBtn}
                  onClick={() => setActiveOrderId(null)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="glow-accent"
                >
                  Order Again
                </motion.button>
              )}
              <motion.button
                type="button"
                style={{
                  ...S.historyBtn,
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 13,
                  borderRadius: 10,
                }}
                onClick={() => setActiveOrderId(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back to Menu
              </motion.button>
            </div>
          </motion.div>
        </>
      ) : (
        <>
          <div style={S.fanHeader}>
            <div style={S.fanHeaderTop}>
              <div style={S.liveTag}>
                <div style={S.liveDot} />
                LIVE · Q2 14:32
              </div>
              <button style={S.historyBtn} onClick={() => setShowHistory(true)}>
                📋 My Orders{history.length > 0 ? ` (${history.length})` : ''}
              </button>
            </div>
            <div className="hunger-tagline text-[22px] font-extrabold leading-tight">
              Order Food & Drinks
            </div>
            <div style={S.fanSub}>Section {section} · Express pickup or seat delivery</div>
          </div>

          <FoodHero />

          <div style={S.fulfillRow}>
            <button
              style={S.fulfillBtn(fulfillment === 'pickup')}
              onClick={() => setFulfillment('pickup')}
            >
              🏃 Express Pickup
            </button>
            <button
              style={S.fulfillBtn(fulfillment === 'delivery')}
              onClick={() => setFulfillment('delivery')}
            >
              🛵 Seat Delivery · +{fmtMoney(DELIVERY_FEE)}
            </button>
          </div>
          {fulfillment === 'delivery' && (
            <div style={S.seatRow}>
              <input
                style={S.seatInput}
                placeholder="Row"
                value={seatRow}
                onChange={(e) => setSeatRow(e.target.value)}
              />
              <input
                style={S.seatInput}
                placeholder="Seat #"
                value={seatNum}
                onChange={(e) => setSeatNum(e.target.value)}
              />
            </div>
          )}

          <div style={S.catRow}>
            {cats.map((c) => (
              <button
                key={c}
                style={S.catBtn(cat === c)}
                className={
                  cat === c
                    ? c === 'Food'
                      ? 'cat-pill-food cat-active'
                      : c === 'Drinks'
                        ? 'cat-pill-drinks cat-active'
                        : ''
                    : ''
                }
                onClick={() => setCat(c)}
              >
                {c === 'Food' ? '🍔 Food' : c === 'Drinks' ? '🍺 Drinks' : c}
              </button>
            ))}
          </div>
          <div className="menu-grid">
            {filtered.map((item, index) => {
              const qty = getQty(item.id);
              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  qty={qty}
                  index={index}
                  onOpenDetail={() => setDetailItemId(item.id)}
                  onAdd={() => setQty(item.id, 1)}
                  onInc={() => setQty(item.id, 1)}
                  onDec={() => setQty(item.id, -1)}
                />
              );
            })}
          </div>
          {detailItem && (
            <MenuItemDetailPage
              item={detailItem}
              relatedItems={getRelatedMenuItems(detailItem, MENU)}
              mods={getMods(detailItem.id)}
              qty={getQty(detailItem.id)}
              open={detailItemId === detailItem.id}
              onClose={() => setDetailItemId(null)}
              onModsChange={(mods) => setMods(detailItem.id, mods)}
              onSelectItem={(next) => setDetailItemId(next.id)}
              onAdd={() => setQty(detailItem.id, 1)}
              onInc={() => setQty(detailItem.id, 1)}
              onDec={() => setQty(detailItem.id, -1)}
            />
          )}

          <div className="h-28 md:h-4" aria-hidden />
          <div style={S.cartBar} className="cart-bar-safe">
            <motion.button
              style={S.cartBtn(cartCount > 0)}
              onClick={() => cartCount > 0 && setShowCheckout(true)}
              whileHover={cartCount > 0 ? { scale: 1.02 } : {}}
              whileTap={cartCount > 0 ? { scale: 0.98 } : {}}
              animate={cartCount > 0 ? { boxShadow: ['0 0 0px rgba(245,166,35,0)', '0 0 20px rgba(245,166,35,0.4)', '0 0 0px rgba(245,166,35,0)'] } : {}}
              transition={cartCount > 0 ? { duration: 2, repeat: Infinity } : {}}
            >
              {cartCount > 0
                ? `Review Order · ${fmtMoney(grandTotal)} (${cartCount} item${cartCount > 1 ? 's' : ''})`
                : 'Add items to order'}
            </motion.button>
          </div>

          <MotionSheet open={showCheckout} onClose={() => setShowCheckout(false)}>
                <div style={S.sheetTitle}>Your Order</div>
                {cartItems.map((i) => {
                  const modSummary = formatModsSummary(i.mods);
                  return (
                    <div key={i.lineKey ?? i.id} style={{ ...S.lineItem, alignItems: 'center', gap: 10 }}>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FoodImage
                          src={i.image}
                          alt={i.name}
                          emoji={i.emoji}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-[#F5A62344]"
                        />
                        <span className="min-w-0">
                          <span className="block">{i.qty}× {i.name}</span>
                          {modSummary && (
                            <span className="block text-[11px] text-[#8B95A8]">{modSummary}</span>
                          )}
                        </span>
                      </div>
                      <span style={{ color: '#F8F9FC' }}>{fmtMoney(i.price * i.qty)}</span>
                    </div>
                  );
                })}
                {fulfillment === 'delivery' && (
                  <div style={S.lineItem}>
                    <span>🛵 Seat delivery fee</span>
                    <span style={{ color: '#F8F9FC' }}>{fmtMoney(DELIVERY_FEE)}</span>
                  </div>
                )}
                {fulfillment === 'delivery' && (
                  <>
                    <div style={S.tipLabel}>Tip your runner</div>
                    <div style={S.tipRow}>
                      {[
                        { label: 'No Tip', v: 0 },
                        { label: '15%', v: 0.15 },
                        { label: '18%', v: 0.18 },
                        { label: '20%', v: 0.2 },
                      ].map((t) => (
                        <button
                          key={t.label}
                          style={S.tipBtn(tipPct === t.v)}
                          onClick={() => setTipPct(t.v)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {tipAmount > 0 && (
                      <div style={{ ...S.lineItem, marginTop: 4 }}>
                        <span>Tip ({Math.round(tipPct * 100)}%)</span>
                        <span style={{ color: '#F8F9FC' }}>{fmtMoney(tipAmount)}</span>
                      </div>
                    )}
                  </>
                )}
                <div style={S.lineTotal}>
                  <span>Total</span>
                  <span style={{ color: '#F5A623' }}>{fmtMoney(grandTotal)}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8B95A8', marginTop: 8 }}>
                  {fulfillment === 'delivery' ? (
                    <>
                      🛵 Delivering to{' '}
                      <strong style={{ color: '#F8F9FC' }}>
                        Sec {section}, Row {seatRow || '—'}, Seat {seatNum || '—'}
                      </strong>
                    </>
                  ) : (
                    <>
                      📍 Pickup at <strong style={{ color: '#F8F9FC' }}>Express Window</strong> ·
                      We'll text you when ready
                    </>
                  )}
                </div>
                <motion.button
                  style={S.payBtn}
                  onClick={placeOrder}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="glow-accent"
                >
                  Pay with Apple Pay / Card →
                </motion.button>
          </MotionSheet>
        </>
      )}

      <MotionSheet open={showHistory} onClose={() => setShowHistory(false)}>
            <div style={S.sheetTitle}>My Orders</div>
            {history.length === 0 && <div style={S.historyEmpty}>No orders yet tonight.</div>}
            {history.map((h) => (
              <div key={h.id} style={S.historyRow}>
                <OrderFoodStrip items={h.items} size="sm" />
                <div style={S.historyHead}>
                  <span>
                    #{h.id} · {h.fulfillment === 'delivery' ? '🛵 Delivery' : '🏃 Pickup'}
                  </span>
                  <span style={{ color: '#F5A623' }}>{fmtMoney(h.total)}</span>
                </div>
                <div style={S.historyItems}>
                  {h.items.map((i) => formatOrderLine(i)).join(', ')} · {fmtTime(h.ts)} ·{' '}
                  {h.status}
                  {h.tip > 0 ? ` · ${fmtMoney(h.tip)} tip` : ''}
                </div>
                <button style={S.reorderBtn} onClick={() => reorder(h)}>
                  ↻ Reorder
                </button>
              </div>
            ))}
      </MotionSheet>
    </div>
  );
}