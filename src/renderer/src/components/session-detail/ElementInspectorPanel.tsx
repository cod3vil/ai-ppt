import { X } from 'lucide-react'
import type { EditSelectionPayload } from '../preview/edit-mode-script'
import { AppearanceInspector } from './element-inspector/AppearanceInspector'
import { InspectorActions } from './element-inspector/InspectorActions'
import { LayerInspector } from './element-inspector/LayerInspector'
import { LayoutInspector } from './element-inspector/LayoutInspector'
import { MediaInspector } from './element-inspector/MediaInspector'
import { TextInspector } from './element-inspector/TextInspector'
import type { ElementEditDraft } from './element-inspector/types'
import { getElementKindLabel, hasCapability } from './element-inspector/types'
import { useT } from '@renderer/i18n'

export type { ElementEditDraft } from './element-inspector/types'

export function ElementInspectorPanel({
  selection,
  draft,
  onDraftChange,
  onClose,
  onCopy,
  onDelete
}: {
  selection: EditSelectionPayload | null
  draft: ElementEditDraft
  onDraftChange: (
    draft: ElementEditDraft,
    options?: { commit?: boolean; fields?: Array<keyof ElementEditDraft> }
  ) => void
  onClose: () => void
  onDelete?: () => void
  onCopy?: () => void
}): React.JSX.Element {
  const t = useT()
  const snapshot = selection?.snapshot

  return (
    <div className="mt-1 mb-3 mr-3 flex min-h-0 w-[260px] shrink-0 flex-col overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-white shadow-[var(--elevation-sm)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-3 py-2.5">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-tertiary)]">
            {t('sessionDetail.elementInspector')}
          </div>
          {selection && (
            <div className="mt-0.5 text-[11px] text-[var(--color-fg-tertiary)]">
              {getElementKindLabel(selection)}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--color-fg-tertiary)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg-default)]"
          aria-label={t('sessionDetail.closeInspector')}
          title={t('sessionDetail.closeInspector')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
        {!selection || !snapshot ? (
          <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-3 text-center">
            <p className="whitespace-pre-line text-xs leading-5 text-[var(--color-danger)]">
              {t('sessionDetail.inspectorUnavailable')}
            </p>
          </div>
        ) : (
          <>
            <LayoutInspector selection={selection} draft={draft} onDraftChange={onDraftChange} />
            {hasCapability(selection, 'layer') && (
              <LayerInspector selection={selection} draft={draft} onDraftChange={onDraftChange} />
            )}
            {hasCapability(selection, 'text') && (
              <TextInspector selection={selection} draft={draft} onDraftChange={onDraftChange} />
            )}
            {hasCapability(selection, 'appearance') && (
              <AppearanceInspector
                selection={selection}
                draft={draft}
                onDraftChange={onDraftChange}
              />
            )}
            {hasCapability(selection, 'media') && (
              <MediaInspector selection={selection} draft={draft} onDraftChange={onDraftChange} />
            )}
          </>
        )}

        <InspectorActions onCopy={onCopy} onDelete={onDelete} />
      </div>
    </div>
  )
}
