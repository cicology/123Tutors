/**
 * TestSprite E2E Tests - Authentication Flow
 * Tests the complete user authentication process
 */

const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display login form on homepage', async ({ page }) => {
    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill in valid test credentials
    await page.fill('input[type="email"]', 'test@bursary.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click on register link
    await page.click('text=Sign up');
    
    // Should navigate to registration page
    await expect(page).toHaveURL('/register');
    await expect(page.locator('text=Create Account')).toBeVisible();
  });

  test('should complete registration flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('input[name="email"]', 'newuser@test.com');
    await page.fill('input[name="password"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Should show success message or redirect
    await expect(page.locator('text=Registration successful')).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    // Click forgot password link
    await page.click('text=Forgot password?');
    
    // Should navigate to password reset page
    await expect(page).toHaveURL('/forgot-password');
    
    // Fill email for password reset
    await page.fill('input[type="email"]', 'test@bursary.com');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@bursary.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
    
    // Click logout
    await page.click('text=Logout');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
