const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    channel: 'chrome'
  });
  const page = await browser.newPage();
  
  console.log("Navigating...");
  try {
    await page.goto('https://claude.ai/share/5948106c-ac8d-43a8-b4c7-c78249acf5f7', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log("Page title:", await page.title());
    
    // Wait for the conversation container to render
    console.log("Waiting for rendering...");
    await page.waitForTimeout(5000);
    
    // Extract the page text
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    console.log("\n--- EXTRACTED CONTENT ---");
    console.log(text);
    console.log("-------------------------\n");
  } catch (error) {
    console.error("Error scraping page:", error);
  } finally {
    await browser.close();
  }
})();
