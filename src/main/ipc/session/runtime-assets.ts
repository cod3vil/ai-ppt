import fs from 'fs'
import path from 'path'
import type { IpcContext } from '../context'

export const INDEX_RUNTIME_MARKER = '@ai-ppt-index-runtime:njmd:v2.0.9'
export const PPT_RUNTIME_MARKER = '@ai-ppt-ppt-runtime:njmd:v1.2.1'

export async function ensureSessionRuntimeCompatible(
  ctx: IpcContext,
  projectDir: string
): Promise<void> {
  const runtimePath = path.join(projectDir, 'assets', 'index-runtime.js')
  try {
    const content = await fs.promises.readFile(runtimePath, 'utf-8')
    if (content.includes(INDEX_RUNTIME_MARKER)) return
  } catch {
    // Missing or unreadable runtime file falls back to full asset refresh.
  }
  await ctx.ensureSessionAssets(projectDir)
}
