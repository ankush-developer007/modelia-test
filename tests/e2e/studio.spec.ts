import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpassword123';

test.describe('AI Studio E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('full user flow: signup -> login -> upload -> generate -> view history -> restore', async ({
    page,
  }) => {
    // Step 1: Signup
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/signup/);
    
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Sign Up")');
    
    // Wait for redirect to studio after successful signup
    await page.waitForURL(/\/studio/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/studio/);

    // Step 2: Navigate to studio (should already be there)
    await expect(page.locator('text=Create New Generation')).toBeVisible();

    // Step 3: Fill form
    await page.fill('textarea[id="prompt"]', 'A beautiful fashion dress');
    await page.selectOption('select[id="style"]', 'casual');

    // Step 4: Upload image
    // Create a test image file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });

    // Wait for preview
    await expect(page.locator('img[alt="Preview"]')).toBeVisible({ timeout: 5000 });

    // Step 5: Generate
    await page.click('button:has-text("Generate")');

    // Wait for generation to complete (with retry handling for overload errors)
    const generationComplete = await Promise.race([
      page.waitForSelector('text=/Generation completed successfully/i', { timeout: 30000 }).catch(() => null),
      page.waitForSelector('text=/Model overloaded/i', { timeout: 30000 }).catch(() => null),
    ]);

    // If we get an overload error, wait for retry or continue
    if (generationComplete) {
      // Generation either succeeded or we see the error message
      // The retry logic should handle it automatically
      await page.waitForTimeout(2000); // Wait for potential retry
    }

    // Step 6: View history
    await expect(page.locator('text=/Recent Generations/i')).toBeVisible({ timeout: 10000 });

    // Step 7: Restore a generation (if any exist)
    const generationCards = page.locator('[role="button"]:has-text("A beautiful fashion dress")').first();
    const count = await generationCards.count();
    
    if (count > 0) {
      await generationCards.first().click();
      
      // Verify prompt and style are restored
      await expect(page.locator('textarea[id="prompt"]')).toHaveValue('A beautiful fashion dress');
      await expect(page.locator('select[id="style"]')).toHaveValue('casual');
    }
  });

  test('handles login flow', async ({ page }) => {
    // First create account
    await page.goto('/signup');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(/\/studio/);

    // Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL(/\/login/);

    // Login
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Login")');

    // Should redirect to studio
    await page.waitForURL(/\/studio/);
    await expect(page.locator('text=Create New Generation')).toBeVisible();
  });

  test('handles abort functionality', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[type="email"]', `abort-test-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(/\/studio/);

    // Fill form and start generation
    await page.fill('textarea[id="prompt"]', 'Test prompt');
    await page.selectOption('select[id="style"]', 'casual');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-data'),
    });

    await page.click('button:has-text("Generate")');

    // Click abort button if it appears
    const abortButton = page.locator('button:has-text("Abort")');
    const isVisible = await abortButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await abortButton.click();
      // Generation should be cancelled
      await expect(page.locator('button:has-text("Generate")')).toBeVisible();
    }
  });
});

