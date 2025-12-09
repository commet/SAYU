/**
 * SAYU Button Component
 * Clean buttons with amber accent
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: [
    'bg-black text-white',
    'hover:bg-neutral-800',
    'active:bg-neutral-900',
    'shadow-sm hover:shadow-md',
  ],
  secondary: [
    'bg-neutral-100 text-black',
    'hover:bg-neutral-200',
    'active:bg-neutral-300',
  ],
  outline: [
    'border-2 border-black text-black bg-white',
    'hover:bg-black hover:text-white',
    'active:bg-neutral-900',
  ],
  ghost: [
    'text-black bg-transparent',
    'hover:bg-neutral-100',
    'active:bg-neutral-200',
  ],
  link: [
    'text-black underline-offset-4',
    'hover:underline',
  ],
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-sayu-accent focus:ring-offset-2',

        // Variant
        variantClasses[variant],

        // Size
        sizeClasses[size],

        // Full width
        fullWidth && 'w-full',

        // Disabled state
        (disabled || loading) && 'opacity-50 cursor-not-allowed',

        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
