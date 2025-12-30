/**
 * useReducedMotion Hook
 *
 * Detects if the user has requested reduced motion via system preferences.
 * Use this to disable or simplify animations for accessibility.
 *
 * Respects the 'prefers-reduced-motion' media query.
 */

import { useEffect, useState } from 'react';

/**
 * Returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  // Default to false for SSR
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if matchMedia is supported (not available in all environments)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers support addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns a safe animation duration (0 if reduced motion is preferred)
 * Useful for programmatic animations
 *
 * @param duration - Desired animation duration in milliseconds
 * @returns 0 if reduced motion preferred, otherwise the original duration
 */
export function useSafeAnimationDuration(duration: number): number {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 0 : duration;
}

/**
 * Returns appropriate transition string based on user preference
 *
 * @param transition - CSS transition string
 * @returns 'none' if reduced motion preferred, otherwise the original transition
 */
export function useSafeTransition(transition: string): string {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 'none' : transition;
}
