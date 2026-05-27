import { Image } from 'lucide-react'
import { Input } from '../../ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select'
import { InspectorSection } from './InspectorSection'
import type { ElementEditorProps } from './types'
import { useT } from '@renderer/i18n'

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}): React.JSX.Element {
  return (
    <label className="flex h-8 items-center justify-between rounded-full border border-[var(--color-border-default)]/40 bg-[var(--color-bg-subtle)]/40 px-3 text-xs text-[var(--color-fg-secondary)]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--color-fg-tertiary)]"
      />
    </label>
  )
}

export function MediaInspector({
  selection,
  draft,
  onDraftChange
}: ElementEditorProps): React.JSX.Element {
  const t = useT()
  const mediaAttrs = selection.snapshot?.attrs || {}
  const isVideo = selection.elementTag === 'video'
  const hasVideoControls =
    'controls' in mediaAttrs ||
    'muted' in mediaAttrs ||
    'loop' in mediaAttrs ||
    'autoplay' in mediaAttrs ||
    'playsInline' in mediaAttrs ||
    'preload' in mediaAttrs
  return (
    <InspectorSection
      title={t('sessionDetail.media')}
      icon={<Image className="h-3.5 w-3.5 text-[var(--color-fg-tertiary)]" />}
    >
      <div className="space-y-2.5">
        {!isVideo && (
          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium text-[var(--color-fg-tertiary)]">
              {t('sessionDetail.objectFit')}
            </span>
            <Select
              value={draft.objectFit || 'contain'}
              onValueChange={(value) =>
                onDraftChange(
                  { ...draft, objectFit: value },
                  { commit: true, fields: ['objectFit'] }
                )
              }
            >
              <SelectTrigger className="h-8 rounded-full border-[var(--color-border-default)]/72 bg-[#ffffff]/88 px-2.5 text-xs text-[var(--color-fg-default)] shadow-[inset_0_1px_2px_rgba(74,59,42,0.05)] focus-visible:border-[var(--color-brand-hover)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">contain</SelectItem>
                <SelectItem value="cover">cover</SelectItem>
                <SelectItem value="fill">fill</SelectItem>
                <SelectItem value="none">none</SelectItem>
                <SelectItem value="scale-down">scale-down</SelectItem>
              </SelectContent>
            </Select>
          </label>
        )}
        {!isVideo && (
          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium text-[var(--color-fg-tertiary)]">{t('sessionDetail.alt')}</span>
            <Input
              value={draft.alt}
              onChange={(event) => onDraftChange({ ...draft, alt: event.target.value })}
              onBlur={(event) =>
                onDraftChange({ ...draft, alt: event.target.value }, { commit: true, fields: ['alt'] })
              }
              className="h-8 rounded-full border border-[var(--color-border-default)]/72 bg-[#ffffff]/88 px-2.5 text-xs text-[var(--color-fg-default)] shadow-[inset_0_1px_2px_rgba(74,59,42,0.05)] focus-visible:border-[var(--color-brand-hover)] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </label>
        )}
        {hasVideoControls && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <ToggleRow
                label={t('sessionDetail.controls')}
                checked={draft.controls}
                onChange={(controls) =>
                  onDraftChange({ ...draft, controls }, { commit: true, fields: ['controls'] })
                }
              />
              <ToggleRow
                label={t('sessionDetail.muted')}
                checked={draft.muted}
                onChange={(muted) =>
                  onDraftChange({ ...draft, muted }, { commit: true, fields: ['muted'] })
                }
              />
              <ToggleRow
                label={t('sessionDetail.loop')}
                checked={draft.loop}
                onChange={(loop) =>
                  onDraftChange({ ...draft, loop }, { commit: true, fields: ['loop'] })
                }
              />
              <ToggleRow
                label={t('sessionDetail.autoplay')}
                checked={draft.autoplay}
                onChange={(autoplay) =>
                  onDraftChange({ ...draft, autoplay }, { commit: true, fields: ['autoplay'] })
                }
              />
              <ToggleRow
                label={t('sessionDetail.playsInline')}
                checked={draft.playsInline}
                onChange={(playsInline) =>
                  onDraftChange(
                    { ...draft, playsInline },
                    { commit: true, fields: ['playsInline'] }
                  )
                }
              />
            </div>
          </>
        )}
      </div>
    </InspectorSection>
  )
}
