import { Layers } from 'lucide-react'
import { Input } from '../../ui/Input'
import { InspectorSection } from './InspectorSection'
import type { ElementEditorProps } from './types'
import { useT } from '@renderer/i18n'

export function LayerInspector({
  draft,
  onDraftChange
}: ElementEditorProps): React.JSX.Element {
  const t = useT()
  return (
    <InspectorSection
      title={t('sessionDetail.zIndex')}
      icon={<Layers className="h-3.5 w-3.5 text-[var(--color-fg-tertiary)]" />}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-default)]/40 bg-[var(--color-bg-subtle)]/40 text-[13px] font-medium text-[var(--color-fg-secondary)] transition-colors hover:bg-[var(--color-brand-subtle)]/60"
          onClick={() => {
            const current = parseInt(draft.layoutZIndex || '0', 10) || 0
            onDraftChange(
              { ...draft, layoutZIndex: String(Math.max(0, current - 1)) },
              { commit: true, fields: ['layoutZIndex'] }
            )
          }}
          aria-label={t('sessionDetail.decrease')}
        >
          -
        </button>
        <Input
          type="number"
          min={0}
          max={9999}
          value={draft.layoutZIndex}
          onChange={(event) => onDraftChange({ ...draft, layoutZIndex: event.target.value })}
          onBlur={(event) =>
            onDraftChange(
              { ...draft, layoutZIndex: event.target.value },
              { commit: true, fields: ['layoutZIndex'] }
            )
          }
          className="h-8 flex-1 rounded-full border border-[var(--color-border-default)]/72 bg-[#ffffff]/88 px-2.5 text-center text-xs text-[var(--color-fg-default)] shadow-[inset_0_1px_2px_rgba(74,59,42,0.05)] focus-visible:border-[var(--color-brand-hover)] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-default)]/40 bg-[var(--color-bg-subtle)]/40 text-[13px] font-medium text-[var(--color-fg-secondary)] transition-colors hover:bg-[var(--color-brand-subtle)]/60"
          onClick={() => {
            const current = parseInt(draft.layoutZIndex || '0', 10) || 0
            onDraftChange(
              { ...draft, layoutZIndex: String(Math.min(9999, current + 1)) },
              { commit: true, fields: ['layoutZIndex'] }
            )
          }}
          aria-label={t('sessionDetail.increase')}
        >
          +
        </button>
      </div>
    </InspectorSection>
  )
}
