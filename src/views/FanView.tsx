import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import MotionSheet from '../components/MotionSheet';
import { MENU, SECTIONS, DELIVERY_FEE } from '../data/constants';
import { S } from '../styles/venueStyles';
import type { CartItem, FanIdentity, Fulfillment, Order } from '../types/venue';
import { fmtMoney, fmtTime } from '../utils/format';
import { playChime } from '../utils/order';

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
  const [cart, setCart] = useState<Record<number, number>>({});
  const [section] = useState(SECTIONS[2]);
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');
  const [seatRow, setSeatRow] = useState('');
  const [seatNum, setSeatNum] = useState('');
  const [tipPct, setTipPct] = useState(0.18);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { activeOrderId, setActiveOrderId, myOrderIds, trackOrder } = fanIdentity;
  const confirmedOrder = orders.find((o) => o.id === activeOrderId) || null;
  const orderStatus = confirmedOrder?.status || 'received';
  const history = myOrderIds
    .map((id) => orders.find((o) => o.id === id))
    .filter((o): o is Order => o != null);

  const cats: CategoryFilter[] = ['All', 'Food', 'Drinks'];
  const filtered = cat === 'All' ? MENU : MENU.filter((m) => m.cat === cat);
  const cartItems: CartItem[] = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => {
      const item = MENU.find((m) => m.id === Number(id));
      return item ? { ...item, qty } : null;
    })
    .filter((item): item is CartItem => item != null);
  const itemsTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartTotal = itemsTotal + (fulfillment === 'delivery' ? DELIVERY_FEE : 0);
  const tipAmount = fulfillment === 'delivery' ? Math.round(itemsTotal * tipPct * 100) / 100 : 0;
  const grandTotal = cartTotal + tipAmount;
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const isDelivery = confirmedOrder?.fulfillment === 'delivery';
  const claimed = !!confirmedOrder?.runner;

  const setQty = (id: number, delta: number) =>
    setCart((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const placeOrder = () => {
    const seatInfo =
      fulfillment === 'delivery'
        ? `Sec ${section}, Row ${seatRow || '—'}, Seat ${seatNum || '—'}`
        : null;
    const order = onOrder(cartItems, section, fulfillment, seatInfo, tipAmount);
    trackOrder(order.id);
    setShowCheckout(false);
    setCart({});
  };

  const reorder = (entry: Order) => {
    const newCart: Record<number, number> = {};
    entry.items.forEach((i) => {
      newCart[i.id] = i.qty;
    });
    setCart(newCart);
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
            <motion.div
              style={S.bigEmoji}
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
            {canOrderAgain && (
              <motion.button
                style={{ ...S.payBtn, marginTop: 24, maxWidth: 280 }}
                onClick={() => setActiveOrderId(null)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="glow-accent"
              >
                Order Again
              </motion.button>
            )}
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
            <div style={S.fanTitle}>Order Food & Drinks</div>
            <div style={S.fanSub}>Section {section} · Express pickup or seat delivery</div>
          </div>

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
              <button key={c} style={S.catBtn(cat === c)} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div style={S.menuGrid}>
            {filtered.map((item, index) => {
              const qty = cart[item.id] || 0;
              return (
                <motion.div
                  key={item.id}
                  style={S.menuCard(qty > 0)}
                  onClick={() => qty === 0 && setQty(item.id, 1)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(245,166,35,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  className={qty > 0 ? 'glow-accent' : ''}
                >
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
                    <div style={S.qtyRow} onClick={(e) => e.stopPropagation()}>
                      <button style={S.qtyBtn} onClick={() => setQty(item.id, -1)}>
                        −
                      </button>
                      <div style={S.qtyNum}>{qty}</div>
                      <button style={S.qtyBtn} onClick={() => setQty(item.id, 1)}>
                        +
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#F5A623',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0A0F1E',
                        fontSize: 20,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      +
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          <div style={{ height: 80 }} />
          <div style={S.cartBar}>
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
                {cartItems.map((i) => (
                  <div key={i.id} style={S.lineItem}>
                    <span>
                      {i.qty}× {i.name}
                    </span>
                    <span style={{ color: '#F8F9FC' }}>{fmtMoney(i.price * i.qty)}</span>
                  </div>
                ))}
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
                <div style={S.historyHead}>
                  <span>
                    #{h.id} · {h.fulfillment === 'delivery' ? '🛵 Delivery' : '🏃 Pickup'}
                  </span>
                  <span style={{ color: '#F5A623' }}>{fmtMoney(h.total)}</span>
                </div>
                <div style={S.historyItems}>
                  {h.items.map((i) => `${i.qty}× ${i.name}`).join(', ')} · {fmtTime(h.ts)} ·{' '}
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