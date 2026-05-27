import { useEffect, useState } from 'react'
import { cn } from '@renderer/lib/utils'
import {
  Home,
  FolderOpen,
  Settings,
  Plus,
  ArrowLeft,
  SwatchBook,
  Type,
  LayoutTemplate
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useT } from '@renderer/i18n'
import { ipc } from '@renderer/lib/ipc'

export function Sidebar(): React.JSX.Element {
  const location = useLocation()
  const t = useT()
  const isDetailPage =
    location.pathname.startsWith('/sessions/') && location.pathname !== '/sessions'
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    let disposed = false
    void ipc
      .getAppVersion()
      .then((result) => {
        if (!disposed) {
          setAppVersion(String(result?.version || ''))
        }
      })
      .catch(() => {
        if (!disposed) setAppVersion('')
      })
    return () => {
      disposed = true
    }
  }, [])

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/sessions', icon: FolderOpen, label: t('nav.sessions') },
    { path: '/templates', icon: LayoutTemplate, label: t('nav.templates') },
    { path: '/styles', icon: SwatchBook, label: t('nav.styles') },
    { path: '/fonts', icon: Type, label: t('nav.fonts') },
    { path: '/settings', icon: Settings, label: t('nav.settings') }
  ]

  return (
    <aside className="flex h-full w-full flex-col bg-[var(--color-bg-subtle)] border-r border-[var(--color-border-default)]">
      <div className="px-2 pt-1">
        <div className="mt-4 px-3">
          <h1 className="ai-ppt-brand text-[20px] font-semibold leading-none tracking-tight">
            AI-PPT
          </h1>
        </div>
        <p className="mt-1.5 px-3 text-xs text-[var(--color-fg-tertiary)]">{t('nav.tagline')}</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 pb-4 pt-5">
        {isDetailPage && (
          <Link
            to="/sessions"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--color-fg-secondary)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg-default)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('nav.backToSessions')}
          </Link>
        )}
        {navItems.map((item) => {
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-medium'
                  : 'text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg-default)]'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <Link
          to="/"
          className="flex items-center justify-between gap-2 rounded-md bg-[var(--color-brand)] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-active)]"
        >
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {t('nav.newPresentation')}
          </span>
          {appVersion ? (
            <span className="shrink-0 text-[10px] font-normal text-white/70">v{appVersion}</span>
          ) : null}
        </Link>
      </div>
    </aside>
  )
}
