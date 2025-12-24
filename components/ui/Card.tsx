'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl shadow-md border',
        className
      )}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

