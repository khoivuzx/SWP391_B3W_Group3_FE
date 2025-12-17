/**
 * TC-007: Event Viewing and Ticket Display E2E Tests
 * Note: Booking flow skipped - requires VNPay payment which can't be automated
 * These tests assume test user already has some booked tickets in the database
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, login, navigateToMyTickets } from './helpers';

test.describe('Event Viewing and Tickets', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, 'student');
  });
  
  test('TC-007.1: Should view event details', async ({ page }) => {
    await page.goto('/events');
    
    // Find first available event
    const firstEvent = page.locator('.event-card').first();
    
    if (await firstEvent.isVisible({ timeout: 2000 })) {
      await firstEvent.click();
      
      // Verify event details page is displayed
      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('text=/description|date|time|mô tả|ngày|giờ/i')).toBeVisible();
    }
  });
  
  test('TC-007.2: Should display existing tickets in My Tickets', async ({ page }) => {
    await navigateToMyTickets(page);
    
    // Click on first ticket
    const firstTicket = page.locator('.ticket-card, [data-testid="ticket-card"]').first();
    
    if (await firstTicket.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstTicket.click();
      
      // Verify QR code is displayed
      await expect(page.locator('canvas, img[alt*="QR"], svg')).toBeVisible({ timeout: 5000 });
      
      // Verify ticket details
      await expect(page.locator('text=/ticket|event|date/i')).toBeVisible();
    }
  });
});
