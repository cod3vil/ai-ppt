import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, KeyRound, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useSettingsStore, useToastStore } from '../../store'
import { useT } from '../../i18n'
import { resolveModelTimeoutMs } from '@shared/model-timeout.js'

/**
 * First-launch API key gate.
 *
 * The seeded default model has an empty api_key. We block the app behind a
 * modal until the user supplies a key AND it passes a live verification
 * round-trip against the configured provider. This prevents users from being
 * sent to the main UI with a key that will silently fail later.
 *
 * Trigger:  the active model exists AND its api_key is empty.
 * Bypass:   a verifyApiKey call returns valid=true. Save then proceeds.
 * Failure:  inline error from the provider's response, gate stays open.
 */
export function SetupGate({ children }: { children: React.ReactNode }): React.JSX.Element {
  const t = useT()
  const { success: toastSuccess } = useToastStore()
  const modelConfigs = useSettingsStore((s) => s.modelConfigs)
  const fetchSettings = useSettingsStore((s) => s.fetchSettings)
  const upsertModelConfig = useSettingsStore((s) => s.upsertModelConfig)
  const verifyApiKey = useSettingsStore((s) => s.verifyApiKey)

  const [hydrated, setHydrated] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [phase, setPhase] = useState<'idle' | 'verifying' | 'saving'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    void fetchSettings().finally(() => setHydrated(true))
  }, [fetchSettings])

  const activeModel = useMemo(
    () => modelConfigs.find((c) => c.active) ?? null,
    [modelConfigs]
  )

  const needsKey = hydrated && activeModel != null && activeModel.apiKey.trim().length === 0
  const busy = phase !== 'idle'

  const handleSubmit = async (): Promise<void> => {
    if (!activeModel) return
    const trimmed = apiKey.trim()
    if (!trimmed || busy) return

    setErrorMessage(null)
    setPhase('verifying')
    const valid = await verifyApiKey(
      activeModel.provider,
      trimmed,
      activeModel.model,
      activeModel.baseUrl,
      activeModel.maxTokens,
      resolveModelTimeoutMs(undefined, 'verify')
    )
    if (!valid) {
      const verifyMessage =
        useSettingsStore.getState().verificationMessage ||
        t('setupGate.verifyFailedFallback')
      setErrorMessage(verifyMessage)
      setPhase('idle')
      return
    }

    setPhase('saving')
    try {
      const result = await upsertModelConfig({
        id: activeModel.id,
        name: activeModel.name,
        provider: activeModel.provider,
        model: activeModel.model,
        apiKey: trimmed,
        baseUrl: activeModel.baseUrl,
        maxTokens: activeModel.maxTokens,
        active: true
      })
      if (!result) {
        setErrorMessage(t('setupGate.saveFailed'))
        setPhase('idle')
        return
      }
      toastSuccess(t('setupGate.saved'))
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('setupGate.saveFailed'))
      setPhase('idle')
    }
  }

  return (
    <>
      {children}
      {needsKey && activeModel && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--color-bg-overlay)] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-[min(460px,calc(100vw-32px))] rounded-lg border border-[var(--color-border-default)] bg-white p-6 shadow-[var(--elevation-popover)]">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold leading-tight text-[var(--color-fg-default)]">
                  {t('setupGate.title')}
                </h2>
                <p className="mt-1 text-xs leading-5 text-[var(--color-fg-secondary)]">
                  {t('setupGate.description')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 py-2 text-xs leading-5 text-[var(--color-fg-secondary)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--color-fg-tertiary)]">
                    {t('setupGate.modelLabel')}
                  </span>
                  <span className="truncate font-medium text-[var(--color-fg-default)]">
                    {activeModel.name}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-[var(--color-fg-tertiary)]">
                    {t('setupGate.baseUrlLabel')}
                  </span>
                  <span className="truncate font-mono text-[11px] text-[var(--color-fg-default)]">
                    {activeModel.baseUrl}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-fg-default)]">
                  {t('setupGate.apiKeyLabel')}
                </label>
                <Input
                  type="password"
                  autoFocus
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  placeholder={t('setupGate.apiKeyPlaceholder')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && apiKey.trim() && !busy) {
                      void handleSubmit()
                    }
                  }}
                  disabled={busy}
                />
                <p className="mt-1.5 text-[11px] leading-4 text-[var(--color-fg-tertiary)]">
                  {t('setupGate.requiredHint')}
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs leading-5 text-[var(--color-danger)]">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 break-words">{errorMessage}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!apiKey.trim() || busy}
              >
                {phase === 'verifying' && (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t('setupGate.verifying')}
                  </>
                )}
                {phase === 'saving' && (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t('setupGate.saving')}
                  </>
                )}
                {phase === 'idle' && t('setupGate.saveButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
