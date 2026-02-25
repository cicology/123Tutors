/**
 * TestSprite E2E Tests - Dashboard Functionality
 * Tests the main dashboard features and navigation
 */

const { test, expect } = require('@playwright/test');

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@bursary.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard overview', async ({ page }) => {
    // Check dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Students')).toBeVisible();
    await expect(page.locator('text=Active Courses')).toBeVisible();
    await expect(page.locator('text=Monthly Budget')).toBeVisible();
  });

  test('should navigate to students page', async ({ page }) => {
    // Click on students navigation
    await page.click('text=Students');
    
    // Should navigate to students page
    await expect(page).toHaveURL('/students');
    await expect(page.locator('text=Student Management')).toBeVisible();
  });

  test('should navigate to courses page', async ({ page }) => {
    // Click on courses navigation
    await page.click('text=Courses');
    
    // Should navigate to courses page
    await expect(page).toHaveURL('/courses');
    await expect(page.locator('text=Course Management')).toBeVisible();
  });

  test('should navigate to tutoring page', async ({ page }) => {
    // Click on tutoring navigation
    await page.click('text=Tutoring');
    
    // Should navigate to tutoring page
    await expect(page).toHaveURL('/tutoring');
    await expect(page.locator('text=Tutoring Requests')).toBeVisible();
  });

  test('should display analytics charts', async ({ page }) => {
    // Check for analytics section
    await expect(page.locator('[data-testid="student-progress-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-utilization-chart"]')).toBeVisible();
  });

  test('should show recent activity', async ({ page }) => {
    // Check for recent activity section
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    await expect(page.locator('[data-testid="activity-list"]')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile menu is accessible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Click mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Check if navigation menu is visible
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
  });

  test('should display notifications', async ({ page }) => {
    // Check for notifications icon
    await expect(page.locator('[data-testid="notifications-icon"]')).toBeVisible();
    
    // Click notifications
    await page.click('[data-testid="notifications-icon"]');
    
    // Check if notifications dropdown is visible
    await expect(page.locator('[data-testid="notifications-dropdown"]')).toBeVisible();
  });

  test('should handle user profile menu', async ({ page }) => {
    // Click user profile
    await page.click('[data-testid="user-profile-button"]');
    
    // Check if profile menu is visible
    await expect(page.locator('[data-testid="profile-menu"]')).toBeVisible();
    
    // Check menu items
    await expect(page.locator('text=Profile Settings')).toBeVisible();
    await expect(page.locator('text=Account Settings')).toBeVisible();
    await expect(page.locator('text=Logout')).toBeVisible();
  });
});
