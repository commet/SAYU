/**
 * SAYU Card Component
 * Clean, minimal card with subtle shadow (NO glass morphism!)
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift effect */
  hover?: boolean;
  /** Card padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Border visibility */
  border?: boolean;
  /** Card as clickable element */
  clickable?: boolean;
  children: React.ReactNode;
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  hover = true,
  padding = 'md',
  border = true,
  clickable = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'bg-white rounded-lg',

        // Border
        border && 'border border-gray-200',

        // Shadow
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',

        // Hover effect
        hover && [
          'transition-all duration-200',
          'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
          'hover:-translate-y-0.5',
        ],

        // Clickable
        clickable && 'cursor-pointer',

        // Padding
        paddingClasses[padding],

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
