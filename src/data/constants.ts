import type { EventStats, MenuItem } from '../types/venue';

const unsplash = (id: string, w = 600, h = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;

const pexels = (id: number, w = 600, h = 400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

export const MENU: MenuItem[] = [
  {
    id: 1,
    name: 'Stadium Dog',
    desc: 'All-beef frank, mustard, relish',
    price: 7.0,
    emoji: '🌭',
    image: unsplash('photo-1528735602780-2552fd46c7af'),
    cat: 'Food',
    popular: true,
  },
  {
    id: 2,
    name: 'Nachos',
    desc: 'Chips, cheddar, jalapeños',
    price: 9.5,
    emoji: '🧀',
    image: pexels(4197096),
    cat: 'Food',
    popular: true,
  },
  {
    id: 3,
    name: 'Pretzel',
    desc: 'Salted, with cheese dip',
    price: 6.5,
    emoji: '🥨',
    image: pexels(6234595),
    cat: 'Food',
  },
  {
    id: 4,
    name: 'Burger',
    desc: '1/3 lb beef, LTO, special sauce',
    price: 12.0,
    emoji: '🍔',
    image: unsplash('photo-1568901346375-23c9450c58cd'),
    cat: 'Food',
    popular: true,
  },
  {
    id: 5,
    name: 'Chicken Tenders',
    desc: '3-piece, honey mustard',
    price: 10.5,
    emoji: '🍗',
    image: unsplash('photo-1626082927389-6cd097cdc6ec'),
    cat: 'Food',
  },
  {
    id: 6,
    name: 'Pizza Slice',
    desc: 'Pepperoni or cheese',
    price: 5.5,
    emoji: '🍕',
    image: unsplash('photo-1513104890138-7c749659a591'),
    cat: 'Food',
  },
  {
    id: 7,
    name: 'Domestic Beer',
    desc: 'Bud, Miller, Coors — 16oz',
    price: 9.0,
    emoji: '🍺',
    image: unsplash('photo-1558618666-fcd25c85cd64'),
    cat: 'Drinks',
    popular: true,
  },
  {
    id: 8,
    name: 'Craft Beer',
    desc: 'Local IPA — 16oz',
    price: 11.0,
    emoji: '🍻',
    image: unsplash('photo-1535958636474-b021ee887b13'),
    cat: 'Drinks',
  },
  {
    id: 9,
    name: 'Hard Seltzer',
    desc: 'White Claw variety — 12oz',
    price: 8.5,
    emoji: '🥂',
    image: pexels(1283219),
    cat: 'Drinks',
  },
  {
    id: 10,
    name: 'Soda',
    desc: 'Pepsi, Diet Pepsi, Mountain Dew',
    price: 5.0,
    emoji: '🥤',
    image: unsplash('photo-1554866585-cd94860890b7'),
    cat: 'Drinks',
  },
  {
    id: 11,
    name: 'Water',
    desc: 'Dasani 20oz',
    price: 4.0,
    emoji: '💧',
    image: pexels(416528),
    cat: 'Drinks',
  },
  {
    id: 12,
    name: 'Loaded Fries',
    desc: 'Fries, bacon, cheddar, sour cream',
    price: 8.5,
    emoji: '🍟',
    image: unsplash('photo-1473093295043-cdd812d0e601'),
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