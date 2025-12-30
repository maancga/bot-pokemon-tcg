/**
 * useHolographicEffect Hook
 *
 * Creates a 3D tilt effect that follows mouse movement,
 * mimicking the effect of tilting a holographic Pokemon card.
 *
 * Returns mouse event handlers and computed tilt style.
 */

import { useState, useCallback, type MouseEvent, type CSSProperties } from 'react';

interface HolographicEffectOptions {
  /**
   * Maximum rotation angle in degrees
   * @default 10
   */
  maxRotation?: number;

  /**
   * Perspective distance in pixels
   * @default 1000
   */
  perspective?: number;

  /**
   * Scale factor when hovering
   * @default 1.05
   */
  scale?: number;

  /**
   * Transition duration when resetting (in ms)
   * @default 200
   */
  transitionDuration?: number;
}

interface TiltStyle extends CSSProperties {
  transform: string;
  transition?: string;
}

interface HolographicEffectReturn {
  /**
   * Handler for mouse move events
   */
  handleMouseMove: (e: MouseEvent<HTMLElement>) => void;

  /**
   * Handler for mouse leave events
   */
  handleMouseLeave: () => void;

  /**
   * Computed style object to apply to the element
   */
  tiltStyle: TiltStyle;

  /**
   * Whether the element is currently being hovered
   */
  isHovered: boolean;
}

export function useHolographicEffect(
  options: HolographicEffectOptions = {}
): HolographicEffectReturn {
  const {
    maxRotation = 10,
    perspective = 1000,
    scale = 1.05,
    transitionDuration = 200,
  } = options;

  const [tiltStyle, setTiltStyle] = useState<TiltStyle>({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
  });

  const [isHovered, setIsHovered] = useState(false);

  /**
   * Calculate tilt based on mouse position relative to element center
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const element = e.currentTarget;
      const rect = element.getBoundingClientRect();

      // Calculate mouse position relative to element center
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation based on mouse offset from center
      // Invert Y axis for natural tilt behavior
      const rotateX = ((y - centerY) / centerY) * maxRotation;
      const rotateY = ((centerX - x) / centerX) * maxRotation;

      setTiltStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: 'none', // No transition during mouse movement for immediate response
      });

      setIsHovered(true);
    },
    [maxRotation, perspective, scale]
  );

  /**
   * Reset tilt to default state
   */
  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    });

    setIsHovered(false);
  }, [perspective, transitionDuration]);

  return {
    handleMouseMove,
    handleMouseLeave,
    tiltStyle,
    isHovered,
  };
}

/**
 * Advanced variant with glare effect calculation
 * Returns additional glare position for layered effects
 */
export function useHolographicEffectWithGlare(
  options: HolographicEffectOptions = {}
) {
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const baseEffect = useHolographicEffect(options);

  const handleMouseMoveWithGlare = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      // Call base handler
      baseEffect.handleMouseMove(e);

      // Calculate glare position (0-100%)
      const element = e.currentTarget;
      const rect = element.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setGlarePosition({ x, y });
    },
    [baseEffect]
  );

  const handleMouseLeaveWithGlare = useCallback(() => {
    baseEffect.handleMouseLeave();
    setGlarePosition({ x: 50, y: 50 });
  }, [baseEffect]);

  return {
    ...baseEffect,
    handleMouseMove: handleMouseMoveWithGlare,
    handleMouseLeave: handleMouseLeaveWithGlare,
    glarePosition,
  };
}
