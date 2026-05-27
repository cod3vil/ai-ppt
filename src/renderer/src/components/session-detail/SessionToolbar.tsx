import { ChevronDown, History, Image as ImageIcon, LayoutTemplate, Loader2, Presentation } from 'lucide-react'
import { useSessionDetailUiStore } from '@renderer/store/sessionDetailStore'
import { Button } from '../ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/DropdownMenu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip'
import { useT } from '@renderer/i18n'

const dropdownItemIconClass = 'h-3.5 w-3.5 text-[var(--color-fg-tertiary)]'

export function SessionToolbar({
  hasPages,
  historyDisabled = false,
  onExportPptx,
  onOpenHistory,
  onSaveTemplate
}: {
  hasPages: boolean
  historyDisabled?: boolean
  onExportPptx: (options?: {
    imageOnly?: boolean
    embedFonts?: boolean | 'auto' | 'always' | 'never'
  }) => void
  onOpenHistory: () => void
  onSaveTemplate?: () => void
}): React.JSX.Element {
  const t = useT()

  const isExportingPptx = useSessionDetailUiStore((state) => state.isExportingPptx)

  if (!hasPages) return <></>

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            disabled={historyDisabled || isExportingPptx}
          >
            <History className="h-3.5 w-3.5" />
            {t('sessionDetail.history')}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          {t('sessionDetail.historyTooltip')}
        </TooltipContent>
      </Tooltip>

      {onSaveTemplate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSaveTemplate}
              disabled={isExportingPptx}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              {t('sessionDetail.saveTemplate')}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            {t('sessionDetail.saveTemplateTooltip')}
          </TooltipContent>
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" disabled={isExportingPptx}>
            {isExportingPptx ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Presentation className="h-3.5 w-3.5" />
            )}
            {t('sessionDetail.exportPptx')}
            {!isExportingPptx && <ChevronDown className="h-3 w-3" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[14rem]">
          <DropdownMenuItem onClick={() => onExportPptx()}>
            <Presentation className={dropdownItemIconClass} />
            {t('sessionDetail.exportPptxEditable')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExportPptx({ imageOnly: true })}>
            <ImageIcon className={dropdownItemIconClass} />
            {t('sessionDetail.exportPptxImageOnly')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
