'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md';
}

export default function IconButton({
  className,
  children,
  size = 'md',
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
  };

  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-2xl transition-all duration-200',
        'hover:bg-green-50 active:scale-95',
        'text-neutral-600 hover:text-green-600',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

