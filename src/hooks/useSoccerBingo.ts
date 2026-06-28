import { useCallback, useEffect, useState } from 'react';
import {
  BINGO_STORAGE_KEY,
  PRIZE_STORAGE_KEY,
  checkBingoWin,
  createBoard,
  defaultBingoState,
  findMatchingCells,
  randomLiveEvent,
  rollPrize,
  type BingoPrize,
  type SoccerBingoState,
} from '../data/soccerBingo';

function loadState(): SoccerBingoState {
  try {
    const raw = localStorage.getItem(BINGO_STORAGE_KEY);
    if (!raw) return defaultBingoState();
    const parsed = JSON.parse(raw) as SoccerBingoState;
    if (!parsed.cells?.length) return defaultBingoState();
    return parsed;
  } catch {
    return defaultBingoState();
  }
}

function loadPrizes(): BingoPrize[] {
  try {
    const raw = localStorage.getItem(PRIZE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BingoPrize[]) : [];
  } catch {
    return [];
  }
}

export function useSoccerBingo() {
  const [state, setState] = useState<SoccerBingoState>(loadState);
  const [prizes, setPrizes] = useState<BingoPrize[]>(loadPrizes);

  useEffect(() => {
    localStorage.setItem(BINGO_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(PRIZE_STORAGE_KEY, JSON.stringify(prizes));
  }, [prizes]);

  const toggleCell = useCallback((index: number) => {
    setState((prev) => {
      if (prev.won || index === 12) return prev;
      const marked = [...prev.marked];
      marked[index] = !marked[index];
      marked[12] = true;
      const won = checkBingoWin(marked);
      let prize = prev.prize;
      if (won && !prize) {
        prize = rollPrize(prev.seed + marked.filter(Boolean).length);
        setPrizes((p) => [prize!, ...p]);
      }
      return { ...prev, marked, won, prize: prize ?? prev.prize };
    });
  }, []);

  const simPlay = useCallback(() => {
    setState((prev) => {
      if (prev.won) return prev;
      const event = randomLiveEvent(prev.cells);
      const matches = findMatchingCells(prev.cells, event);
      const marked = [...prev.marked];
      matches.forEach((idx) => {
        marked[idx] = true;
      });
      marked[12] = true;
      const won = checkBingoWin(marked);
      let prize = prev.prize;
      if (won && !prize) {
        prize = rollPrize(prev.seed + Date.now());
        setPrizes((p) => [prize!, ...p]);
      }
      return { ...prev, marked, lastEvent: event, won, prize: prize ?? prev.prize };
    });
  }, []);

  const newGame = useCallback(() => {
    const board = createBoard(Date.now());
    setState({
      ...board,
      lastEvent: null,
      won: false,
      prize: null,
    });
  }, []);

  const activePrize = prizes.find((p) => !p.claimed) ?? null;

  const claimPrize = useCallback((id: string) => {
    setPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, claimed: true } : p)));
  }, []);

  return {
    state,
    prizes,
    activePrize,
    toggleCell,
    simPlay,
    newGame,
    claimPrize,
  };
}