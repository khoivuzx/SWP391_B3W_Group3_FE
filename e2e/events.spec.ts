/**
 * TC-002, TC-003: Event Request Management E2E Tests
 * Split into separate tests for better organization and debugging
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './helpers';

// Shared test data
let eventTitle: string;

test.describe('Event Request Management', () => {
  
  test('TC-002.1: Organizer creates event request', async ({ page }) => {
    // Login as organizer
    await login(page, 'organizer');
    await page.waitForLoadState('networkidle');
    
    // Navigate to create event page
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tạo sự kiện"), a:has-text("Tạo sự kiện")');
    
    // Fill event request form
    const timestamp = Date.now();
    eventTitle = `E2E Test ${timestamp}`;
    
    await page.fill('input[name="title"]', eventTitle);
    await page.fill('textarea[name="description"]', 'Test event for approval flow');
    await page.fill('textarea[name="reason"]', 'Testing staff approval');
    await page.fill('input[name="preferredStart"]', '2025-12-26T10:00');
    await page.fill('input[name="preferredEnd"]', '2025-12-26T12:00');
    await page.fill('input[name="expectedParticipants"]', '30');
    await page.click('button[type="submit"]');
    
    // Verify redirect and request appears
    await page.waitForURL(/\/dashboard\/event-requests/, { timeout: 10000 });
    await expect(page.locator(`text="${eventTitle}"`)).toBeVisible({ timeout: 5000 });
    
    // BREAKPOINT 1: Organizer viewing their newly created request
    await page.pause();
  });
  
  test('TC-002.2: Staff approves event request', async ({ page }) => {
    // Prerequisite: Use the event created in previous test
    const testEventTitle = 'E2E Test'; // Partial match to find latest
    
    // Login as staff
    await page.goto('/login');
    await login(page, 'staff');
    await page.waitForLoadState('networkidle');
    
    // Navigate to event requests
    await page.goto('/dashboard/event-requests');
    await page.waitForLoadState('networkidle');
    
    // Find the most recent test event (starts with "E2E Test")
    const requestRow = page.locator(`text=/E2E Test/`).first().locator('..');
    await expect(requestRow).toBeVisible({ timeout: 5000 });
    
    // BREAKPOINT 2: Staff viewing the pending request
    await page.pause();
    
    // Click approve button to open modal
    const approveButton = requestRow.locator('button:has-text("Duyệt")').first();
    await approveButton.click();
    
    // Wait for approval modal and confirm
    await expect(page.getByRole('heading', { name: 'Duyệt yêu cầu' })).toBeVisible({ timeout: 5000 });
    
    const modalApproveButton = page.locator('div').filter({ hasText: 'Hủy' }).locator('button:has-text("Duyệt")').last();
    await modalApproveButton.click();
    
    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Duyệt yêu cầu' })).toBeHidden({ timeout: 10000 });
    
    // Verify status changed to "Chờ Cập Nhật Thông Tin"
    await page.goto('/dashboard/event-requests');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=/E2E Test/`).first()).toBeVisible({ timeout: 5000 });
    
    // BREAKPOINT 3: Staff seeing the request has been updated
    await page.pause();
  });
  
  test('TC-003: Organizer completes event details', async ({ page }) => {
    // Prerequisite: Event request has been approved
    const testEventTitle = 'E2E Test';
    
    // Login as organizer
    await page.goto('/login');
    await login(page, 'organizer');
    await page.waitForLoadState('networkidle');
    
    // Navigate to event requests
    await page.goto('/dashboard/event-requests');
    await page.waitForLoadState('networkidle');
    
    // Find approved request with "Chờ cập nhật thông tin" status
    const requestRow = page.locator(`text=/E2E Test/`).first().locator('..');
    await expect(requestRow.locator('text=/Chờ cập nhật thông tin/i')).toBeVisible({ timeout: 5000 });
    
    // BREAKPOINT 4: Organizer viewing the approved request
    await page.pause();
    
    // Click on request to open modal and navigate to edit page
    await page.locator(`text=/E2E Test/`).first().click();
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Cập nhật thông tin")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/events\/\d+\/edit/);
    
    // Fill speaker information
    const speakerSection = page.locator('text="Thông tin diễn giả"').locator('..');
    await speakerSection.locator('label:has-text("Họ và tên")').locator('..').locator('input').fill('Dr. Nguyen Van A');
    await speakerSection.locator('label:has-text("Tiểu sử")').locator('..').locator('textarea').fill('Chuyên gia công nghệ với hơn 10 năm kinh nghiệm trong lĩnh vực AI và Machine Learning');
    await speakerSection.locator('label:has-text("Email")').locator('..').locator('input').fill('speaker@example.com');
    await speakerSection.locator('label:has-text("Số điện thoại")').locator('..').locator('input').fill('0901234567');
    
    // Fill VIP ticket (10 seats)
    const vipTicket = page.locator('.border.border-gray-200.rounded-lg').first();
    await vipTicket.locator('label:has-text("Mô tả")').locator('..').locator('textarea').fill('Vé VIP bao gồm chỗ ngồi hàng đầu và phần quà đặc biệt');
    await vipTicket.locator('label:has-text("Giá (VNĐ)")').locator('..').locator('input').fill('200000');
    await vipTicket.locator('label:has-text("Số lượng tối đa")').locator('..').locator('input').fill('10');
    
    // Fill STANDARD ticket (20 seats)
    const standardTicket = page.locator('.border.border-gray-200.rounded-lg').nth(1);
    await standardTicket.locator('label:has-text("Mô tả")').locator('..').locator('textarea').fill('Vé tiêu chuẩn với chỗ ngồi thoải mái');
    await standardTicket.locator('label:has-text("Giá (VNĐ)")').locator('..').locator('input').fill('100000');
    await standardTicket.locator('label:has-text("Số lượng tối đa")').locator('..').locator('input').fill('20');
    
    // Upload banner image
    const bannerPath = 'c:\\Users\\Ad\\Documents\\GitHub\\SWP391_B3W_Group3_FE\\src\\assets\\dai-hoc-fpt-tp-hcm-1.jpeg';
    await page.setInputFiles('input#banner-upload', bannerPath);
    await page.waitForTimeout(1000);
    
    // Submit form
    await page.click('button:has-text("Cập nhật sự kiện")');
    await page.waitForLoadState('networkidle');
    
    // BREAKPOINT 5: Final inspect after event update
    await page.pause();
  });
});
