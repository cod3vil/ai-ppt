import { ChevronDown, CopyPlus, Eye, LayoutTemplate, PencilLine, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/DropdownMenu'
import type { TemplateListItem } from '@renderer/lib/ipc'
import { useT } from '@renderer/i18n'
import dayjs from 'dayjs'

export function TemplateCard({
  template,
  onUseDirect,
  onUseGenerate,
  onEdit,
  onDelete,
  onPreview
}: {
  template: TemplateListItem
  onUseDirect: (template: TemplateListItem) => void
  onUseGenerate: (template: TemplateListItem) => void
  onEdit: (template: TemplateListItem) => void
  onDelete: (template: TemplateListItem) => void
  onPreview: (template: TemplateListItem) => void
}): React.JSX.Element {
  const t = useT()

  return (
    <Card className="group !rounded-lg border-[var(--color-border-default)]/55 bg-[#ffffff]/68 shadow-none transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#cfc4b1]/85 hover:bg-[#ffffff]/82 hover:shadow-[0_10px_22px_rgba(88,75,56,0.10)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-start justify-between gap-3 text-base">
          <span className="min-w-0 truncate text-[var(--color-fg-default)]">{template.name}</span>
          <span className="shrink-0 rounded-md border border-[#fed7aa]/80 bg-[var(--color-bg-subtle)] px-2 py-1 text-[11px] font-medium text-[var(--color-fg-tertiary)]">
            {t('templates.pageCount', { count: template.pageCount })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 min-h-[40px] text-xs leading-5 text-muted-foreground">
          {template.description || t('templates.noDescription')}
        </p>
        {template.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {template.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[#fed7aa]/80 bg-[var(--color-bg-subtle)] px-1.5 py-0.5 text-[11px] text-[var(--color-fg-tertiary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e5dccd]/58 pt-3">
          <span className="min-w-0 truncate text-[11px] text-muted-foreground">
            {dayjs(template.updatedAt).format('YYYY/MM/DD HH:mm')}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <div className="flex items-center gap-1 rounded-md bg-[#f4ecdf]/52 p-0.5">
              {template.previewHtmlPath ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 rounded-[6px] p-0 text-[var(--color-fg-secondary)]"
                  onClick={() => onPreview(template)}
                  title={t('common.preview')}
                  aria-label={t('common.preview')}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 rounded-[6px] p-0 text-[var(--color-fg-secondary)]"
                onClick={() => onEdit(template)}
                title={t('common.edit')}
                aria-label={t('common.edit')}
              >
                <PencilLine className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 rounded-[6px] p-0 text-[#8a514b] hover:text-[#7a332d]"
                onClick={() => onDelete(template)}
                title={t('common.delete')}
                aria-label={t('common.delete')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-8 rounded-md px-3">
                  <CopyPlus className="mr-1.5 h-3.5 w-3.5" />
                  {t('templates.use')}
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-max min-w-[10rem] max-w-[calc(100vw-2rem)]">
                <DropdownMenuItem onSelect={() => onUseDirect(template)}>
                  <PencilLine className="h-3.5 w-3.5 shrink-0 text-[var(--color-fg-secondary)]" />
                  <span className="whitespace-nowrap">{t('templates.createEditable')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onUseGenerate(template)}>
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--color-fg-tertiary)]" />
                  <span className="whitespace-nowrap">{t('templates.createAndGenerate')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TemplateEmptyState(): React.JSX.Element {
  const t = useT()

  return (
    <div className="flex min-h-[360px] items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-[680px] flex-col items-center rounded-lg border border-dashed border-[var(--color-border-default)] bg-white px-10 py-10 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
          <LayoutTemplate className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-fg-default)]">
          {t('templates.emptyTitle')}
        </h3>
        <p className="mt-2 max-w-[520px] text-sm leading-6 text-[var(--color-fg-secondary)]">
          {t('templates.emptyDescription')}
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 py-1.5 text-xs text-[var(--color-fg-tertiary)]">
          <Plus className="h-3.5 w-3.5 text-[var(--color-brand)]" />
          {t('templates.emptyHint')}
        </div>
      </div>
    </div>
  )
}
