/**
 * Color Constants
 * Pokemon TCG Energy-Type Color Palette
 *
 * These match the CSS custom properties in tokens.css
 * Use these for programmatic color manipulation or dynamic styles
 */

export const energyColors = {
  fire: {
    base: 'hsl(10, 90%, 55%)',
    light: 'hsl(10, 90%, 65%)',
    dark: 'hsl(10, 90%, 45%)',
  },
  water: {
    base: 'hsl(210, 85%, 60%)',
    light: 'hsl(210, 85%, 70%)',
    dark: 'hsl(210, 85%, 50%)',
  },
  electric: {
    base: 'hsl(55, 95%, 65%)',
    light: 'hsl(55, 95%, 75%)',
    dark: 'hsl(55, 95%, 55%)',
  },
  grass: {
    base: 'hsl(120, 60%, 50%)',
    light: 'hsl(120, 60%, 60%)',
    dark: 'hsl(120, 60%, 40%)',
  },
  psychic: {
    base: 'hsl(280, 70%, 65%)',
    light: 'hsl(280, 70%, 75%)',
    dark: 'hsl(280, 70%, 55%)',
  },
  fighting: {
    base: 'hsl(20, 80%, 55%)',
    light: 'hsl(20, 80%, 65%)',
    dark: 'hsl(20, 80%, 45%)',
  },
  darkness: {
    base: 'hsl(0, 0%, 20%)',
    light: 'hsl(0, 0%, 30%)',
    dark: 'hsl(0, 0%, 10%)',
  },
  metal: {
    base: 'hsl(0, 0%, 60%)',
    light: 'hsl(0, 0%, 70%)',
    dark: 'hsl(0, 0%, 50%)',
  },
  fairy: {
    base: 'hsl(320, 80%, 70%)',
    light: 'hsl(320, 80%, 80%)',
    dark: 'hsl(320, 80%, 60%)',
  },
} as const;

export const holographicGradient = `linear-gradient(
  135deg,
  ${energyColors.psychic.base} 0%,
  ${energyColors.water.base} 25%,
  ${energyColors.grass.light} 50%,
  ${energyColors.electric.base} 75%,
  ${energyColors.fire.base} 100%
)`;

export const rareGradient = `linear-gradient(
  135deg,
  ${energyColors.electric.base} 0%,
  ${energyColors.fire.base} 50%,
  ${energyColors.psychic.base} 100%
)`;

/**
 * Get energy color by type name
 */
export function getEnergyColor(type: keyof typeof energyColors, variant: 'base' | 'light' | 'dark' = 'base'): string {
  return energyColors[type][variant];
}

/**
 * Notification channel colors
 * Maps to energy types for consistency
 */
export const notificationColors = {
  discord: energyColors.psychic.base,   // Purple
  email: energyColors.water.base,       // Blue
  telegram: energyColors.electric.base, // Yellow
} as const;
