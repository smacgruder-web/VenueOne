import { RUNNERS } from '../data/constants';
import { S } from '../styles/venueStyles';
import type { Order, OrderStatus, RunnerIdentity } from '../types/venue';
import { fmtMoney, fmtTime } from '../utils/format';

interface RunnerViewProps {
  orders: Order[];
  claimOrder: (id: string, runnerName: string) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  runnerIdentity: RunnerIdentity;
}

export default function RunnerView({ orders, claimOrder, updateStatus, runnerIdentity }: RunnerViewProps) {
  const { me, setMe } = runnerIdentity;

  const pool = orders.filter((o) => o.fulfillment === 'delivery' && o.status === 'ready' && !o.runner);
  const mine = orders.filter((o) => o.runner === me && o.status === 'ready');
  const completed = me ? orders.filter((o) => o.runner === me && o.status === 'delivered') : [];
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
        <div style={{ padding: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {RUNNERS.map((r) => (
            <button
              key={r}
              style={{ ...S.fulfillBtn(false), flex: '0 1 140px', minWidth: 120 }}
              onClick={() => setMe(r)}
            >
              {r}
            </button>
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
          <div style={S.staffSub}>
            {completed.length} delivered tonight · {fmtMoney(myTips)} in tips
          </div>
        </div>
        <button style={S.historyBtn} onClick={() => setMe(null)}>
          Switch Runner
        </button>
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>Available Deliveries ({pool.length})</div>
        {pool.length === 0 ? (
          <div style={{ fontSize: 13, color: '#3A4557' }}>No unclaimed deliveries right now</div>
        ) : (
          <div style={S.orderGrid}>
            {pool.map((order) => (
              <div key={order.id} style={S.orderCard('ready')}>
                <div style={S.orderCardHead}>
                  <div>
                    <div style={S.orderId}>#{order.id}</div>
                    <div style={S.orderMeta}>
                      Section {order.section} · {fmtTime(order.ts)}
                    </div>
                  </div>
                  <div style={S.deliveryBadge}>🛵 UNCLAIMED</div>
                </div>
                <div style={S.deliveryMeta}>{order.seat}</div>
                <div style={S.orderItems}>
                  {order.items.map((i, idx) => (
                    <div key={idx}>
                      {i.qty}× {i.name}
                    </div>
                  ))}
                </div>
                <div style={S.orderTotal}>
                  {fmtMoney(order.total)}
                  {order.tip > 0 ? ` + ${fmtMoney(order.tip)} tip` : ''}
                </div>
                <button style={S.actionBtn('received')} onClick={() => claimOrder(order.id, me)}>
                  🛵 CLAIM DELIVERY
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={S.chartSection}>
        <div style={S.chartTitle}>My Active Deliveries ({mine.length})</div>
        {mine.length === 0 ? (
          <div style={{ fontSize: 13, color: '#3A4557' }}>Claim a delivery above to get started</div>
        ) : (
          <div style={S.orderGrid}>
            {mine.map((order) => (
              <div key={order.id} style={S.orderCard('preparing')}>
                <div style={S.orderCardHead}>
                  <div>
                    <div style={S.orderId}>#{order.id}</div>
                    <div style={S.orderMeta}>
                      Section {order.section} · {fmtTime(order.ts)}
                    </div>
                  </div>
                  <div style={S.deliveryBadge}>🛵 EN ROUTE</div>
                </div>
                <div style={S.deliveryMeta}>{order.seat}</div>
                <div style={S.orderItems}>
                  {order.items.map((i, idx) => (
                    <div key={idx}>
                      {i.qty}× {i.name}
                    </div>
                  ))}
                </div>
                <div style={S.orderTotal}>
                  {fmtMoney(order.total)}
                  {order.tip > 0 ? ` + ${fmtMoney(order.tip)} tip` : ''}
                </div>
                <button style={S.actionBtn('preparing')} onClick={() => updateStatus(order.id, 'delivered')}>
                  ✓ MARK DELIVERED
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={S.feedSection}>
        <div style={S.feedTitle}>Delivered Tonight</div>
        {completed.slice(0, 12).map((order) => (
          <div key={order.id} style={S.feedItem}>
            <div style={S.feedLeft}>
              <div style={S.feedDot('delivered')} />
              <div>
                <div style={S.feedText}>
                  #{order.id} · {order.seat}
                </div>
                <div style={S.feedSub}>{order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</div>
              </div>
            </div>
            <div style={S.feedAmt}>
              {fmtMoney(order.total)}
              {order.tip > 0 ? ` +${fmtMoney(order.tip)}` : ''}
            </div>
          </div>
        ))}
        {completed.length === 0 && (
          <div style={{ fontSize: 13, color: '#3A4557' }}>No deliveries completed yet</div>
        )}
      </div>
    </div>
  );
}