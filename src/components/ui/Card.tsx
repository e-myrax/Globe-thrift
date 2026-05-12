import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'outline' | 'solid';
  hoverable?: boolean;
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export const Card = ({ className, variant = 'glass', hoverable = false, children, ...props }: CardProps) => {
  const variants = {
    glass: 'glass-morphism',
    outline: 'border border-slate-800 bg-transparent',
    solid: 'bg-slate-900 border border-slate-800',
  };

  return (
    <div
      className={cn(
        'rounded-3xl p-6 transition-all duration-500',
        variants[variant],
        hoverable && 'hover:translate-y-[-4px] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] hover:border-white/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-xl font-bold text-white mb-2 font-display leading-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-slate-400', className)} {...props}>
    {children}
  </p>
);
