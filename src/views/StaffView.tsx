import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import OrderFoodStrip from '../components/OrderFoodStrip';
import { S } from '../styles/venueStyles';
import type { Fulfillment, Order, OrderStatus } from '../types/venue';
import { fmtMoney, fmtTime } from '../utils/format';
import { nextAction, playChime } from '../utils/order';

interface StaffViewProps {
  orders: Order[];
  updateStatus: (id: string, status: OrderStatus) => void;
}

type StaffFilter = 'all' | Fulfillment;

export default function StaffView({ orders, updateStatus }: StaffViewProps) {
  const [filter, setFilter] = useState<StaffFilter>('all');
  const allActive = orders.filter((o) =>
    o.fulfillment === 'delivery' ? o.status !== 'delivered' : o.status !== 'ready',
  );
  const active = (filter === 'all' ? allActive : allActive.filter((o) => o.fulfillment === filter)).slice(
    0,
    24,
  );
  const newCount = orders.filter((o) => o.status === 'received').length;
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
          <div style={S.staffSub}>
            Express Windows A · B · C + Seat Runners — {fmtTime(Date.now())}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {newCount > 0 && (
            <motion.div
              style={{
                background: '#F5A623',
                color: '#0A0F1E',
                fontSize: 13,
                fontWeight: 800,
                padding: '6px 12px',
                borderRadius: 8,
              }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="glow-accent"
            >
              {newCount} NEW
            </motion.div>
          )}
          <div
            style={{
              background: '#1A2335',
              color: '#8B95A8',
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
            }}
          >
            {orders.length} today
          </div>
        </div>
      </div>

      <div style={S.filterRow}>
        {[
          { id: 'all' as const, label: 'All' },
          { id: 'pickup' as const, label: '🏃 Pickup' },
          { id: 'delivery' as const, label: '🛵 Delivery' },
        ].map((f) => (
          <button key={f.id} style={S.filterBtn(filter === f.id)} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {active.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: '#3A4557',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>All caught up</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>New orders will appear here</div>
        </div>
      ) : (
        <div className="staff-order-grid">
          {active.map((order, index) => {
            const action = nextAction(order);
            const isDelivery = order.fulfillment === 'delivery';
            return (
              <motion.div
                key={order.id}
                style={S.orderCard(order.status)}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                layout
                className="glass-card"
              >
                <div style={S.orderCardHead}>
                  <div>
                    <div style={S.orderId}>#{order.id}</div>
                    <div style={S.orderMeta}>
                      Section {order.section} · {fmtTime(order.ts)}
                    </div>
                  </div>
                  {isDelivery ? (
                    <div style={S.deliveryBadge}>🛵 DELIVERY</div>
                  ) : (
                    <div style={S.windowBadge(order.window ?? '')}>WIN {order.window}</div>
                  )}
                </div>
                {isDelivery && (
                  <div style={S.deliveryMeta}>
                    {order.runner
                      ? `${order.runner} → ${order.seat}${order.status === 'ready' ? ' · en route' : ''}`
                      : `${order.seat} · awaiting runner`}
                  </div>
                )}
                <OrderFoodStrip items={order.items} size="sm" />
                <div style={S.orderItems}>
                  {order.items.map((i, idx) => (
                    <div key={idx}>
                      {i.qty}× {i.name}
                    </div>
                  ))}
                </div>
                <div style={S.orderTotal}>{fmtMoney(order.total)}</div>
                {action && (
                  <motion.button
                    style={S.actionBtn(order.status)}
                    onClick={() => updateStatus(order.id, action.next)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {action.label}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}