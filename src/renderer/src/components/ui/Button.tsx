import { cn } from '@renderer/lib/utils'
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium leading-none transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ring)] focus-visible:ring-offset-0',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:shrink-0',
        {
          'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-active)]':
            variant === 'default',
          'bg-[var(--color-bg-muted)] text-[var(--color-fg-default)] hover:bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)]':
            variant === 'secondary',
          'bg-[var(--color-danger)] text-white hover:brightness-95 active:brightness-90':
            variant === 'destructive',
          'border border-[var(--color-border-default)] bg-white text-[var(--color-fg-default)] hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-strong)]':
            variant === 'outline',
          'bg-transparent text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg-default)]':
            variant === 'ghost'
        },
        {
          'h-7 px-2.5 text-xs': size === 'sm',
          'h-8 px-3 text-sm': size === 'md',
          'h-10 px-4 text-sm': size === 'lg'
        },
        className
      )}
      {...props}
    />
  )
}
