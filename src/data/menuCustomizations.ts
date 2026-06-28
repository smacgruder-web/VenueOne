import type { MenuModGroup } from '../types/venue';

export const MENU_CUSTOMIZATIONS: Record<number, MenuModGroup[]> = {
  1: [
    {
      id: 'mustard',
      label: 'Mustard',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra' },
        { id: 'none', label: 'No Mustard' },
      ],
    },
    {
      id: 'onions',
      label: 'Onions',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'none', label: 'No Onions' },
      ],
    },
    {
      id: 'relish',
      label: 'Relish',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra' },
        { id: 'none', label: 'No Relish' },
      ],
    },
  ],
  2: [
    {
      id: 'cheese',
      label: 'Cheese',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Cheese' },
      ],
    },
    {
      id: 'jalapenos',
      label: 'Jalapeños',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra' },
        { id: 'none', label: 'No Jalapeños' },
      ],
    },
    {
      id: 'sour-cream',
      label: 'Sour Cream',
      type: 'single',
      options: [
        { id: 'add', label: 'Add Sour Cream' },
        { id: 'none', label: 'No Sour Cream' },
      ],
    },
  ],
  3: [
    {
      id: 'dip',
      label: 'Dip',
      type: 'single',
      options: [
        { id: 'cheese', label: 'Cheese Dip' },
        { id: 'mustard', label: 'Mustard' },
        { id: 'none', label: 'No Dip' },
      ],
    },
    {
      id: 'salt',
      label: 'Salt',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular Salt' },
        { id: 'light', label: 'Light Salt' },
        { id: 'extra', label: 'Extra Salt' },
      ],
    },
  ],
  4: [
    {
      id: 'mayo',
      label: 'Mayo',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Mayo' },
        { id: 'none', label: 'No Mayo' },
      ],
    },
    {
      id: 'cheese',
      label: 'Cheese',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Cheese' },
        { id: 'none', label: 'No Cheese' },
      ],
    },
    {
      id: 'onions',
      label: 'Onions',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'none', label: 'No Onions' },
      ],
    },
    {
      id: 'sauce',
      label: 'Special Sauce',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Sauce' },
        { id: 'none', label: 'No Sauce' },
      ],
    },
  ],
  5: [
    {
      id: 'sauce',
      label: 'Sauce',
      type: 'single',
      options: [
        { id: 'honey-mustard', label: 'Honey Mustard' },
        { id: 'ranch', label: 'Ranch' },
        { id: 'bbq', label: 'BBQ' },
        { id: 'none', label: 'No Sauce' },
      ],
    },
    {
      id: 'extra-sauce',
      label: 'Extra Sauce',
      type: 'single',
      options: [
        { id: 'yes', label: 'Extra Sauce' },
        { id: 'no', label: 'Regular Portion' },
      ],
    },
  ],
  6: [
    {
      id: 'topping',
      label: 'Topping',
      type: 'single',
      options: [
        { id: 'pepperoni', label: 'Pepperoni' },
        { id: 'sausage', label: 'Sausage' },
        { id: 'veggie', label: 'Veggie' },
        { id: 'cheese', label: 'Cheese Only' },
      ],
    },
    {
      id: 'extra-cheese',
      label: 'Cheese',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Cheese' },
      ],
    },
  ],
  7: [
    {
      id: 'brand',
      label: 'Beer Type',
      type: 'single',
      options: [
        { id: 'bud', label: 'Bud' },
        { id: 'miller', label: 'Miller' },
        { id: 'coors', label: 'Coors' },
      ],
    },
    {
      id: 'ice',
      label: 'Ice',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Ice' },
        { id: 'none', label: 'No Ice' },
      ],
    },
  ],
  8: [
    {
      id: 'style',
      label: 'Beer Type',
      type: 'single',
      options: [
        { id: 'ipa', label: 'IPA' },
        { id: 'lager', label: 'Lager' },
        { id: 'pilsner', label: 'Pilsner' },
        { id: 'wheat', label: 'Wheat' },
      ],
    },
    {
      id: 'ice',
      label: 'Ice',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Ice' },
        { id: 'none', label: 'No Ice' },
      ],
    },
  ],
  9: [
    {
      id: 'flavor',
      label: 'Flavor',
      type: 'single',
      options: [
        { id: 'black-cherry', label: 'Black Cherry' },
        { id: 'mango', label: 'Mango' },
        { id: 'watermelon', label: 'Watermelon' },
        { id: 'lime', label: 'Lime' },
      ],
    },
    {
      id: 'ice',
      label: 'Ice',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Ice' },
        { id: 'none', label: 'No Ice' },
      ],
    },
  ],
  10: [
    {
      id: 'soda',
      label: 'Soda Type',
      type: 'single',
      options: [
        { id: 'pepsi', label: 'Pepsi' },
        { id: 'diet-pepsi', label: 'Diet Pepsi' },
        { id: 'mountain-dew', label: 'Mountain Dew' },
        { id: 'sierra-mist', label: 'Sierra Mist' },
      ],
    },
    {
      id: 'ice',
      label: 'Ice',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Ice' },
        { id: 'none', label: 'No Ice' },
      ],
    },
  ],
  11: [
    {
      id: 'ice',
      label: 'Ice',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Ice' },
        { id: 'none', label: 'No Ice' },
      ],
    },
  ],
  12: [
    {
      id: 'bacon',
      label: 'Bacon',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Bacon' },
        { id: 'none', label: 'No Bacon' },
      ],
    },
    {
      id: 'sour-cream',
      label: 'Sour Cream',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra' },
        { id: 'none', label: 'No Sour Cream' },
      ],
    },
    {
      id: 'cheese',
      label: 'Cheese',
      type: 'single',
      options: [
        { id: 'regular', label: 'Regular' },
        { id: 'extra', label: 'Extra Cheese' },
      ],
    },
  ],
};

export function getMenuModGroups(itemId: number): MenuModGroup[] {
  return MENU_CUSTOMIZATIONS[itemId] ?? [];
}