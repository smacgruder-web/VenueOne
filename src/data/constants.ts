import type { EventStats, MenuItem } from '../types/venue';

const img = (id: string, w = 600, h = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const MENU: MenuItem[] = [
  {
    id: 1,
    name: 'Stadium Dog',
    desc: 'All-beef frank, mustard, relish',
    price: 7.0,
    emoji: '🌭',
    image: img('photo-1612392062631-ef0a0bf0b85e'),
    cat: 'Food',
    popular: true,
  },
  {
    id: 2,
    name: 'Nachos',
    desc: 'Chips, cheddar, jalapeños',
    price: 9.5,
    emoji: '🧀',
    image: img('photo-1513456852971-30c0ba1c4844'),
    cat: 'Food',
    popular: true,
  },
  {
    id: 3,
    name: 'Pretzel',
    desc: 'Salted, with cheese dip',
    price: 6.5,
    emoji: '🥨',
    image: img('photo-1588195538326-5cf0f46e14b2'),
    cat: 'Food',
  },
  {
    id: 4,
    name: 'Burger',
    desc: '1/3 lb beef, LTO, special sauce',
    price: 12.0,
    emoji: '🍔',
    image: img('photo-1568901346375-23c9450c58cd'),
    cat: 'Food',
    popular: true,
  },
  {
    id: 5,
    name: 'Chicken Tenders',
    desc: '3-piece, honey mustard',
    price: 10.5,
    emoji: '🍗',
    image: img('photo-1626082927389-6cd097cdc6ec'),
    cat: 'Food',
  },
  {
    id: 6,
    name: 'Pizza Slice',
    desc: 'Pepperoni or cheese',
    price: 5.5,
    emoji: '🍕',
    image: img('photo-1513104890138-7c749659a591'),
    cat: 'Food',
  },
  {
    id: 7,
    name: 'Domestic Beer',
    desc: 'Bud, Miller, Coors — 16oz',
    price: 9.0,
    emoji: '🍺',
    image: img('photo-1608270582010-4db9fbb70fbf'),
    cat: 'Drinks',
    popular: true,
  },
  {
    id: 8,
    name: 'Craft Beer',
    desc: 'Local IPA — 16oz',
    price: 11.0,
    emoji: '🍻',
    image: img('photo-1535958636474-b021ee887b13'),
    cat: 'Drinks',
  },
  {
    id: 9,
    name: 'Hard Seltzer',
    desc: 'White Claw variety — 12oz',
    price: 8.5,
    emoji: '🥂',
    image: img('photo-1629206004482-670d35f39592'),
    cat: 'Drinks',
  },
  {
    id: 10,
    name: 'Soda',
    desc: 'Pepsi, Diet Pepsi, Mountain Dew',
    price: 5.0,
    emoji: '🥤',
    image: img('photo-1622483760538-83903c4f6cbb'),
    cat: 'Drinks',
  },
  {
    id: 11,
    name: 'Water',
    desc: 'Dasani 20oz',
    price: 4.0,
    emoji: '💧',
    image: img('photo-1548839140-5a941f83ab48'),
    cat: 'Drinks',
  },
  {
    id: 12,
    name: 'Loaded Fries',
    desc: 'Fries, bacon, cheddar, sour cream',
    price: 8.5,
    emoji: '🍟',
    image: img('photo-1573080496219-a597967a65d0'),
    cat: 'Food',
  },
];

export const SECTIONS = ['101', '102', '103', '104', '105', '106', '107', '108'];
export const WINDOWS = ['A', 'B', 'C'];
export const RUNNERS = ['Marcus', 'Devon', 'Aaliyah', 'Trey', 'Nia'];
export const DELIVERY_FEE = 2.5;

export const LEDGER_KEY = 'venue-ledger-v1';
export const FAN_KEY = 'my-fan-state-v1';
export const RUNNER_KEY = 'my-runner-state-v1';

export const DEFAULT_STATS: EventStats = {
  totalRevenue: 0,
  totalOrders: 0,
  scans: 0,
  avgOrderValue: 0,
  perCap: 0,
  attendance: 6214,
  baselinePerCap: 14.2,
};