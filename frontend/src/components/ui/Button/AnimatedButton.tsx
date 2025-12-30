/**
 * AnimatedButton Component
 * Interactive button with hover animations and energy-type glow
 */

import { cn } from '@lib/utils/cn';
import { useReducedMotion } from '@lib/hooks/useReducedMotion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './AnimatedButton.module.css';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button content
   */
  children: ReactNode;

  /**
   * Visual variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'holographic';

  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the button is in loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <button
      className={cn(
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        {
          [styles.buttonLoading]: loading,
          [styles.buttonReduced]: prefersReducedMotion,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className={styles.buttonContent}>
        {children}
      </span>

      {/* Glow effect on hover */}
      {!prefersReducedMotion && (
        <span className={styles.buttonGlow} aria-hidden="true" />
      )}
    </button>
  );
}
