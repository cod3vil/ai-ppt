import { memo } from 'react'
import { cn } from '@renderer/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip'
import { PreviewIframe } from '../preview/PreviewIframe'
import type { SessionPreviewPage } from './types'
import { useT } from '@renderer/i18n'

export const PageThumbnail = memo(function PageThumbnail({
  page,
  isSelected,
  previewVersion,
  onSelect,
  actions
}: {
  page: SessionPreviewPage
  isSelected: boolean
  previewVersion: number
  onSelect?: (pageId: string) => void
  actions?: React.ReactNode
}): React.JSX.Element {
  const t = useT()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={onSelect ? () => onSelect(page.id) : undefined}
          aria-disabled={!onSelect}
          className={cn(
            'group relative block w-full min-w-0 overflow-hidden rounded-md p-1.5 text-left transition-colors',
            onSelect ? 'cursor-pointer' : 'cursor-default opacity-60',
            isSelected
              ? 'bg-[var(--color-brand-subtle)] ring-1 ring-[var(--color-brand)]'
              : 'hover:bg-[var(--color-bg-muted)]'
          )}
        >
          <div
            className="relative h-[106px] w-full overflow-hidden rounded border border-[var(--color-border-default)] bg-white"
            style={{ contain: 'paint' }}
          >
            <PreviewIframe
              key={`thumb-${page.id}-${previewVersion}`}
              src={page.sourceUrl}
              htmlPath={page.htmlPath}
              pageId={page.pageId}
              title={`filmstrip-page-${page.pageNumber}`}
              inspectable={false}
              thumbnail
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                isSelected ? 'text-[var(--color-brand)]' : 'text-[var(--color-fg-tertiary)]'
              )}
            >
              P{page.pageNumber}
            </span>
            {isSelected ? (
              <span className="rounded-full bg-[var(--color-brand)] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                {t('sessionDetail.current')}
              </span>
            ) : null}
          </div>
          <div
            className="mt-0.5 block w-full min-w-0 max-w-full overflow-hidden whitespace-normal break-words px-0.5 text-[11px] font-medium leading-4 text-[var(--color-fg-secondary)]"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {page.title}
          </div>
          {actions}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" align="start">
        <div className="max-w-[240px]">
          <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {t('sessionDetail.pageNumber', { pageNumber: page.pageNumber })}
          </div>
          <div className="mt-0.5 text-sm font-medium">{page.title}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
})
