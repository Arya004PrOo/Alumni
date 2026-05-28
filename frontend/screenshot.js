import { chromium } from 'playwright-core';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }); // Playwright usually installs it
  const page = await browser.newPage();
  await page.goto('http://localhost:5175');
  
  // wait for something to load
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'screenshot1.png' });
  
  // try clicking delete on the first row
  const deleteBtn = page.locator('button[title="Delete Record"]').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshot2.png' });
    
    // click delete action
    const confirmBtn = page.getByRole('button', { name: 'Delete' }).first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshot3.png' });
    } else {
      console.log('No confirm button found');
    }
  } else {
    console.log('No delete button found');
  }

  await browser.close();
})();
