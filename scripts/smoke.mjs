import { chromium } from 'playwright-core';

const pages = ['dashboard','students','teachers','classes','attendance','exams','fees','timetable','notices','settings'];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);

for (const p of pages) {
  const btn = page.locator(`nav button:has-text("${p === 'exams' ? 'Exams & Results' : p.charAt(0).toUpperCase() + p.slice(1)}")`);
  if (await btn.count()) { await btn.first().click(); await page.waitForTimeout(600); }
  console.log('visited:', p);
}

await page.screenshot({ path: 'dashboard_students.png' });
console.log('CONSOLE ERRORS:', JSON.stringify(errors.slice(0, 10)));
const text = await page.locator('body').innerText();
console.log('BODY PREVIEW:', text.slice(0, 300).replace(/\n+/g, ' | '));
await browser.close();

