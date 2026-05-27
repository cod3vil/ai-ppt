import { useEffect, forwardRef } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { useSessionDetailUiStore } from '@renderer/store/sessionDetailStore'
import { PreviewIframe, type PreviewIframeHandle } from '../preview/PreviewIframe'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip'
import type { EditModeMovePayload, EditSelectionPayload } from '../preview/edit-mode-script'
import type { SessionPreviewPage } from './types'
import { useT } from '@renderer/i18n'

export const PreviewStage = forwardRef<
  PreviewIframeHandle,
  {
    selectedPage: SessionPreviewPage | null
    sessionTitle?: string | null
    isGenerating: boolean
    progressLabel?: string
    previewRefreshKey?: number
    onElementMoved: (payload: EditModeMovePayload) => void
    onElementSelected: (payload: EditSelectionPayload) => void
    onCancelTextEdit: () => void
    onDiscardAllEdits: () => void
    onReplayPendingEdits: () => void
    onDeleteRequest?: (selector: string) => void
  }
>(function PreviewStage(
  {
    selectedPage,
    sessionTitle,
    isGenerating,
    progressLabel,
    previewRefreshKey = 0,
    onElementMoved,
    onElementSelected,
    onCancelTextEdit,
    onDiscardAllEdits,
    onReplayPendingEdits,
    onDeleteRequest
  },
  ref
) {
  const t = useT()
  const previewKey = useSessionDetailUiStore((state) => state.previewKey)
  const interactionMode = useSessionDetailUiStore((state) => state.interactionMode)
  const setInteractionMode = useSessionDetailUiStore((state) => state.setInteractionMode)
  const setSelectedElement = useSessionDetailUiStore((state) => state.setSelectedElement)
  const displayTitle = sessionTitle || t('sessionDetail.sessionFallback')

  const isEditing = interactionMode === 'edit'
  const isInspecting = interactionMode === 'ai-inspect'

  useEffect(() => {
    if (interactionMode === 'preview') return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        if (isEditing) {
          onDiscardAllEdits()
        } else {
          setInteractionMode('preview')
          onCancelTextEdit()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [interactionMode, isEditing, onDiscardAllEdits, onCancelTextEdit, setInteractionMode])

  return (
    <main className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-1">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] p-3 shadow-[var(--elevation-sm)]">
        {selectedPage ? (
          <div className="relative h-full overflow-hidden rounded-md border border-[var(--color-border-default)] bg-white">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-3 top-3 z-20 max-w-[calc(100%-1.5rem)] truncate rounded border-l-2 border-[var(--color-brand)] bg-white/95 px-2.5 py-1 text-xs font-medium leading-5 text-[var(--color-fg-default)] shadow-[var(--elevation-sm)] sm:max-w-[460px]">
                  {displayTitle}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                {displayTitle}
              </TooltipContent>
            </Tooltip>
            <PreviewIframe
              ref={ref}
              key={`preview-${selectedPage.pageId}-${previewKey}-${previewRefreshKey}`}
              src={selectedPage.sourceUrl}
              htmlPath={selectedPage.htmlPath}
              pageId={selectedPage.pageId}
              title={`preview-page-${selectedPage.pageNumber}`}
              inspectable
              interactionMode={interactionMode}
              inspecting={isInspecting}
              editMode={isEditing}
              onSelectorSelected={setSelectedElement}
              onElementMoved={onElementMoved}
              onElementSelected={onElementSelected}
              onInspectExit={() => {
                setInteractionMode('preview')
                onCancelTextEdit()
              }}
              onDidReload={onReplayPendingEdits}
              onDeleteRequest={onDeleteRequest}
            />
            {selectedPage.status === 'failed' && (
              <div className="absolute bottom-4 left-4 z-20 max-w-[520px] rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[var(--color-danger)] shadow-[var(--elevation-sm)]">
                {t('sessionDetail.failedPageHint')}
              </div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2.5 rounded-md border border-[var(--color-border-default)] bg-white px-6 py-4 shadow-[var(--elevation-lg)]">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--color-brand)]" />
                  {progressLabel ? (
                    <p className="text-sm text-[var(--color-fg-secondary)]">{progressLabel}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[var(--color-border-default)] bg-white text-center text-[var(--color-fg-secondary)]">
            {isGenerating ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
            ) : (
              <Sparkles className="h-6 w-6 text-[var(--color-fg-tertiary)]" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--color-fg-default)]">
                {t('sessionDetail.emptyPreviewTitle')}
              </p>
              <p className="text-xs text-[var(--color-fg-tertiary)]">
                {isGenerating ? t('sessionDetail.preparingPreview') : t('sessionDetail.briefHint')}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
})
