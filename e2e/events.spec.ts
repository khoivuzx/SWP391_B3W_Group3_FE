/**
 * TC-003, TC-004: Event Request Management E2E Tests
 * Tests complete event request workflow: creation, viewing, and staff approval
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './helpers';

test.describe('Event Request Management', () => {
  
  test('TC-003/004: Complete event request flow - create, view, approve', async ({ page }) => {
    // Prerequisite: Create an event request first
    await login(page, 'organizer');
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Tạo sự kiện"), a:has-text("Tạo sự kiện")');
    
    const timestamp = Date.now();
    const eventTitle = `E2E Approval Test ${timestamp}`;
    
    await page.fill('input[name="title"]', eventTitle);
    await page.fill('textarea[name="description"]', 'Test event for approval flow');
    await page.fill('textarea[name="reason"]', 'Testing staff approval');
    await page.fill('input[name="preferredStart"]', '2025-12-26T10:00');
    await page.fill('input[name="preferredEnd"]', '2025-12-26T12:00');
    await page.fill('input[name="expectedParticipants"]', '30');
    await page.click('button[type="submit"]');
    
    // Wait for redirect (toast appears briefly then disappears)
    await page.waitForURL(/\/dashboard\/event-requests/, { timeout: 10000 });
    await expect(page.locator(`text="${eventTitle}"`)).toBeVisible({ timeout: 5000 });
    
    // BREAKPOINT 1: Organizer viewing their newly created request
    await page.pause();
    
    // Step 1: Login as staff
    await page.goto('/login');
    await login(page, 'staff');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Navigate to event requests and find the pending request
    await page.goto('/dashboard/event-requests');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text="${eventTitle}"`)).toBeVisible({ timeout: 5000 });
    
    // BREAKPOINT 2: Staff viewing the pending request
    await page.pause();
    
    // Step 3: Click on the request to view details (if needed) or approve directly
    const requestRow = page.locator(`text="${eventTitle}"`).locator('..');
    
    // Step 4: Click approve button to open modal
    const approveButton = requestRow.locator('button:has-text("Duyệt")').first();
    await approveButton.click();
    
    // Step 5: Wait for the approval modal and click the confirm button
    await expect(page.getByRole('heading', { name: 'Duyệt yêu cầu' })).toBeVisible({ timeout: 5000 });
    
    // Click the confirm "Duyệt" button in the modal
    const modalApproveButton = page.locator('div').filter({ hasText: 'Hủy' }).locator('button:has-text("Duyệt")').last();
    await modalApproveButton.click();
    
    // Wait for modal to close (toast appears briefly then disappears)
    await expect(page.getByRole('heading', { name: 'Duyệt yêu cầu' })).toBeHidden({ timeout: 10000 });
    
    // Step 6: Staff verifies the approved request is still in "Chờ" tab (waiting for organizer to complete)
    await page.goto('/dashboard/event-requests');
    await page.waitForLoadState('networkidle');
    // Should be in "Chờ" tab by default, status changed to "Chờ Cập Nhật Thông Tin"
    await expect(page.locator(`text="${eventTitle}"`)).toBeVisible({ timeout: 5000 });
    
    // BREAKPOINT 3: Staff seeing the request has been updated (status changed)
    await page.pause();
    
    // Step 7: Login as organizer and verify they can see the approved status
    await page.goto('/login');
    await login(page, 'organizer');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/dashboard/event-requests');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text="${eventTitle}"`)).toBeVisible({ timeout: 5000 });
    
    // Verify the status shows as approved (now need update)
    const organizerRequestRow = page.locator(`text="${eventTitle}"`).locator('..');
    await expect(organizerRequestRow.locator('text=/Chờ cập nhật thông tin/i')).toBeVisible();
    
    // BREAKPOINT 4: Organizer viewing the approved request
    await page.pause();
    
    // Step 8: Click on the request to open detail modal
    await page.click(`text="${eventTitle}"`);
    
    // Wait for modal to appear
    await page.waitForLoadState('networkidle');
    
    // Click "Cập nhật thông tin" button in the modal to navigate to edit page
    await page.click('button:has-text("Cập nhật thông tin")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/dashboard\/events\/\d+\/edit/);
    
    // Step 9: Fill speaker information
    // Find speaker section and fill inputs by their position/label
    const speakerSection = page.locator('text="Thông tin diễn giả"').locator('..');
    await speakerSection.locator('label:has-text("Họ và tên")').locator('..').locator('input').fill('Dr. Nguyen Van A');
    await speakerSection.locator('label:has-text("Tiểu sử")').locator('..').locator('textarea').fill('Chuyên gia công nghệ với hơn 10 năm kinh nghiệm trong lĩnh vực AI và Machine Learning');
    await speakerSection.locator('label:has-text("Email")').locator('..').locator('input').fill('speaker@example.com');
    await speakerSection.locator('label:has-text("Số điện thoại")').locator('..').locator('input').fill('0901234567');
    // Skip avatar upload
    
    // Step 10: Fill VIP ticket information (first ticket)
    const vipTicket = page.locator('.border.border-gray-200.rounded-lg').first();
    await vipTicket.locator('label:has-text("Mô tả")').locator('..').locator('textarea').fill('Vé VIP bao gồm chỗ ngồi hàng đầu và phần quà đặc biệt');
    await vipTicket.locator('label:has-text("Giá (VNĐ)")').locator('..').locator('input').fill('200000');
    await vipTicket.locator('label:has-text("Số lượng tối đa")').locator('..').locator('input').fill('10');
    
    // Step 11: Fill STANDARD ticket information (second ticket)
    const standardTicket = page.locator('.border.border-gray-200.rounded-lg').nth(1);
    await standardTicket.locator('label:has-text("Mô tả")').locator('..').locator('textarea').fill('Vé tiêu chuẩn với chỗ ngồi thoải mái');
    await standardTicket.locator('label:has-text("Giá (VNĐ)")').locator('..').locator('input').fill('100000');
    await standardTicket.locator('label:has-text("Số lượng tối đa")').locator('..').locator('input').fill('20');
    
    // Step 12: Upload banner image
    const bannerPath = 'c:\\Users\\Ad\\Documents\\GitHub\\SWP391_B3W_Group3_FE\\src\\assets\\dai-hoc-fpt-tp-hcm-1.jpeg';
    await page.setInputFiles('input#banner-upload', bannerPath);
    
    // Wait for image preview to load
    await page.waitForTimeout(1000);
    
    // Step 13: Submit the form
    await page.click('button:has-text("Cập nhật sự kiện")');
    
    // Wait for success (URL redirect or success message)
    await page.waitForLoadState('networkidle');
    
    // BREAKPOINT 5: Final inspect after event update
    await page.pause();
  });
});
