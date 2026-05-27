import type { ReactNode } from 'react'

export function InspectorSection({
  title,
  icon,
  children
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}): React.JSX.Element {
  return (
    <section className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] font-medium text-[var(--color-fg-tertiary)]">{title}</span>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  )
}
