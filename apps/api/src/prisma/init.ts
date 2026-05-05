import * as path from 'path'
import * as fs from 'fs'

// Ensure Prisma binary is available by checking PRISMA_QUERY_ENGINE_BINARY
export function ensurePrismaBinary() {
  const envBin = process.env["PRISMA_QUERY_ENGINE_BINARY"]
  if (envBin && fs.existsSync(envBin)) {
    console.log(`[Prisma] Using explicit binary from PRISMA_QUERY_ENGINE_BINARY: ${envBin}`)
    return
  }

  // Try common locations for Windows binary
  const candidates = [
    path.resolve(__dirname, '..', '..', 'node_modules', '.prisma', 'client', 'query-engine-windows.dll.node'),
    path.resolve(process.cwd(), 'apps', 'api', 'node_modules', '.prisma', 'client', 'query-engine-windows.dll.node'),
    path.resolve(process.cwd(), 'apps', 'api', 'dist', 'query-engine-windows.dll.node'),
    path.resolve(process.cwd(), 'apps', 'api', 'dist', 'prisma', 'query-engine-windows.dll.node'),
    path.resolve(process.cwd(), 'apps', 'api', 'dist', 'prisma-query-engine-windows.dll.node'),
  ]

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      process.env["PRISMA_QUERY_ENGINE_BINARY"] = c
      console.log(`[Prisma] Set PRISMA_QUERY_ENGINE_BINARY to ${c}`)
      return
    }
  }

  // Fallback: explicitly check for binary next to runtime bundle produced by dist
  const distFallback = path.resolve(process.cwd(), 'apps', 'api', 'dist', 'prisma', 'query-engine-windows.dll.node')
  if (fs.existsSync(distFallback)) {
    process.env["PRISMA_QUERY_ENGINE_BINARY"] = distFallback
    console.log(`[Prisma] Found binary at fallback path: ${distFallback}`)
    return
  }

  // If not found, log a helpful message for debugging
  console.warn('[Prisma] PRISMA_QUERY_ENGINE_BINARY not set and Windows binary not found in common locations.')
}
