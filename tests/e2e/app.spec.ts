import { test, expect } from '@playwright/test';

test('has title and dashboard text', async ({ page }) => {
    await page.goto('/');

    // Expect a title "Healthcare Management System"
    await expect(page).toHaveTitle(/Healthcare Management System/);

    // Expect "HEALTHCARE OS" to be visible
    await expect(page.getByText('HEALTHCARE OS')).toBeVisible();

    // Expect "System is online" to be visible
    await expect(page.getByText('System is online')).toBeVisible();
});
