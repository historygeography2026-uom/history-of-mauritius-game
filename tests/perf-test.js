// Automated Playwright test to reproduce rapid navigation freeze.
// Usage:
// 1) npm i -D playwright
// 2) npx playwright install chromium
// 3) node tests/perf-test.js

const { spawn } = require('child_process')
const http = require('http')

async function waitForServer(url, timeout = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      await new Promise((res, rej) => {
        const req = http.get(url, (r) => {
          res()
          r.resume()
        })
        req.on('error', rej)
      })
      return
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error('Server did not start in time')
}

;(async () => {
  // Start production server (assumes `next build` has already been run)
  console.log('Starting `npm run start`...')
  const server = spawn('npm', ['run', 'start'], { shell: true, stdio: 'inherit' })

  try {
    await waitForServer('http://localhost:3000')
    console.log('Server is up')
  } catch (e) {
    console.error(e)
    server.kill()
    process.exit(1)
  }

  // Run Playwright
  const { chromium } = require('playwright')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Start tracing
  await context.tracing.start({ screenshots: true, snapshots: true })

  // Repeat navigation rapidly
  console.log('Running rapid navigation sequence...')
  for (let i = 0; i < 40; i++) {
    await page.goto('http://localhost:3000/game?subject=history&level=1', { waitUntil: 'domcontentloaded' })
    // small wait to let timer start
    await page.waitForTimeout(120)
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(80)
  }

  // Stop tracing and save
  const tracePath = 'playwright-trace.zip'
  await context.tracing.stop({ path: tracePath })
  console.log('Trace saved to', tracePath)

  await browser.close()
  // Shutdown server
  server.kill()
  process.exit(0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
