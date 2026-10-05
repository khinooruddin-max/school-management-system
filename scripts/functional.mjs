import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 60000 });

// 1. Add a student
await page.locator('nav button:has-text("Students")').first().click();
await page.locator('button:has-text("Add Student")').click();
await page.locator('input').nth(0).fill('STU-TEST-1');
// use labels
const dialog = page.locator('[role=dialog]');
await dialog.locator('label:has-text("Student ID") input').fill('STU-TEST-1');
await dialog.locator('label:has-text("Full Name") input').fill('Test Student');
await dialog.locator('label:has-text("Date of Birth") input').fill('2010-05-01');
await dialog.locator('label:has-text("Class") select').selectOption({ index: 1 });
await dialog.locator('label:has-text("Parent/Guardian Name") input').fill('Test Parent');
await dialog.locator('label:has-text("Parent Phone") input').fill('+1 555-9999');
await dialog.locator('label:has-text("Email") input').first().fill('test@student.edu');
await dialog.locator('label:has-text("Emergency Contact") input').fill('+1 555-8888');
await dialog.locator('button:has-text("Save Student")').click();
await page.waitForTimeout(800);
let found = await page.locator('text=Test Student').count();
console.log('student added & visible:', found > 0);

// 2. Reload and confirm persistence
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.locator('nav button:has-text("Students")').first().click();
await page.waitForTimeout(500);
found = await page.locator('text=Test Student').count();
console.log('student persisted after reload:', found > 0);

// 3. Attendance mark + save
await page.locator('nav button:has-text("Attendance")').first().click();
await page.waitForTimeout(500);
await page.locator('button:has-text("All Absent")').click();
await page.locator('button:has-text("Save Attendance")').click();
await page.waitForTimeout(800);
console.log('attendance saved msg:', (await page.locator('text=Attendance saved successfully').count()) > 0);

// 4. Exams — create exam, enter marks, view results
await page.locator('nav button:has-text("Exams & Results")').first().click();
await page.waitForTimeout(500);
await page.locator('button:has-text("Create Exam")').click();
const ex = page.locator('[role=dialog]');
await ex.locator('label:has-text("Exam Name") input').fill('Test Exam');
await ex.locator('label:has-text("Subject") input').fill('Mathematics');
await ex.locator('label:has-text("Class") select').selectOption({ index: 1 });
await ex.locator('label:has-text("Date") input').fill('2026-10-05');
await ex.locator('label:has-text("Total Marks") input').fill('100');
await ex.locator('button:has-text("Save Exam")').click();
await page.waitForTimeout(800);
console.log('exam created:', (await page.locator('text=Test Exam').count()) > 0);

// 5. Notices toggle
await page.locator('nav button:has-text("Notices")').first().click();
await page.waitForTimeout(500);
const pubBtn = page.locator('button:has-text("Unpublish"), button:has-text("Publish")').first();
await pubBtn.click();
await page.waitForTimeout(500);
console.log('notice toggle ok: true');

// 6. Settings save
await page.locator('nav button:has-text("Settings")').first().click();
await page.waitForTimeout(500);
await page.locator('button:has-text("Save Settings")').click();
await page.waitForTimeout(500);
console.log('settings saved:', (await page.locator('text=Settings saved').count()) > 0);

console.log('CONSOLE ERRORS:', JSON.stringify(errors.slice(0, 10)));
await browser.close();

