// electron-builder afterPack hook.
// - Removes locale bundles we don't ship (220 lproj → 2 lproj, ~43 MB saved on mac)
// - Removes wrong-platform slide-pack binaries (mac build drops windows .exe, etc.)
const fs = require('fs')
const path = require('path')

const KEEP_LOCALES = new Set(['en', 'en_US', 'zh', 'zh_CN'])
const KEEP_PAK_LOCALES = new Set(['en-US', 'zh-CN'])

function rimraf(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true })
  } catch (err) {
    console.warn(`[after-pack] failed to remove ${target}:`, err.message)
  }
}

function stripMacLocales(appOutDir, appName) {
  const fwDir = path.join(
    appOutDir,
    `${appName}.app`,
    'Contents',
    'Frameworks',
    'Electron Framework.framework',
    'Versions',
    'A',
    'Resources'
  )
  if (!fs.existsSync(fwDir)) return 0
  let removed = 0
  let kept = 0
  for (const entry of fs.readdirSync(fwDir)) {
    if (!entry.endsWith('.lproj')) continue
    const localeBase = entry.replace(/\.lproj$/, '').replace(/_(FEMININE|MASCULINE|NEUTER)$/, '')
    if (KEEP_LOCALES.has(localeBase)) {
      kept += 1
      continue
    }
    rimraf(path.join(fwDir, entry))
    removed += 1
  }
  console.log(`[after-pack] mac lproj: kept ${kept}, removed ${removed}`)
  return removed
}

function stripChromiumPaks(appOutDir, platform, appName) {
  // On win/linux, locale .pak files live in <root>/locales/<locale>.pak
  let localesDir
  if (platform === 'darwin') return 0
  if (platform === 'win32') {
    localesDir = path.join(appOutDir, 'locales')
  } else {
    localesDir = path.join(appOutDir, 'locales')
  }
  if (!fs.existsSync(localesDir)) return 0
  let removed = 0
  let kept = 0
  for (const entry of fs.readdirSync(localesDir)) {
    if (!entry.endsWith('.pak')) continue
    const locale = entry.replace(/\.pak$/, '')
    if (KEEP_PAK_LOCALES.has(locale)) {
      kept += 1
      continue
    }
    rimraf(path.join(localesDir, entry))
    removed += 1
  }
  console.log(`[after-pack] chromium pak: kept ${kept}, removed ${removed}`)
  // We deliberately do not touch app name files here; appName param is reserved
  // for future per-platform paths that need it.
  void appName
  return removed
}

function stripWrongPlatformBinaries(appOutDir, platform, arch, appName) {
  // resources/slide-pack-* are unpacked next to app.asar.
  // Keep only the current platform/arch binary.
  let resourcesDir
  if (platform === 'darwin') {
    resourcesDir = path.join(
      appOutDir,
      `${appName}.app`,
      'Contents',
      'Resources',
      'app.asar.unpacked',
      'resources'
    )
  } else {
    resourcesDir = path.join(appOutDir, 'resources', 'app.asar.unpacked', 'resources')
  }
  if (!fs.existsSync(resourcesDir)) return 0
  const wantName =
    platform === 'darwin'
      ? `slide-pack-darwin-${arch === 'arm64' ? 'arm64' : 'amd64'}`
      : platform === 'win32'
        ? 'slide-pack-windows-amd64.exe'
        : null
  if (!wantName) return 0
  let removed = 0
  for (const entry of fs.readdirSync(resourcesDir)) {
    if (!entry.startsWith('slide-pack-')) continue
    if (entry === wantName) continue
    rimraf(path.join(resourcesDir, entry))
    removed += 1
  }
  console.log(`[after-pack] slide-pack: kept ${wantName}, removed ${removed} other(s)`)
  return removed
}

exports.default = async function afterPack(context) {
  const { appOutDir, packager, electronPlatformName, arch } = context
  const appName = packager.appInfo.productFilename
  const archName = arch === 0 ? 'ia32' : arch === 1 ? 'x64' : arch === 3 ? 'arm64' : 'x64'

  console.log(
    `[after-pack] platform=${electronPlatformName} arch=${archName} appName=${appName}`
  )

  if (electronPlatformName === 'darwin') {
    stripMacLocales(appOutDir, appName)
  } else {
    stripChromiumPaks(appOutDir, electronPlatformName, appName)
  }
  stripWrongPlatformBinaries(appOutDir, electronPlatformName, archName, appName)
}
