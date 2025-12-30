/**
 * useScrollReveal Hook
 *
 * Detects when an element enters the viewport using Intersection Observer.
 * Useful for triggering animations on scroll.
 *
 * Triggers once by default (doesn't re-trigger when element leaves and re-enters viewport).
 */

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  /**
   * Percentage of element that must be visible to trigger
   * @default 0.1 (10%)
   */
  threshold?: number;

  /**
   * Margin around the viewport for early/late triggering
   * @default '0px'
   * @example '100px' - Trigger 100px before element enters viewport
   */
  rootMargin?: string;

  /**
   * Whether to trigger animation each time element enters viewport
   * @default false (trigger once)
   */
  triggerOnce?: boolean;

  /**
   * Whether to start as visible (useful for SSR or initial viewport elements)
   * @default false
   */
  initiallyVisible?: boolean;
}

interface ScrollRevealReturn<T extends HTMLElement> {
  /**
   * Ref to attach to the element you want to observe
   */
  ref: React.RefObject<T>;

  /**
   * Whether the element is currently visible in the viewport
   */
  isVisible: boolean;

  /**
   * Whether the element has been visible at least once
   */
  hasBeenVisible: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): ScrollRevealReturn<T> {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    initiallyVisible = false,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(initiallyVisible);
  const [hasBeenVisible, setHasBeenVisible] = useState(initiallyVisible);

  useEffect(() => {
    const element = ref.current;

    // If no element or Intersection Observer not supported, default to visible
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        setIsVisible(isIntersecting);

        // Mark as visible once it enters viewport
        if (isIntersecting) {
          setHasBeenVisible(true);

          // If triggerOnce, disconnect observer after first trigger
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    ref,
    isVisible,
    hasBeenVisible,
  };
}

/**
 * Variant that returns multiple refs for staggered animations
 * Useful for animating lists with delays
 */
export function useStaggeredScrollReveal<T extends HTMLElement = HTMLDivElement>(
  count: number,
  options: ScrollRevealOptions = {}
): Array<ScrollRevealReturn<T>> {
  const reveals = Array.from({ length: count }, () => useScrollReveal<T>(options));
  return reveals;
}

/**
 * Simpler variant that only returns a boolean
 * For cases where you don't need the ref (controlling animation from parent)
 */
export function useIsInView<T extends HTMLElement = HTMLDivElement>(
  elementRef: React.RefObject<T>,
  options: ScrollRevealOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(options.initiallyVisible || false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);

        if (entry.isIntersecting && options.triggerOnce) {
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options.threshold, options.rootMargin, options.triggerOnce]);

  return isInView;
}
