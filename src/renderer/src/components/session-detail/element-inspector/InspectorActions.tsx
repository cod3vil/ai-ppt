import { Copy, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../../ui/AlertDialog'
import { useT } from '@renderer/i18n'

export function InspectorActions({
  onCopy,
  onDelete
}: {
  onCopy?: () => void
  onDelete?: () => void
}): React.JSX.Element {
  const t = useT()
  return (
    <div className="flex gap-2 px-0.5 pb-1 pt-1">
      {onCopy && (
        <button
          type="button"
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--color-border-default)]/40 bg-[#ffffff]/60 text-xs font-medium text-[var(--color-fg-secondary)] transition-colors hover:bg-[var(--color-brand-subtle)]/60"
          onClick={onCopy}
        >
          <Copy className="h-3.5 w-3.5" />
          {t('sessionDetail.copyElement')}
        </button>
      )}
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e8c8c6]/80 bg-[#ffffff]/60 text-xs font-medium text-[var(--color-danger)] transition-colors hover:border-[var(--color-danger)]/40 hover:bg-[#fef2f2] hover:shadow-[0_4px_12px_rgba(192,57,43,0.1)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('sessionDetail.deleteElement')}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>{t('sessionDetail.deleteElement')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sessionDetail.deleteElementConfirm')}
            </AlertDialogDescription>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]"
                onClick={onDelete}
              >
                {t('common.delete')}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
