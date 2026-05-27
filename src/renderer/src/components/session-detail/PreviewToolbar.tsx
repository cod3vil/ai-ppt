import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  ImagePlus,
  Loader2,
  Pencil,
  Redo2,
  Sparkles,
  Undo2,
  Video
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useSessionDetailUiStore } from '@renderer/store/sessionDetailStore'
import { useToastStore } from '@renderer/store/toastStore'
import { Button } from '../ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/DropdownMenu'
import { useT } from '@renderer/i18n'
import type { SessionPreviewPage } from './types'

interface PreviewToolbarProps {
  selectedPage: SessionPreviewPage | null
  isGenerating: boolean
  isSavingEdits: boolean
  canUndo: boolean
  canRedo: boolean
  hasPendingEdits: boolean
  onUndo: () => void
  onRedo: () => void
  onSaveAllEdits: () => void
  onDiscardAllEdits: () => void
  onAddFromLibrary: (type: 'image' | 'video') => void
  onAddFromLocal: (type: 'image' | 'video') => void
}

export function PreviewToolbar({
  selectedPage,
  isGenerating,
  isSavingEdits,
  canUndo,
  canRedo,
  hasPendingEdits,
  onUndo,
  onRedo,
  onSaveAllEdits,
  onDiscardAllEdits,
  onAddFromLibrary,
  onAddFromLocal
}: PreviewToolbarProps) {
  const t = useT()
  const toast = useToastStore()
  const [isPreviewSettling, setIsPreviewSettling] = useState(false)
  const interactionMode = useSessionDetailUiStore((s) => s.interactionMode)
  const setInteractionMode = useSessionDetailUiStore((s) => s.setInteractionMode)
  const clearSelectedElement = useSessionDetailUiStore((s) => s.clearSelectedElement)
  const selectedPageKey = selectedPage?.htmlPath
    ? `${selectedPage.pageId}:${selectedPage.htmlPath}`
    : ''

  useEffect(() => {
    if (!selectedPageKey) {
      setIsPreviewSettling(false)
      return
    }
    setIsPreviewSettling(true)
    const timer = window.setTimeout(() => {
      setIsPreviewSettling(false)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [selectedPageKey])

  if (!selectedPage?.htmlPath) return null

  const isEditing = interactionMode === 'edit'
  const toolbarDisabled = isGenerating || isSavingEdits || isPreviewSettling

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-3 px-4 pb-1.5 pt-2 transition-opacity duration-200',
        isPreviewSettling && 'pointer-events-none opacity-0'
      )}
    >
      {/* Left: Mode switcher pill */}
      <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-[var(--color-border-default)] bg-white p-0.5 shadow-[var(--elevation-md)]">
        <button
          type="button"
          className={cn(
            'inline-flex h-7 min-w-[52px] shrink-0 items-center justify-center rounded px-2 text-[10px] font-semibold leading-none transition-colors',
            interactionMode === 'preview'
              ? 'bg-[var(--color-brand)] text-white '
              : 'text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)]'
          )}
          onClick={() => {
            if (interactionMode !== 'preview') {
              if (isEditing) onDiscardAllEdits()
              setInteractionMode('preview')
            }
          }}
          disabled={toolbarDisabled}
        >
          {t('sessionDetail.previewMode')}
        </button>
        <button
          type="button"
          className={cn(
            'inline-flex h-7 min-w-[52px] shrink-0 items-center justify-center rounded px-2 text-[10px] font-semibold leading-none transition-colors',
            interactionMode === 'edit'
              ? 'bg-[var(--color-brand)] text-white '
              : 'text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)]'
          )}
          onClick={() => {
            if (interactionMode !== 'edit') {
              setInteractionMode('edit')
              toast.info(t('sessionDetail.editModeToast'))
            }
          }}
          disabled={toolbarDisabled}
        >
          <Pencil className="mr-0.5 h-2.5 w-2.5" />
          {t('sessionDetail.editMode')}
        </button>
        <button
          type="button"
          className={cn(
            'inline-flex h-7 min-w-[52px] shrink-0 items-center justify-center rounded px-2 text-[10px] font-semibold leading-none transition-colors',
            interactionMode === 'ai-inspect'
              ? 'bg-[var(--color-brand)] text-white '
              : 'text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)]'
          )}
          onClick={() => {
            if (interactionMode !== 'ai-inspect') {
              if (isEditing) onDiscardAllEdits()
              setInteractionMode('ai-inspect')
              toast.info(t('sessionDetail.inspectActiveToast'))
            }
          }}
          disabled={toolbarDisabled}
        >
          <Sparkles className="mr-0.5 h-2.5 w-2.5" />
          {t('sessionDetail.aiMode')}
        </button>
      </div>

      {/* Right: Context actions */}
      <div className="ml-auto flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isEditing && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 shrink-0 rounded border border-[var(--color-border-default)] bg-white px-2 text-[10px] leading-none text-[var(--color-brand)] shadow-[var(--elevation-sm)] hover:bg-[var(--color-brand-subtle)] disabled:opacity-40"
              onClick={onUndo}
              disabled={toolbarDisabled || !canUndo}
            >
              <Undo2 className="mr-0.5 h-2.5 w-2.5" />
              {t('sessionDetail.undo')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 shrink-0 rounded border border-[var(--color-border-default)] bg-white px-2 text-[10px] leading-none text-[var(--color-brand)] shadow-[var(--elevation-sm)] hover:bg-[var(--color-brand-subtle)] disabled:opacity-40"
              onClick={onRedo}
              disabled={toolbarDisabled || !canRedo}
            >
              <Redo2 className="mr-0.5 h-2.5 w-2.5" />
              {t('sessionDetail.redo')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded border border-[var(--color-border-default)] bg-white px-2 text-[10px] font-semibold leading-none text-[var(--color-brand)] shadow-[var(--elevation-sm)] hover:bg-[var(--color-brand-subtle)]"
                >
                  <ImagePlus className="mr-0.5 h-2.5 w-2.5" />
                  {t('editMode.addImage')}
                  <ChevronDown className="ml-0.5 h-2.5 w-2.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuItem onClick={() => onAddFromLibrary('image')}>
                  {t('editMode.fromLibrary')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddFromLocal('image')}>
                  {t('editMode.fromLocal')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded border border-[var(--color-border-default)] bg-white px-2 text-[10px] font-semibold leading-none text-[var(--color-brand)] shadow-[var(--elevation-sm)] hover:bg-[var(--color-brand-subtle)]"
                >
                  <Video className="mr-0.5 h-2.5 w-2.5" />
                  {t('editMode.addVideo')}
                  <ChevronDown className="ml-0.5 h-2.5 w-2.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[10rem]">
                <DropdownMenuItem onClick={() => onAddFromLibrary('video')}>
                  {t('editMode.fromLibrary')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddFromLocal('video')}>
                  {t('editMode.fromLocal')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        {isEditing && hasPendingEdits && (
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-7 shrink-0 rounded bg-[var(--color-brand)] px-2 text-[10px] leading-none text-white "
            onClick={onSaveAllEdits}
            disabled={toolbarDisabled}
          >
            {isSavingEdits ? (
              <Loader2 className="mr-0.5 h-2.5 w-2.5 animate-spin" />
            ) : (
              <Check className="mr-0.5 h-2.5 w-2.5" />
            )}
            {t('sessionDetail.exitAndSave')}
          </Button>
        )}
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 rounded border border-transparent bg-[var(--color-brand-subtle)] px-2 text-[10px] leading-none text-[var(--color-fg-default)]  hover:bg-[#c8ddb2]"
            onClick={onDiscardAllEdits}
            disabled={toolbarDisabled}
          >
            {t('sessionDetail.exitEditMode')}
          </Button>
        )}
        {interactionMode === 'ai-inspect' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 rounded border border-transparent bg-[var(--color-brand-subtle)] px-2 text-[10px] leading-none text-[var(--color-fg-default)]  hover:bg-[#c8ddb2]"
            onClick={() => {
              clearSelectedElement()
              setInteractionMode('preview')
            }}
            disabled={toolbarDisabled}
          >
            {t('sessionDetail.exitAiMode')}
          </Button>
        )}
      </div>
    </div>
  )
}
