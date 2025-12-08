/**
 * SAYU Typography Components
 * Semantic text components with consistent styling
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Heading Component
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  serif?: boolean;
  children: React.ReactNode;
}

const headingClasses = {
  h1: 'text-5xl font-bold leading-tight',
  h2: 'text-4xl font-bold leading-tight',
  h3: 'text-3xl font-semibold leading-snug',
  h4: 'text-2xl font-semibold leading-snug',
  h5: 'text-xl font-semibold leading-normal',
  h6: 'text-lg font-semibold leading-normal',
};

export function Heading({
  as: Component = 'h2',
  serif = true,
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Component
      className={cn(
        headingClasses[Component],
        serif ? 'font-heading' : 'font-body',
        'text-sayu-black',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// Text Component
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent';
  children: React.ReactNode;
}

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const textWeightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textColorClasses = {
  primary: 'text-sayu-black',
  secondary: 'text-sayu-dark-gray',
  tertiary: 'text-sayu-mid-gray',
  accent: 'text-sayu-accent',
};

export function Text({
  size = 'base',
  weight = 'normal',
  color = 'primary',
  className,
  children,
  ...props
}: TextProps) {
  return (
    <p
      className={cn(
        'font-body leading-normal',
        textSizeClasses[size],
        textWeightClasses[weight],
        textColorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Label Component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium text-sayu-dark-gray',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-sayu-error ml-1">*</span>}
    </label>
  );
}

// Caption Component
export function Caption({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'text-xs text-sayu-mid-gray',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
