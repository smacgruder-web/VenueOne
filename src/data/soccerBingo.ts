export type BingoPrizeType = 'free_delivery' | 'five_off';

export interface BingoPrize {
  id: string;
  type: BingoPrizeType;
  label: string;
  detail: string;
  claimed: boolean;
  wonAt: number;
}

export interface SoccerBingoState {
  seed: number;
  cells: string[];
  marked: boolean[];
  lastEvent: string | null;
  won: boolean;
  prize: BingoPrize | null;
}

export const SOCCER_BINGO_EVENTS = [
  '⚽ Goal Scored',
  '🟨 Yellow Card',
  '🟥 Red Card',
  '🚩 Corner Kick',
  '🎯 Penalty Kick',
  '🧤 Keeper Save',
  '💥 Header Goal',
  '🚫 Offside Call',
  '🔄 Substitution',
  '📺 VAR Review',
  '🦶 Free Kick',
  '⭐ Hat Trick',
  '🛡️ Clean Sheet',
  '🏥 Injury Stoppage',
  '🌊 Crowd Wave',
  '📣 GOOOAL Chant',
  '😱 Near Miss',
  '🪵 Crossbar Hit',
  '🅰️ Assist',
  '💨 Counter Attack',
  '⏱️ Extra Time',
  '🧤 PK Saved',
  '🔥 Stoppage Time Goal',
  '🚲 Bicycle Kick',
  '🟢 Kickoff',
  '👏 Standing Ovation',
  '🎺 Horn Blast',
  '🧨 Derby Tension',
] as const;

const PRIZE_POOL: Array<{ type: BingoPrizeType; label: string; detail: string }> = [
  {
    type: 'free_delivery',
    label: 'Free Seat Delivery',
    detail: 'Your next in-game delivery fee is on us.',
  },
  {
    type: 'five_off',
    label: '$5 Off Coupon',
    detail: 'Use during the match on food or drinks.',
  },
];

export const BINGO_STORAGE_KEY = 'venueone-soccer-bingo-v1';
export const PRIZE_STORAGE_KEY = 'venueone-soccer-bingo-prizes-v1';

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createBoard(seed = Date.now()): Pick<SoccerBingoState, 'seed' | 'cells' | 'marked'> {
  const pool = seededShuffle([...SOCCER_BINGO_EVENTS], seed).slice(0, 24);
  const cells: string[] = [];
  let poolIndex = 0;
  for (let i = 0; i < 25; i += 1) {
    if (i === 12) {
      cells.push('⚽ FREE');
    } else {
      cells.push(pool[poolIndex]);
      poolIndex += 1;
    }
  }
  const marked = Array.from({ length: 25 }, () => false);
  marked[12] = true;
  return { seed, cells, marked };
}

export function checkBingoWin(marked: boolean[]): boolean {
  const lines = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];
  return lines.some((line) => line.every((idx) => marked[idx]));
}

export function randomLiveEvent(cells: string[]): string {
  const options = cells.filter((_, idx) => idx !== 12);
  return options[Math.floor(Math.random() * options.length)];
}

export function findMatchingCells(cells: string[], event: string): number[] {
  return cells.map((cell, idx) => (cell === event ? idx : -1)).filter((idx) => idx >= 0);
}

export function rollPrize(seed: number): BingoPrize {
  const pick = PRIZE_POOL[seed % PRIZE_POOL.length];
  return {
    id: `prize-${Date.now()}`,
    type: pick.type,
    label: pick.label,
    detail: pick.detail,
    claimed: false,
    wonAt: Date.now(),
  };
}

export function defaultBingoState(): SoccerBingoState {
  const board = createBoard();
  return {
    ...board,
    lastEvent: null,
    won: false,
    prize: null,
  };
}