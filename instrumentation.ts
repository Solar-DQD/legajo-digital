export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  console.log(`[startup] ${new Date().toISOString()} — server booted (pid ${process.pid})`)
}
