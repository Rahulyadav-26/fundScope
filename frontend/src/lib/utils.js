import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministically generate a gray shade class pair from a string.
 * B&W theme: all avatars use white text on varying dark gray backgrounds.
 */
export function getFundColor(_name = '') {
  const shades = [
    'bg-[hsl(0_0%_18%)]',
    'bg-[hsl(0_0%_22%)]',
    'bg-[hsl(0_0%_15%)]',
    'bg-[hsl(0_0%_25%)]',
    'bg-[hsl(0_0%_20%)]',
    'bg-[hsl(0_0%_28%)]',
    'bg-[hsl(0_0%_12%)]',
    'bg-[hsl(0_0%_30%)]',
  ];
  let hash = 0;
  for (let i = 0; i < _name.length; i++) {
    hash = _name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return [shades[Math.abs(hash) % shades.length], ''];
}

export function formatIndian(val, opts = {}) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, ...opts }).format(val);
}

export function formatCurrency(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(val);
}

export function formatPercent(val, decimals = 2) {
  const n = Number(val);
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}
