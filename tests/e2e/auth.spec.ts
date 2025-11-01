import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test('signup form validation', async ({ page }) => {
    await page.goto('/signup');

    // Try to submit empty form
    await page.click('button:has-text("Sign Up")');

    // Should show validation errors
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeInvalid();
  });

  test('login form validation', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button:has-text("Login")');

    // Should show validation errors
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeInvalid();
  });

  test('password too short validation', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123'); // Too short
    await page.click('button:has-text("Sign Up")');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeInvalid();
  });

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/studio');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

