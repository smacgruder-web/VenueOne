import type { MenuItem } from '../types/venue';

export function getRelatedMenuItems(item: MenuItem, menu: MenuItem[], limit = 6): MenuItem[] {
  const sameCategory = menu.filter((entry) => entry.id !== item.id && entry.cat === item.cat);
  const popularExtras = menu.filter(
    (entry) => entry.id !== item.id && entry.cat !== item.cat && entry.popular,
  );

  const merged: MenuItem[] = [];
  for (const entry of [...sameCategory, ...popularExtras]) {
    if (!merged.some((m) => m.id === entry.id)) merged.push(entry);
    if (merged.length >= limit) break;
  }

  return merged;
}