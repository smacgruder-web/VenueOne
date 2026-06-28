import { getMenuModGroups } from '../data/menuCustomizations';
import type { CartItem, MenuItem, ModSelection, MenuModGroup } from '../types/venue';

export function defaultModsForItem(itemId: number): ModSelection[] {
  return getMenuModGroups(itemId).map((group) => ({
    groupId: group.id,
    groupLabel: group.label,
    optionId: group.options[0].id,
    optionLabel: group.options[0].label,
  }));
}

export function buildCartLineKey(itemId: number, mods: ModSelection[]): string {
  const sig = mods
    .map((mod) => `${mod.groupId}:${mod.optionId}`)
    .sort()
    .join('|');
  return `${itemId}::${sig}`;
}

export function isDefaultForItem(itemId: number, mods: ModSelection[]): boolean {
  const defaults = defaultModsForItem(itemId);
  if (defaults.length !== mods.length) return false;
  return defaults.every((def) =>
    mods.some((mod) => mod.groupId === def.groupId && mod.optionId === def.optionId),
  );
}

export function applyModSelection(
  groups: MenuModGroup[],
  current: ModSelection[],
  groupId: string,
  optionId: string,
): ModSelection[] {
  const group = groups.find((g) => g.id === groupId);
  const option = group?.options.find((o) => o.id === optionId);
  if (!group || !option) return current;

  const next = current.filter((mod) => mod.groupId !== groupId);
  next.push({
    groupId: group.id,
    groupLabel: group.label,
    optionId: option.id,
    optionLabel: option.label,
  });
  return next.sort((a, b) => a.groupId.localeCompare(b.groupId));
}

export function formatModsSummary(mods?: ModSelection[]): string {
  if (!mods?.length) return '';
  return mods
    .filter((mod) => !mod.optionLabel.toLowerCase().startsWith('regular'))
    .map((mod) => mod.optionLabel)
    .join(' · ');
}

export function formatOrderLine(item: Pick<CartItem, 'qty' | 'name' | 'mods'>): string {
  const summary = formatModsSummary(item.mods);
  return summary ? `${item.qty}× ${item.name} — ${summary}` : `${item.qty}× ${item.name}`;
}

export function cartItemsFromLines(
  lines: Record<string, { qty: number; mods: ModSelection[] }>,
  menu: MenuItem[],
): CartItem[] {
  const items: CartItem[] = [];

  for (const [lineKey, entry] of Object.entries(lines)) {
    if (entry.qty <= 0) continue;
    const itemId = Number(lineKey.split('::')[0]);
    const item = menu.find((m) => m.id === itemId);
    if (!item) continue;
    items.push({
      ...item,
      qty: entry.qty,
      mods: entry.mods,
      lineKey,
    });
  }

  return items;
}