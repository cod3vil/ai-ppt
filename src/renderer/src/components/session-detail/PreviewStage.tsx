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
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] bg-[var(--color-border-default)]/54 p-3 shadow-[0_18px_38px_rgba(124,58,237,0.10)]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] bg-[var(--color-brand-subtle)]/42" />
        <div className="pointer-events-none absolute -bottom-24 left-8 h-48 w-64 rounded-[5%_95%_10%_90%/85%_15%_85%_15%] bg-[var(--color-border-default)]/20" />
        {selectedPage ? (
          <div className="relative h-full overflow-hidden rounded-[1.55rem] bg-[var(--color-bg-subtle)] p-2 shadow-[0_10px_24px_rgba(124,58,237,0.10)]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-3 top-3 z-20 max-w-[calc(100%-1.5rem)] truncate border-l-2 border-[#7f9468] bg-[#ffffff]/68 px-3 py-1.5 text-sm font-medium leading-5 text-[var(--color-fg-default)] shadow-[0_6px_16px_rgba(16,24,40,0.06)] backdrop-blur-md sm:max-w-[460px]">
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
              <div className="absolute bottom-5 left-5 z-20 max-w-[520px] rounded-[1rem] bg-[#fef2f2]/92 px-3 py-2 text-xs text-[var(--color-danger)] shadow-[0_10px_24px_rgba(142,90,83,0.12)] backdrop-blur-sm">
                {t('sessionDetail.failedPageHint')}
              </div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[1.55rem] bg-[var(--color-bg-subtle)]/68 backdrop-blur-sm transition-opacity">
                <div className="flex flex-col items-center gap-3 rounded-[1.5rem] bg-[var(--color-border-default)]/88 px-8 py-5 shadow-[0_14px_30px_rgba(16,24,40,0.06)]">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
                  {progressLabel ? <p className="text-sm text-[#5a674b]">{progressLabel}</p> : null}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center gap-4 rounded-[1.55rem] bg-[var(--color-bg-subtle)]/84 text-center text-[var(--color-brand)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32)]">
            {isGenerating ? (
              <Loader2 className="h-7 w-7 animate-spin text-[var(--color-brand)]" />
            ) : (
              <Sparkles className="h-7 w-7 text-[var(--color-brand-hover)]" />
            )}
            <div className="space-y-1">
              <p className="text-base font-medium text-[var(--color-fg-default)]">
                {t('sessionDetail.emptyPreviewTitle')}
              </p>
              <p className="text-sm">
                {isGenerating ? t('sessionDetail.preparingPreview') : t('sessionDetail.briefHint')}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
})
