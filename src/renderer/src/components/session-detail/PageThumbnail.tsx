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
            'group relative block w-full min-w-0 overflow-hidden rounded-[1.25rem] p-1.5 text-left transition-all duration-200',
            onSelect ? 'cursor-pointer' : 'cursor-default opacity-60',
            isSelected
              ? 'bg-[var(--color-brand-subtle)]/86 shadow-[0_14px_26px_rgba(124,58,237,0.10)]'
              : 'bg-[var(--color-border-default)]/34 hover:bg-[var(--color-border-default)]/68 hover:shadow-[0_8px_18px_rgba(124,58,237,0.10)]'
          )}
        >
          <div
            className={cn(
              'pointer-events-none absolute -right-7 -top-8 h-20 w-20 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] transition-opacity',
              isSelected
                ? 'bg-[var(--color-brand-hover)]/24 opacity-100'
                : 'bg-[var(--color-brand-subtle)]/28 opacity-0 group-hover:opacity-100'
            )}
          />
          <div
            className={cn(
              'relative h-[106px] w-full overflow-hidden rounded-[1rem] bg-[var(--color-bg-subtle)]/88 shadow-[0_5px_14px_rgba(124,58,237,0.10)]',
              isSelected
                ? 'shadow-[0_6px_16px_rgba(124,58,237,0.10)]'
                : 'group-hover:shadow-[0_6px_15px_rgba(124,58,237,0.10)]'
            )}
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
          <div className="relative mt-1.5 flex items-center justify-between gap-1 px-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-fg-secondary)]">
              P{page.pageNumber}
            </span>
            {isSelected ? (
              <span className="rounded-full bg-[var(--color-brand)] px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-[0_3px_8px_rgba(62,74,50,0.18)]">
                {t('sessionDetail.current')}
              </span>
            ) : null}
          </div>
          <div
            className="relative mt-0.5 block w-full min-w-0 max-w-full overflow-hidden whitespace-normal break-words px-0.5 text-[11px] font-medium leading-4 text-[var(--color-fg-secondary)]"
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
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-fg-tertiary)]">
            {t('sessionDetail.pageNumber', { pageNumber: page.pageNumber })}
          </div>
          <div className="mt-0.5 text-sm font-medium text-[var(--color-fg-default)]">{page.title}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
})
