import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Ensure artifacts directory exists
const artifactsDir = '/opt/cursor/artifacts/screens';
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

test.describe('Screenshot Generation', () => {
  const pages = [
    { path: '/', name: 'home' },
    { path: '/universities', name: 'universities' },
    { path: '/guides', name: 'guides' },
    { path: '/scholarships', name: 'scholarships' },
    { path: '/compare', name: 'compare' },
    { path: '/contact', name: 'contact' },
  ];

  for (const pageInfo of pages) {
    test(`screenshot ${pageInfo.name} at 1440px and 375px`, async ({ page }) => {
      // Desktop 1440px
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`http://localhost:43123${pageInfo.path}`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: path.join(artifactsDir, `${pageInfo.name}-1440.png`),
        fullPage: true,
      });

      // Mobile 375px
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`http://localhost:43123${pageInfo.path}`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: path.join(artifactsDir, `${pageInfo.name}-375.png`),
        fullPage: true,
      });

      console.log(`✅ Screenshots saved for ${pageInfo.name}`);
    });
  }

  test('screenshot admin pages', async ({ page, context }) => {
    // Login first
    await page.goto('http://localhost:43123/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@unipass.local');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'admin123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');

    // Dashboard
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: path.join(artifactsDir, 'admin-dashboard-1440.png'),
      fullPage: true,
    });

    // Leads list
    await page.goto('http://localhost:43123/admin/leads');
    await page.waitForSelector('table');
    await page.screenshot({
      path: path.join(artifactsDir, 'admin-leads-1440.png'),
      fullPage: true,
    });

    // University edit (if any exist)
    await page.goto('http://localhost:43123/admin/universities');
    const editLink = page.locator('a[href*="/edit"]').first();
    if (await editLink.count() > 0) {
      await editLink.click();
      await page.waitForSelector('input[name="name"]');
      await page.screenshot({
        path: path.join(artifactsDir, 'admin-university-edit-1440.png'),
        fullPage: true,
      });
    }

    console.log('✅ Admin screenshots saved');
  });

  test('screenshot university detail', async ({ page }) => {
    // Try to find a university
    await page.goto('http://localhost:43123/universities');
    await page.waitForLoadState('networkidle');
    
    const universityLink = page.locator('a[href^="/universities/"]').first();
    if (await universityLink.count() > 0) {
      await universityLink.click();
      await page.waitForLoadState('networkidle');
      
      // Desktop
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.screenshot({
        path: path.join(artifactsDir, 'university-detail-1440.png'),
        fullPage: true,
      });

      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({
        path: path.join(artifactsDir, 'university-detail-375.png'),
        fullPage: true,
      });

      console.log('✅ University detail screenshots saved');
    }
  });
});
