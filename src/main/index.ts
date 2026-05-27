import { app, shell, BrowserWindow, screen, type Size } from 'electron'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import log from 'electron-log/main.js'
import dayjs from 'dayjs'
import { PPTDatabase } from './db/database'
import { AgentManager } from './agent'
import { setupIPC, registerLocalAssetProtocol } from './ipc'
import { setStyleDb } from './utils/style-skills'
import { createTray, destroyTray, showTrayHideBalloon } from './tray'
import type { UpdateAvailablePayload } from '@shared/app-update'

let mainWindow: BrowserWindow | null = null
let db: PPTDatabase | null = null
let agentManager: AgentManager | null = null
let isShuttingDown = false
let isTrayEnabled = false

const APP_NAME = 'OhMyPPT'
const DEFAULT_WINDOW_WIDTH = 1200
const DEFAULT_WINDOW_HEIGHT = 780
const BASE_MIN_WIDTH = 880
const BASE_MIN_HEIGHT = 680
const TITLEBAR_HEIGHT = 48
const TITLEBAR_BACKGROUND = '#f4eddf'
const TITLEBAR_SYMBOL_COLOR = '#5d6b4d'
const VERSION_CHECK_API = 'https://api.cyberran.com/Api/App/getVersion?app=aippt'
const VERSION_DOWNLOAD_URL = 'https://api.cyberran.com/app/download/index.html?app=aippt'
const __dirname = dirname(fileURLToPath(import.meta.url))

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
  app.quit()
}

function resolveWindowBounds(): {
  width: number
  height: number
  minWidth: number
  minHeight: number
  workArea: Size
} {
  const workArea = screen.getPrimaryDisplay().workAreaSize
  const maxInitialWidth = Math.max(900, workArea.width - 72)
  const maxInitialHeight = Math.max(620, workArea.height - 88)
  const minWidth = Math.min(BASE_MIN_WIDTH, maxInitialWidth)
  const minHeight = Math.min(BASE_MIN_HEIGHT, maxInitialHeight)
  const width = Math.max(minWidth, Math.min(DEFAULT_WINDOW_WIDTH, maxInitialWidth))
  const height = Math.max(minHeight, Math.min(DEFAULT_WINDOW_HEIGHT, maxInitialHeight))

  return {
    width,
    height,
    minWidth,
    minHeight,
    workArea,
  }
}

function configureLogging(): void {
  log.transports.file.level = 'info'
  log.transports.file.maxSize = 20 * 1024 * 1024
  log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'

  if (is.dev) {
    const logDir = join(process.cwd(), 'logs')
    mkdirSync(logDir, { recursive: true })
    log.transports.file.resolvePathFn = () => join(logDir, 'main.log')
  } else {
    log.transports.file.resolvePathFn = () => {
      const now = dayjs()
      const yearMonth = now.format('YYYY-MM')
      const yearMonthDay = now.format('YYYY-MM-DD')
      return join(
        app.getPath('userData'),
        'ohmyppt_logs',
        yearMonth,
        `${yearMonthDay}-v${app.getVersion()}.log`
      )
    }
  }

  log.initialize()
  log.info('[app] logger initialized', {
    env: is.dev ? 'dev' : 'prod',
    version: app.getVersion(),
    file: log.transports.file.getFile().path,
  })
}

function isOneDriveRedirected(p: string): boolean {
  // Match path segments named OneDrive or OneDrive - <tenant>.
  return /[\\/]OneDrive(\s*-\s*[^\\/]+)?[\\/]/i.test(p)
}

function probeWritable(dir: string): boolean {
  try {
    mkdirSync(dir, { recursive: true })
    const probe = join(dir, '.ai-ppt-write-probe')
    writeFileSync(probe, '')
    unlinkSync(probe)
    return true
  } catch {
    return false
  }
}

/**
 * Default storage path for a fresh install. Tries platform-conventional
 * locations first, then falls back to ones we know are writable.
 *
 * Windows: skip Documents if it's been redirected into OneDrive — generated
 * PPT files would otherwise sync to the cloud, which is slow and surprising
 * for a local-first tool.
 */
function pickDefaultStoragePath(): string {
  const home = app.getPath('home')
  const documents = app.getPath('documents')
  const userData = app.getPath('userData')

  const candidates: string[] = []
  if (process.platform === 'win32') {
    if (!isOneDriveRedirected(documents)) {
      candidates.push(join(documents, 'AI-PPT'))
    }
    candidates.push(join(home, 'AI-PPT'))
  } else {
    candidates.push(join(documents, 'AI-PPT'))
    candidates.push(join(home, 'AI-PPT'))
  }
  // Always-writable last resort under app sandbox.
  candidates.push(join(userData, 'storage'))

  for (const candidate of candidates) {
    if (probeWritable(candidate)) return candidate
  }
  return ''
}

function parseVersion(version: string): number[] {
  return version
    .trim()
    .replace(/^v/i, '')
    .split(/[.-]/)
    .slice(0, 3)
    .map((part) => {
      const value = Number.parseInt(part, 10)
      return Number.isFinite(value) ? value : 0
    })
}

function isNewerVersion(latestVersion: string, currentVersion: string): boolean {
  const latest = parseVersion(latestVersion)
  const current = parseVersion(currentVersion)
  for (let index = 0; index < Math.max(latest.length, current.length, 3); index += 1) {
    const latestPart = latest[index] ?? 0
    const currentPart = current[index] ?? 0
    if (latestPart > currentPart) return true
    if (latestPart < currentPart) return false
  }
  return false
}

async function fetchLatestRelease(): Promise<UpdateAvailablePayload | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(VERSION_CHECK_API, {
      headers: {
        Accept: 'application/json',
        'User-Agent': `${APP_NAME}/${app.getVersion()}`
      },
      signal: controller.signal
    })
    if (!response.ok) {
      log.warn('[update] version check request failed', {
        status: response.status,
        statusText: response.statusText
      })
      return null
    }
    const payload = (await response.json()) as {
      status?: number
      info?: {
        name?: string
        version?: string
        link?: string
      }
      url?: string
    }
    if (payload.status !== 1) {
      log.warn('[update] version check returned non-ok status', { status: payload.status })
      return null
    }
    const latestVersion = String(payload.info?.version || '').trim()
    const currentVersion = app.getVersion()
    if (!latestVersion) return null
    if (!isNewerVersion(latestVersion, currentVersion)) return null

    return {
      currentVersion,
      latestVersion,
      releaseUrl: payload.url?.trim() || payload.info?.link?.trim() || VERSION_DOWNLOAD_URL,
      releaseName: payload.info?.name,
      publishedAt: undefined
    }
  } catch (error) {
    log.warn('[update] version check failed', {
      message: error instanceof Error ? error.message : String(error)
    })
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function scheduleUpdateNotification(window: BrowserWindow): void {
  if (is.dev) return
  window.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      void fetchLatestRelease().then((update) => {
        if (!update || window.isDestroyed() || window.webContents.isDestroyed()) return
        log.info('[update] new release available', update)
        window.webContents.send('app:update-available', update)
      })
    }, 2500)
  })
}

function createWindow(): BrowserWindow {
  const isMac = process.platform === 'darwin'
  const preloadPath = join(__dirname, '../preload/index.mjs')
  const windowBounds = resolveWindowBounds()

  const iconPath = join(__dirname, '../../build/icons/512x512.png')
  if (isMac && existsSync(iconPath)) {
    try { app.dock?.setIcon(iconPath); } catch { /* ignore */ }
  }
  const window = new BrowserWindow({
    title: APP_NAME,
    width: windowBounds.width,
    height: windowBounds.height,
    minWidth: windowBounds.minWidth,
    minHeight: windowBounds.minHeight,
    center: true,
    show: false,
    backgroundColor: TITLEBAR_BACKGROUND,
    autoHideMenuBar: true,
    ...(existsSync(iconPath) ? { icon: iconPath } : {}),
    // Keep native controls and only let the renderer draw the visual titlebar.
    ...(isMac
      ? {
          titleBarStyle: 'hidden',
          trafficLightPosition: { x: 14, y: Math.round((TITLEBAR_HEIGHT - 14) / 2) }
        }
      : {
          titleBarStyle: 'hidden',
          titleBarOverlay: {
            color: TITLEBAR_BACKGROUND,
            symbolColor: TITLEBAR_SYMBOL_COLOR,
            height: TITLEBAR_HEIGHT
          }
        }),
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      webviewTag: true
    }
  })
  mainWindow = window

  window.on('close', (e) => {
    if (process.platform === 'win32' && isTrayEnabled && !isShuttingDown) {
      e.preventDefault()
      window.hide()
      showTrayHideBalloon()
    }
  })

  log.info('[app] creating window', {
    preloadPath,
    contextIsolation: true,
    sandbox: false,
    window: {
      width: windowBounds.width,
      height: windowBounds.height,
      minWidth: windowBounds.minWidth,
      minHeight: windowBounds.minHeight,
      workArea: windowBounds.workArea,
      titlebarHeight: TITLEBAR_HEIGHT,
      titleBarStyle: isMac ? 'hidden' : 'hidden+overlay',
    },
  })

  window.on('ready-to-show', () => {
    window.show()
    // if (is.dev) {
    //   window.webContents.openDevTools({ mode: 'detach' })
    // }
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

function showMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

if (gotSingleInstanceLock) {
  app.on('second-instance', () => {
    log.info('[app] second instance requested; focusing existing window')
    showMainWindow()
  })

  app.whenReady().then(async () => {
    configureLogging()
    electronApp.setAppUserModelId('com.ohmyppt.app')

    const dbPath = is.dev ? join(process.cwd(), 'local.dev.db') : undefined
    db = new PPTDatabase(dbPath)
    await db.init()
    setStyleDb(db)
    log.info('[app] database initialized', {
      env: is.dev ? 'dev' : 'prod',
      dbPath: dbPath || 'userData/local.db',
    })

    // First-launch default storage path. New users shouldn't be blocked by Settings
    // before they can create anything. pickDefaultStoragePath() encodes
    // platform-specific preferences (e.g. skipping OneDrive-redirected Documents
    // on Windows) and probes each candidate for write access before picking.
    const existingStoragePath = (
      (await db.getSetting<string>('storage_path').catch(() => '')) || ''
    ).trim()
    if (!existingStoragePath) {
      const defaultStorage = pickDefaultStoragePath()
      if (defaultStorage) {
        try {
          await db.setStoragePath(defaultStorage)
          log.info('[app] initialized default storage path', {
            platform: process.platform,
            path: defaultStorage
          })
        } catch (err) {
          log.warn('[app] failed to persist default storage path', {
            path: defaultStorage,
            message: err instanceof Error ? err.message : String(err)
          })
        }
      } else {
        log.warn('[app] no writable candidate for default storage path; user must pick manually')
      }
    }

    // First-launch default model. Seed an OpenAI-compatible config pointing at
    // the upapi.cn gateway so users see a working entry in Settings → Models
    // and aren't blocked by an empty list. API key is left blank — user must
    // fill it in before actually generating.
    const existingModels = await db.listModelConfigs().catch(() => [])
    if (existingModels.length === 0) {
      try {
        await db.upsertModelConfig({
          name: 'deepseek-v4-flash',
          provider: 'openai',
          model: 'deepseek-v4-flash',
          apiKey: '',
          baseUrl: 'https://gw.upapi.cn/v1',
          maxTokens: 4096,
          active: true
        })
        log.info('[app] seeded default model config')
      } catch (err) {
        log.warn('[app] failed to seed default model config', {
          message: err instanceof Error ? err.message : String(err)
        })
      }
    }
    agentManager = new AgentManager(db)

    const window = createWindow()

    if (process.platform === 'win32') {
      isTrayEnabled = createTray(window)
    }

    registerLocalAssetProtocol()

    if (window && db && agentManager) {
      setupIPC(window, db, agentManager)
      scheduleUpdateNotification(window)
    }

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') return
  // Windows: 托盘模式下不退出，用户通过托盘菜单退出
  if (!isTrayEnabled) app.quit()
})

app.on('before-quit', () => {
  if (isShuttingDown) return
  isShuttingDown = true
  destroyTray()
  if (db) {
    void db.close().catch((error) => {
      log.warn('[app] failed to close database on before-quit', {
        message: error instanceof Error ? error.message : String(error),
      })
    })
  }
})

export { mainWindow, db, agentManager }
