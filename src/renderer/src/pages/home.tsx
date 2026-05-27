import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToastStore } from '../store'
import { useT } from '../i18n'
import { ipc } from '@renderer/lib/ipc'
import { ArrowRight, FileText, FileUp, Loader2, Sparkles } from 'lucide-react'

const MAX_PPTX_SIZE_MB = 80
const MAX_PPTX_SIZE_BYTES = MAX_PPTX_SIZE_MB * 1024 * 1024

export function HomePage(): ReactElement {
  const navigate = useNavigate()
  const { success, error, warning } = useToastStore()
  const t = useT()
  const [importingPptx, setImportingPptx] = useState(false)
  const [pptxImportProgress, setPptxImportProgress] = useState<string | null>(null)
  const pptxInputRef = useRef<HTMLInputElement | null>(null)

  const handleQuickCreate = useCallback(() => {
    navigate('/create/session')
  }, [navigate])

  const ensureUploadPrerequisites = useCallback(async (): Promise<boolean> => {
    const validation = await ipc.validateUploadPrerequisites()
    if (validation.ready) return true
    warning(t('home.settingsRequiredTitle'), {
      description: validation.message || t('home.settingsRequired'),
      action: {
        label: t('home.goToSettings'),
        onClick: () => navigate('/settings')
      }
    })
    return false
  }, [navigate, t, warning])

  const handleImportPptxClick = useCallback(async (): Promise<void> => {
    if (importingPptx) return
    if (!(await ensureUploadPrerequisites())) return
    pptxInputRef.current?.click()
  }, [ensureUploadPrerequisites, importingPptx])

  const handlePptxFilesSelected = useCallback(
    async (files: FileList | null): Promise<void> => {
      const selectedFiles = Array.from(files || [])
      if (pptxInputRef.current) {
        pptxInputRef.current.value = ''
      }
      if (selectedFiles.length === 0) return
      if (selectedFiles.length > 1) {
        error(t('home.pptxSingleOnlyTitle'), {
          description: t('home.pptxSingleOnly')
        })
        return
      }
      const selectedFile = selectedFiles[0]
      if (!/\.pptx$/i.test(selectedFile.name)) {
        error(t('home.unsupportedFileTitle'), {
          description: t('home.unsupportedPptx')
        })
        return
      }
      if (selectedFile.size > MAX_PPTX_SIZE_BYTES) {
        error(t('home.pptxTooLargeTitle'), {
          description: t('home.pptxTooLarge', { maxSize: MAX_PPTX_SIZE_MB })
        })
        return
      }
      const filePath = window.electron?.getPathForFile?.(selectedFile) || ''
      if (!filePath) {
        error(t('home.pptxPathFailedTitle'), {
          description: t('home.pptxPathFailed')
        })
        return
      }
      setImportingPptx(true)
      setPptxImportProgress(t('home.pptxPreparing'))
      try {
        const result = await ipc.importPptx({
          filePath,
          title: selectedFile.name.replace(/\.pptx$/i, ''),
          styleId: null
        })
        success(t('home.pptxImportDone'), {
          description:
            result.warnings.length > 0
              ? t('home.pptxImportedWithWarnings', {
                  pageCount: result.pageCount,
                  warningCount: result.warnings.length
                })
              : t('home.pptxImported', { pageCount: result.pageCount })
        })
        navigate(`/sessions/${result.sessionId}`)
      } catch (err) {
        error(t('home.pptxImportFailed'), {
          description: err instanceof Error ? err.message : t('common.retryLater')
        })
      } finally {
        setImportingPptx(false)
        setPptxImportProgress(null)
      }
    },
    [error, navigate, success, t]
  )

  useEffect(() => {
    return ipc.onPptxImportProgress((payload) => {
      setPptxImportProgress(
        `${payload.label}${payload.progress ? ` · ${payload.progress}%` : ''}`
      )
    })
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-9">
      <section className="border-b border-[var(--color-border-default)] pb-7">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-subtle)] px-3 py-1 text-[11px] font-medium text-[var(--color-brand)]">
          <Sparkles className="h-3 w-3" />
          {t('home.eyebrow')}
        </div>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-[var(--color-fg-default)] sm:text-[32px]">
          {t('home.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-fg-secondary)]">
          {t('home.description')}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleQuickCreate}
          className="group flex min-h-[220px] flex-col rounded-lg border border-[var(--color-border-default)] bg-white p-6 text-left shadow-[var(--elevation-sm)] transition-all hover:border-[var(--color-brand)] hover:shadow-[var(--elevation-md)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5">
            <h2 className="text-lg font-semibold leading-tight text-[var(--color-fg-default)]">
              {t('home.title')}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-fg-secondary)]">
              {t('home.description')}
            </p>
          </div>
          <div className="mt-auto pt-6">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--color-brand)] px-3 text-xs font-medium text-white transition-colors group-hover:bg-[var(--color-brand-hover)]">
              {t('home.createAndStart')}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => void handleImportPptxClick()}
          disabled={importingPptx}
          className="group flex min-h-[220px] flex-col rounded-lg border border-[var(--color-border-default)] bg-white p-6 text-left shadow-[var(--elevation-sm)] transition-all hover:border-[var(--color-border-strong)] hover:shadow-[var(--elevation-md)] disabled:cursor-not-allowed disabled:opacity-65"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-bg-muted)] text-[var(--color-fg-default)]">
              <FileUp className="h-5 w-5" />
            </div>
            <span className="rounded border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-secondary)]">
              PPTX
            </span>
          </div>
          <div className="mt-5">
            <h2 className="text-lg font-semibold leading-tight text-[var(--color-fg-default)]">
              {t('home.importPptx')}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-fg-secondary)]">
              {t('home.importPptxTooltip', { maxSize: MAX_PPTX_SIZE_MB })}
            </p>
          </div>
          <div className="mt-auto pt-6">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--color-border-default)] bg-white px-3 text-xs font-medium text-[var(--color-fg-default)] transition-colors group-hover:bg-[var(--color-bg-subtle)]">
              {importingPptx ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {pptxImportProgress || t('home.importingPptx')}
                </>
              ) : (
                <>
                  {t('home.importPptx')}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </span>
          </div>
        </button>
      </section>

      <input
        ref={pptxInputRef}
        type="file"
        accept=".pptx"
        multiple={false}
        className="hidden"
        onChange={(event) => void handlePptxFilesSelected(event.target.files)}
      />
    </div>
  )
}
