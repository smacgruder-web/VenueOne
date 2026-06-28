import type { EventStats, MenuItem } from '../types/venue';

export const MENU_IMG_VERSION = '4';

const menuImg = (slug: string) => `/images/menu/${slug}.jpg?v=${MENU_IMG_VERSION}`;

export const menuImageUrl = (slug: string) => menuImg(slug);

export const MENU_IMAGE_URLS = [
  'stadium-dog',
  'nachos',
  'pretzel',
  'burger',
  'chicken-tenders',
  'pizza-slice',
  'domestic-beer',
  'craft-beer',
  'hard-seltzer',
  'soda',
  'water',
  'loaded-fries',
].map(menuImg);

export const HERO_IMAGE_URLS = ['stadium-dog', 'nachos', 'craft-beer'].map(menuImg);

export const MENU: MenuItem[] = [
  {
    id: 1,
    name: 'Stadium Dog',
    desc: 'All-beef frank, mustard, relish',
    price: 7.0,
    emoji: '🌭',
    image: menuImg('stadium-dog'),
    cat: 'Food',
    popular: true,
  },
  {
    id: 2,
    name: 'Nachos',
    desc: 'Chips, cheddar, jalapeños',
    price: 9.5,
    emoji: '🧀',
    image: menuImg('nachos'),
    cat: 'Food',
    popular: true,
  },
  {
    id: 3,
    name: 'Pretzel',
    desc: 'Salted, with cheese dip',
    price: 6.5,
    emoji: '🥨',
    image: menuImg('pretzel'),
    cat: 'Food',
  },
  {
    id: 4,
    name: 'Burger',
    desc: '1/3 lb beef, LTO, special sauce',
    price: 12.0,
    emoji: '🍔',
    image: menuImg('burger'),
    cat: 'Food',
    popular: true,
  },
  {
    id: 5,
    name: 'Chicken Tenders',
    desc: '3-piece, honey mustard',
    price: 10.5,
    emoji: '🍗',
    image: menuImg('chicken-tenders'),
    cat: 'Food',
  },
  {
    id: 6,
    name: 'Pizza Slice',
    desc: 'Pepperoni or cheese',
    price: 5.5,
    emoji: '🍕',
    image: menuImg('pizza-slice'),
    cat: 'Food',
  },
  {
    id: 7,
    name: 'Domestic Beer',
    desc: 'Bud, Miller, Coors — 16oz',
    price: 9.0,
    emoji: '🍺',
    image: menuImg('domestic-beer'),
    cat: 'Drinks',
    popular: true,
  },
  {
    id: 8,
    name: 'Craft Beer',
    desc: 'Local IPA — 16oz',
    price: 11.0,
    emoji: '🍻',
    image: menuImg('craft-beer'),
    cat: 'Drinks',
  },
  {
    id: 9,
    name: 'Hard Seltzer',
    desc: 'White Claw variety — 12oz',
    price: 8.5,
    emoji: '🥂',
    image: menuImg('hard-seltzer'),
    cat: 'Drinks',
  },
  {
    id: 10,
    name: 'Soda',
    desc: 'Pepsi, Diet Pepsi, Mountain Dew',
    price: 5.0,
    emoji: '🥤',
    image: menuImg('soda'),
    cat: 'Drinks',
  },
  {
    id: 11,
    name: 'Water',
    desc: 'Dasani 20oz',
    price: 4.0,
    emoji: '💧',
    image: menuImg('water'),
    cat: 'Drinks',
  },
  {
    id: 12,
    name: 'Loaded Fries',
    desc: 'Fries, bacon, cheddar, sour cream',
    price: 8.5,
    emoji: '🍟',
    image: menuImg('loaded-fries'),
    cat: 'Food',
  },
];

export const VENUE_TIMEZONE = 'America/New_York';

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