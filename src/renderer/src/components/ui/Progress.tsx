import { cn } from '@renderer/lib/utils'
import React from 'react'

export function Progress({
  className,
  value = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  return (
    <div
      className={cn(
        'relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]',
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[var(--color-brand)] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
