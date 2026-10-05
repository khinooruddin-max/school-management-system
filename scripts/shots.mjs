import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.screenshot({ path: 'shot_dashboard.png', fullPage: true });
const p2 = await b.newPage({ viewport: { width: 390, height: 844 } });
await p2.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await p2.waitForTimeout(1500);
await p2.locator('button[aria-label="Open menu"]').click();
await p2.waitForTimeout(500);
await p2.screenshot({ path: 'shot_mobile.png' });
await b.close();

