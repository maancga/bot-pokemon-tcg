/**
 * HolographicCard Component
 * Interactive card with 3D tilt effect and holographic shimmer
 * The signature component showcasing the Pokemon TCG aesthetic
 */

import { useHolographicEffect } from '@lib/hooks/useHolographicEffect';
import { useReducedMotion } from '@lib/hooks/useReducedMotion';
import { cn } from '@lib/utils/cn';
import type { ReactNode, CSSProperties } from 'react';
import styles from './HolographicCard.module.css';

interface HolographicCardProps {
  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;

  /**
   * Whether to show the holographic overlay effect
   * @default true
   */
  showHolographicOverlay?: boolean;

  /**
   * Maximum tilt angle in degrees
   * @default 10
   */
  maxRotation?: number;

  /**
   * Scale factor when hovering
   * @default 1.05
   */
  scale?: number;

  /**
   * Custom glow color (CSS variable or color value)
   */
  glowColor?: string;
}

export default function HolographicCard({
  children,
  className,
  style,
  showHolographicOverlay = true,
  maxRotation = 10,
  scale = 1.05,
  glowColor,
}: HolographicCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const { handleMouseMove, handleMouseLeave, tiltStyle, isHovered } = useHolographicEffect({
    maxRotation: prefersReducedMotion ? 0 : maxRotation,
    scale: prefersReducedMotion ? 1 : scale,
  });

  return (
    <div
      className={cn(styles.card, className)}
      style={{
        ...tiltStyle,
        ...style,
        ...(glowColor && { '--glow-color': glowColor } as CSSProperties),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card content */}
      <div className={styles.cardContent}>
        {children}
      </div>

      {/* Holographic overlay (appears on hover) */}
      {showHolographicOverlay && !prefersReducedMotion && (
        <div
          className={cn(styles.holographicOverlay, {
            [styles.holographicOverlayVisible]: isHovered,
          })}
          aria-hidden="true"
        />
      )}

      {/* Glow effect */}
      <div
        className={cn(styles.glowEffect, {
          [styles.glowEffectVisible]: isHovered,
        })}
        aria-hidden="true"
      />
    </div>
  );
}
