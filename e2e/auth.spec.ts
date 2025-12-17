/**
 * TC-001: Authentication Flow E2E Tests
 * Tests user login and logout functionality
 * Note: Registration is skipped due to OTP complexity
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, login, logout } from './helpers';

test.describe('Authentication Flow', () => {
  
  test('TC-001.1: Should login successfully with valid student credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USERS.student.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard/events
    await expect(page).toHaveURL(/\/(dashboard|events)/);
    
    // Verify user is logged in (check for logout button icon)
    await expect(page.locator('button[title="Đăng xuất"]')).toBeVisible();
  });
  
  test('TC-001.2: Should login successfully with valid organizer credentials', async ({ page }) => {
    await login(page, 'organizer');
    
    // Verify organizer-specific navigation is visible
    await expect(page).toHaveURL(/\/(dashboard|events)/);
    await expect(page.locator('text=/create event|tạo sự kiện/i')).toBeVisible();
  });
  
  test('TC-001.3: Should logout successfully', async ({ page }) => {
    // Login first
    await login(page, 'student');
    
    // Logout
    await logout(page);
    
    // Verify redirected to guest/login page
    await expect(page).toHaveURL(/\/(guest|login)/);
  });
});
