export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered';
export type Fulfillment = 'pickup' | 'delivery';
export type ViewId = 'fan' | 'staff' | 'runners' | 'analytics';

export interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  emoji: string;
  cat: 'Food' | 'Drinks';
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface StatusEvent {
  status: string;
  ts: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  tip: number;
  section: string;
  fulfillment: Fulfillment;
  window: string | null;
  seat: string | null;
  runner: string | null;
  status: OrderStatus;
  ts: number;
  statusHistory: StatusEvent[];
  name: string;
  auto?: boolean;
}

export interface EventStats {
  totalRevenue: number;
  totalOrders: number;
  scans: number;
  avgOrderValue: number;
  perCap: number;
  attendance: number;
  baselinePerCap: number;
}

export interface FanIdentity {
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  myOrderIds: string[];
  trackOrder: (id: string) => void;
}

export interface RunnerIdentity {
  me: string | null;
  setMe: (name: string | null) => void;
}