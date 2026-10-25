import { test, expect } from '@playwright/test';

test.describe('UniPass E2E', () => {
  test('complete lead submission and admin workflow', async ({ page }) => {
    // 1. Submit a lead on the homepage
    await page.goto('http://localhost:43123');
    await page.waitForSelector('form');
    
    // Fill out consultation form
    await page.fill('input[name="fullName"]', 'Test Student E2E');
    await page.fill('input[name="whatsappNumber"]', '+92 300 1234567');
    await page.selectOption('select[name="city"]', 'Karachi');
    await page.selectOption('select[name="levelOfStudy"]', "Bachelor's");
    
    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000); // Wait for submission

    // 2. Log into admin
    await page.goto('http://localhost:43123/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@unipass.local');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'admin123456');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/admin');
    expect(await page.title()).toContain('Admin');

    // 3. Navigate to leads and find our lead
    await page.goto('http://localhost:43123/admin/leads');
    await page.waitForSelector('table');
    
    // Click on the Test Student lead
    const leadLink = page.locator('text=Test Student E2E').first();
    await leadLink.click();
    
    // Wait for lead detail page
    await page.waitForSelector('select[name="status"]');
    
    // 4. Change lead status
    await page.selectOption('select[name="status"]', 'contacted');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Verify status changed
    const statusSelect = page.locator('select[name="status"]');
    expect(await statusSelect.inputValue()).toBe('contacted');

    // 5. Navigate to universities and edit one
    await page.goto('http://localhost:43123/admin/universities');
    await page.waitForSelector('table');
    
    // Click first university edit link
    await page.click('a[href*="/admin/universities/"][href*="/edit"]');
    await page.waitForSelector('input[name="name"]');
    
    // Change university name
    const originalName = await page.inputValue('input[name="name"]');
    const newName = originalName + ' EDITED';
    await page.fill('input[name="name"]', newName);
    
    // Save changes
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForTimeout(2000);

    // 6. Check the public detail page shows new name
    const slug = await page.inputValue('input[name="slug"]');
    await page.goto(`http://localhost:43123/universities/${slug}`);
    await page.waitForSelector('h1');
    
    const heading = await page.locator('h1').first().textContent();
    expect(heading).toContain('EDITED');

    console.log('✅ E2E test passed!');
  });
});
