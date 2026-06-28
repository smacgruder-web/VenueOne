import { MENU } from '../data/constants';
import type { CartItem } from '../types/venue';
import FoodImage from './FoodImage';

interface OrderFoodStripProps {
  items: CartItem[];
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
};

function resolveItem(item: CartItem): CartItem {
  const fromMenu = MENU.find((m) => m.id === item.id);
  return {
    ...item,
    image: item.image || fromMenu?.image || '',
    emoji: item.emoji || fromMenu?.emoji || '🍽️',
  };
}

export default function OrderFoodStrip({ items, size = 'md' }: OrderFoodStripProps) {
  const unique = items
    .map(resolveItem)
    .filter((item, i, arr) => arr.findIndex((x) => x.id === item.id) === i);

  return (
    <div className="flex flex-wrap justify-center gap-2 py-2">
      {unique.map((item) => (
        <div key={item.id} className="relative">
          <FoodImage
            src={item.image}
            alt={item.name}
            emoji={item.emoji}
            className={`${sizes[size]} rounded-xl object-cover ring-2 ring-[#F5A62355] shadow-lg`}
          />
          {item.qty > 1 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5A623] text-[10px] font-black text-[#0A0F1E]">
              {item.qty}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}