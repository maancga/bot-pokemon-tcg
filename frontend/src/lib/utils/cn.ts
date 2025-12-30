/**
 * Classname Utility
 * Combines class names with clsx
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Combines multiple class names into a single string
 * Filters out falsy values and handles conditional classes
 *
 * @example
 * cn('base-class', isActive && 'active', 'another-class')
 * // => 'base-class active another-class' (if isActive is true)
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
