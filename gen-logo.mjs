import { chromium } from 'playwright-core';

const PORT = process.env.PORT || 3001;

const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});

const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  colorScheme: 'dark',
});

await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(8000);

// Scroll to top
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);

// Take the main screenshot
await page.screenshot({
  path: 'public/screenshot.png',
  fullPage: false,
});
console.log('Screenshot saved to public/screenshot.png');

// Take a logo screenshot of just the hero section
const heroEl = await page.locator('section').first();
if (heroEl) {
  await heroEl.screenshot({
    path: 'public/logo.png',
  });
  console.log('Logo saved to public/logo.png');
}

await browser.close();
