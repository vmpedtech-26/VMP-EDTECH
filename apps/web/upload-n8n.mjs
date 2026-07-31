import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log("Navigating to n8n...");
  await page.goto('https://vmpedtech.app.n8n.cloud', { waitUntil: 'networkidle' });
  
  console.log("Checking if login is required...");
  try {
    const needsEmail = await page.waitForSelector('input[type="email"]', { timeout: 5000 }).catch(() => null);
    if (needsEmail) {
      console.log("Found email input. Logging in with matias@vmp-edtech.com...");
      await page.fill('input[type="email"]', 'matias@vmp-edtech.com');
      await page.fill('input[type="password"]', '#5sEs_NhdYDbN5*');
      await page.getByRole('button', { name: /Sign in/i }).click();
      await page.waitForLoadState('networkidle');
      
      const errorMsg = await page.locator('text=/wrong|invalid|unauthorized/i').isVisible().catch(() => false);
      if (errorMsg) {
        console.log("Failed. Trying vmp-edtech as email...");
        await page.fill('input[type="email"]', 'vmp-edtech');
        await page.fill('input[type="password"]', '#5sEs_NhdYDbN5*');
        await page.getByRole('button', { name: /Sign in/i }).click();
        await page.waitForLoadState('networkidle');
      }
    }
  } catch (e) {
    console.log("Error during login phase:", e.message);
  }

  console.log("Waiting for dashboard...");
  try {
    await page.waitForSelector('.el-container, .main-layout, [data-test-id="sidebar"], .workflow-list', { timeout: 10000 });
    console.log("Dashboard loaded!");
  } catch(e) {
    console.log("Dashboard did not load in time!");
  }
  
  console.log("Setting VMP_WEBHOOK_SECRET...");
  await page.evaluate(async () => {
    try {
      const res = await fetch('/rest/variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ key: 'VMP_WEBHOOK_SECRET', value: '9802099e087f883a9758b1176f212c2a7acc6e0c1f3626066bd51d7929c0f360' })
      });
      console.log('Variable set status:', res.status, await res.text());
    } catch(err) {
      console.log('Error setting variable:', err);
    }
  });
  
  const workflowsDir = '/Users/matias/Desktop/SISTEMAS & APPS/VMP-EDTECH 09/vmp-abril/n8n-workflows';
  const files = [
    '01-lead-crm.json',
    '02-credential-whatsapp.json',
    '03-invoice-email.json',
    '04-company-onboarding.json'
  ];
  
  for (const file of files) {
    console.log(`Reading ${file}...`);
    const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
    const workflowObj = JSON.parse(content);
    
    console.log(`Uploading ${file}...`);
    await page.evaluate(async ({ wf }) => {
      try {
        const payload = {
          name: wf.name || 'Imported Workflow',
          nodes: wf.nodes || [],
          connections: wf.connections || {},
          settings: wf.settings || {},
          staticData: null,
          pinData: {}
        };
        const res = await fetch('/rest/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log(`Workflow import status:`, res.status, await res.text());
      } catch(err) {
        console.log(`Error uploading workflow:`, err);
      }
    }, { wf: workflowObj });
    await page.waitForTimeout(1000);
  }

  console.log("Done! Closing browser in 3 seconds.");
  await page.waitForTimeout(3000);
  await browser.close();
})();
