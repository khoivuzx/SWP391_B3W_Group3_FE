/**
 * E2E Test Fixtures and Helper Functions
 * Provides reusable test data, authentication helpers, and common actions
 */

import { Page } from '@playwright/test';

export const TEST_USERS = {
  student: {
    email: 'an.nvse14001@fpt.edu.vn',
    password: '123456',
    role: 'student',
    name: 'Test Student'
  },
  organizer: {
    email: 'huy.lqclub@fpt.edu.vn',
    password: '123456',
    role: 'organizer',
    name: 'Test Organizer'
  },
  staff: {
    email: 'thu.pmso@fpt.edu.vn',
    password: '123456',
    role: 'staff',
    name: 'Test Staff'
  }
};

export const SAMPLE_EVENTS = {
  freeEvent: {
    name: 'Free Workshop: React Testing',
    description: 'Learn how to test React applications with Playwright',
    date: '2025-12-20',
    time: '14:00',
    duration: 120, // minutes
    capacity: 50,
    ticketType: 'free'
  },
  paidEvent: {
    name: 'FPT Tech Conference 2025',
    description: 'Annual technology conference with industry speakers',
    date: '2025-12-25',
    time: '09:00',
    duration: 480,
    capacity: 200,
    ticketPrice: 100000,
    ticketType: 'paid'
  }
};

/**
 * Login helper function
 */
export async function login(page: Page, userType: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userType];
  
  await page.goto('/login');
  await page.fill('input[name="email"], input[type="email"]', user.email);
  await page.fill('input[name="password"], input[type="password"]', user.password);
  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Đăng nhập")');
  
  // Wait for navigation to dashboard or home
  await page.waitForURL(/\/(dashboard|events)/, { timeout: 10000 });
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  // Look for logout button by title attribute (matches Layout.tsx logout button)
  await page.click('button[title="Đăng xuất"]');
  await page.waitForURL(/\/(guest|login)/, { timeout: 5000 });
}

/**
 * Create event helper function
 */
export async function createEvent(page: Page, eventData: typeof SAMPLE_EVENTS.freeEvent) {
  await page.goto('/events');
  await page.click('button:has-text("Create Event"), button:has-text("Tạo sự kiện"), a[href*="create"]');
  
  // Fill in event details
  await page.fill('input[name="name"]', eventData.name);
  await page.fill('textarea[name="description"]', eventData.description);
  await page.fill('input[name="date"], input[type="date"]', eventData.date);
  await page.fill('input[name="time"], input[type="time"]', eventData.time);
  await page.fill('input[name="capacity"]', eventData.capacity.toString());
  
  // Submit form
  await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Tạo")');
  
  // Wait for success confirmation
  await page.waitForSelector('.toast-success, .alert-success, text=/created successfully/i', {
    timeout: 5000
  });
}

/**
 * Book ticket helper function
 */
export async function bookTicket(page: Page, eventName: string) {
  // Navigate to events
  await page.goto('/events');
  
  // Find and click on the specific event
  await page.click(`text="${eventName}"`);
  
  // Click register/book button
  await page.click('button:has-text("Register"), button:has-text("Book"), button:has-text("Đăng ký")');
  
  // Confirm booking (if confirmation modal exists)
  const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Xác nhận")');
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
  }
  
  // Wait for success
  await page.waitForSelector('.toast-success, text=/successfully registered/i', {
    timeout: 10000
  });
}

/**
 * Navigate to My Tickets
 */
export async function navigateToMyTickets(page: Page) {
  await page.goto('/my-tickets');
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for toast message
 */
export async function waitForToast(page: Page, type: 'success' | 'error' = 'success') {
  const selector = type === 'success' 
    ? '.toast-success, .alert-success, [role="alert"]:has-text("success")'
    : '.toast-error, .alert-error, [role="alert"]:has-text("error")';
  
  await page.waitForSelector(selector, { timeout: 5000 });
}

/**
 * Fill reCAPTCHA (for testing, you might need to disable or mock this)
 */
export async function handleRecaptcha(page: Page) {
  // In test environment, reCAPTCHA should be disabled or mocked
  // This is a placeholder for documentation
  const recaptchaFrame = page.frameLocator('iframe[src*="recaptcha"]');
  const checkbox = recaptchaFrame.locator('.recaptcha-checkbox');
  
  if (await checkbox.isVisible({ timeout: 2000 }).catch(() => false)) {
    await checkbox.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Take screenshot for debugging
 */
export async function debugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `debug-${name}-${Date.now()}.png`, fullPage: true });
}
