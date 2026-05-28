import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log('Navigating...');
  await page.goto('http://localhost:5175');
  
  await page.waitForSelector('.erp-card');
  console.log('Page loaded');
  
  // switch to directory
  const switchBtn = await page.$('button.erp-btn--primary');
  if (switchBtn) {
    await switchBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  const deleteBtn = await page.$('button[title="Delete Record"]');
  if (deleteBtn) {
    console.log('Clicking delete button...');
    await deleteBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    
    const confirmBtn = await page.$('button:has-text("Delete")') || await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Delete');
    });
    
    if (confirmBtn) {
        console.log('Clicking confirm delete...');
        await confirmBtn.click();
        await new Promise(r => setTimeout(r, 2000));
    } else {
        console.log('No confirm button found');
    }
  } else {
    console.log('No delete button found');
  }

  await browser.close();
})();
