const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Load the page
  const filePath = `file://${path.resolve('index.html')}`;
  await page.goto(filePath);

  // Wait for content
  await page.waitForTimeout(1000);

  // Take initial layout screenshot
  await page.screenshot({ path: 'scripts/verification/screenshots/restored_theme_verify.png' });

  // Click a face button to see if apps still work
  const faceBtn = page.locator('.face-btn').first();
  if (await faceBtn.isVisible()) {
      await faceBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'scripts/verification/screenshots/restored_theme_app_launch.png' });
  }

  await browser.close();
  console.log('Restoration verification screenshots saved.');
})();
