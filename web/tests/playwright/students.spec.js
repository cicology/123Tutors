/**
 * TestSprite E2E Tests - Student Management
 * Tests the complete student management workflow
 */

const { test, expect } = require('@playwright/test');

test.describe('Student Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to students page
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@bursary.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.goto('/students');
  });

  test('should display students list', async ({ page }) => {
    // Check students page elements
    await expect(page.locator('text=Student Management')).toBeVisible();
    await expect(page.locator('[data-testid="students-table"]')).toBeVisible();
    await expect(page.locator('text=Add Student')).toBeVisible();
  });

  test('should open add student dialog', async ({ page }) => {
    // Click add student button
    await page.click('text=Add Student');
    
    // Check if dialog is open
    await expect(page.locator('[data-testid="add-student-dialog"]')).toBeVisible();
    await expect(page.locator('text=Add New Student')).toBeVisible();
  });

  test('should validate student form', async ({ page }) => {
    // Open add student dialog
    await page.click('text=Add Student');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check validation messages
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should add new student successfully', async ({ page }) => {
    // Open add student dialog
    await page.click('text=Add Student');
    
    // Fill student form
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="email"]', 'jane.smith@university.edu');
    await page.fill('input[name="studentId"]', 'STU001');
    await page.selectOption('select[name="university"]', 'University of Cape Town');
    await page.selectOption('select[name="programme"]', 'Computer Science');
    await page.fill('input[name="budget"]', '50000');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check success message
    await expect(page.locator('text=Student added successfully')).toBeVisible();
    
    // Check if student appears in table
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });

  test('should search students', async ({ page }) => {
    // Use search functionality
    await page.fill('[data-testid="student-search"]', 'Jane');
    
    // Check if search results are filtered
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });

  test('should edit student details', async ({ page }) => {
    // Click edit button for first student
    await page.click('[data-testid="edit-student-button"]');
    
    // Check if edit dialog is open
    await expect(page.locator('[data-testid="edit-student-dialog"]')).toBeVisible();
    
    // Update student details
    await page.fill('input[name="budget"]', '60000');
    await page.click('button[type="submit"]');
    
    // Check success message
    await expect(page.locator('text=Student updated successfully')).toBeVisible();
  });

  test('should delete student', async ({ page }) => {
    // Click delete button for first student
    await page.click('[data-testid="delete-student-button"]');
    
    // Confirm deletion
    await page.click('text=Confirm Delete');
    
    // Check success message
    await expect(page.locator('text=Student deleted successfully')).toBeVisible();
  });

  test('should bulk upload students', async ({ page }) => {
    // Click bulk upload button
    await page.click('text=Bulk Upload');
    
    // Check if upload dialog is open
    await expect(page.locator('[data-testid="bulk-upload-dialog"]')).toBeVisible();
    
    // Upload CSV file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/sample-students.csv');
    
    // Click upload button
    await page.click('text=Upload Students');
    
    // Check success message
    await expect(page.locator('text=Students uploaded successfully')).toBeVisible();
  });

  test('should filter students by status', async ({ page }) => {
    // Select active status filter
    await page.selectOption('[data-testid="status-filter"]', 'active');
    
    // Check if only active students are shown
    const studentRows = page.locator('[data-testid="student-row"]');
    await expect(studentRows).toHaveCount(5); // Assuming 5 active students
  });

  test('should export students data', async ({ page }) => {
    // Click export button
    await page.click('text=Export');
    
    // Check if export options are visible
    await expect(page.locator('text=Export as CSV')).toBeVisible();
    await expect(page.locator('text=Export as Excel')).toBeVisible();
    
    // Click CSV export
    await page.click('text=Export as CSV');
    
    // Check if download starts (this would need to be handled differently in real tests)
    // await expect(page.locator('text=Download started')).toBeVisible();
  });
});
