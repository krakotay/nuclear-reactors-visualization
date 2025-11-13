
export const REACTOR_TYPE_COLORS: { [key: string]: string } = {
  PWR: '#3b82f6',     // Pressurized Water Reactor (Blue)
  BWR: '#22c55e',     // Boiling Water Reactor (Green)
  PHWR: '#f97316',    // Pressurized Heavy-Water Reactor (Orange)
  GCR: '#f59e0b',     // Gas-Cooled Reactor (Amber)
  LWGR: '#ef4444',    // Light Water Graphite-moderated Reactor (Red)
  FBR: '#a855f7',     // Fast Breeder Reactor (Purple)
  HTGR: '#14b8a6',    // High-Temperature Gas-Cooled Reactor (Teal)
  HWGCR: '#eab308',   // Heavy Water Gas-Cooled Reactor (Yellow)
  HWLWR: '#ec4899',   // Heavy Water Light Water Reactor (Pink)
  SFR: '#8b5cf6',     // Sodium-Cooled Fast Reactor (Violet)
  DEFAULT: '#6b7280', // Default/Unknown (Gray)
};

/**
 * Generates a consistent, pseudo-random color based on a string input.
 * Used to assign a unique color to each country.
 * @param str The input string (e.g., country name).
 * @returns A hex color code as a string.
 */
export const generateColorForString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    // Ensure colors are not too dark
    const brightenedValue = Math.min(255, value + 50);
    color += ('00' + brightenedValue.toString(16)).substr(-2);
  }
  return color;
};
