/**
 * SAYU Container Component
 * Responsive layout container with consistent padding
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Container max-width */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Remove horizontal padding */
  noPadding?: boolean;
  children: React.ReactNode;
}

const containerSizeClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function Container({
  size = 'xl',
  noPadding = false,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        containerSizeClasses[size],
        !noPadding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Container;
