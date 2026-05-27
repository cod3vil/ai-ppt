import { cn } from '@renderer/lib/utils'
import React from 'react'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-8 w-full rounded-md border border-[var(--color-border-default)] bg-white px-3 py-1 text-sm text-[var(--color-fg-default)] transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-[var(--color-fg-tertiary)]',
        'focus-visible:outline-none focus-visible:border-[var(--color-brand)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ring)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-bg-muted)]',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[72px] w-full rounded-md border border-[var(--color-border-default)] bg-white px-3 py-2 text-sm text-[var(--color-fg-default)] transition-colors',
        'placeholder:text-[var(--color-fg-tertiary)]',
        'focus-visible:outline-none focus-visible:border-[var(--color-brand)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ring)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-bg-muted)]',
        className
      )}
      {...props}
    />
  )
}
