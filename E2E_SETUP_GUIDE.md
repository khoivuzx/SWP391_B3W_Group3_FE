# E2E Testing Setup Guide

## Cài đặt (vô terminal mà mình hay chạy npm run dev, thay vì mấy cái đó thì copy 2 dòng này vô trước để cài Playwright)

npm install -D @playwright/test
npx playwright install chromium


**Run with UI/Debug view:**

[npm run test:e2e:ui]  HOẶC [npm run test:e2e:debug] THAY CHO [npm run dev]
 (ae xài thử thấy cái nào dễ hiểu hơn thì xài, trước khi chạy cái này bật BE trước)

để test riêng từng flow: auth, booking, events, checkin thì ae theo cú pháp này:

ví dụ như tui muốn test flow tạo event

npx playwright test events.spec.ts --debug


ae đọc đến đây là tự mò đc rồi, phần dưới tui để lại để con AI hiểu context để giải thích lại cho ae

## Test Reports

### View HTML Report

After tests complete, view detailed report:

npx playwright show-report


## Understanding Test Breakpoints

Our tests include breakpoints (`await page.pause()`) at key inspection points:

**In events.spec.ts:**
1. **BREAKPOINT 1**: Organizer viewing their newly created request
2. **BREAKPOINT 2**: Staff viewing the pending request
3. **BREAKPOINT 3**: Staff seeing the request has been updated
4. **BREAKPOINT 4**: Organizer viewing the approved request
5. **BREAKPOINT 5**: Final inspect after event update

When running with `--headed` or `--ui`, the test will pause at these points so you can inspect the page.

## Writing Tests

### Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });
  
  test('TC-XXX: Should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Best Practices

1. **Use Data Test IDs**: Add `data-testid` attributes to elements for stable selectors
```tsx
<button data-testid="submit-button">Submit</button>
```

```typescript
await page.click('[data-testid="submit-button"]');
```

2. **Wait for Navigation**: Always wait for page loads
```typescript
await expect(page).toHaveURL(/\/dashboard/);
```

3. **Use Locators**: Prefer Playwright locators over CSS selectors
```typescript
await page.locator('button:has-text("Login")').click();
```

4. **Handle Async**: Always await Playwright actions
```typescript
await page.fill('input', 'value');
await page.click('button');
```

5. **Clean Test Data**: Create unique data for each test run
```typescript
const uniqueEmail = `test.${Date.now()}@fpt.edu.vn`;
```

## Test Data Setup

### Option 1: Use Test Database
Configure a separate test database in your environment:

```bash
# .env.test
VITE_SUPABASE_URL=your-test-supabase-url
VITE_SUPABASE_ANON_KEY=your-test-key
```

### Option 2: Seed Test Data
Create a script to seed test data before running tests:

```typescript
// scripts/seed-test-data.ts
import { createClient } from '@supabase/supabase-js';

// Create test users, events, etc.
```

Run before tests:
```bash
npm run seed:test && npm run test:e2e
```

### Option 3: Mock Backend
Use Playwright's request interception to mock API responses:

```typescript
await page.route('**/api/events', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ events: [...] })
  });
});
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Debugging Tips

### 1. Take Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 2. Use Debug Mode
```bash
npx playwright test --debug
```

### 3. Use Playwright Inspector
```typescript
await page.pause(); // Pauses execution
```

### 4. Console Logs
```typescript
page.on('console', msg => console.log('Browser log:', msg.text()));
```

### 5. Network Monitoring
```typescript
page.on('request', request => console.log('Request:', request.url()));
page.on('response', response => console.log('Response:', response.url(), response.status()));
```

## Common Issues

### Issue: PowerShell execution policy error
**Error**: `cannot be loaded because running scripts is disabled on this system`

**Solution**: Run this command before npm commands:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

### Issue: Tests timeout
**Solution**: Increase timeout in config or specific test
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Issue: Dev server not running
**Error**: `ECONNREFUSED` or connection errors

**Solution**: Start dev server first:
```bash
npm run dev
```
Then run tests in a separate terminal.

### Issue: Login fails
**Solution**: Check that test users exist in database:
- Student: `an.nvse14001@fpt.edu.vn` / `123456`
- Organizer: `huy.lqclub@fpt.edu.vn` / `123456`
- Staff: `thu.pmso@fpt.edu.vn` / `123456`

### Issue: Port 9323 already in use (report viewer)
**Solution**: Kill existing Playwright process:
```powershell
# Find process using port 9323
netstat -ano | findstr :9323

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

## Test Users

The following test users are configured in `e2e/helpers.ts`:

| Role      | Email                          | Password | Purpose                        |
|-----------|--------------------------------|----------|--------------------------------|
| Student   | an.nvse14001@fpt.edu.vn       | 123456   | Book tickets, check-in         |
| Organizer | huy.lqclub@fpt.edu.vn         | 123456   | Create events, manage requests |
| Staff     | thu.pmso@fpt.edu.vn           | 123456   | Approve requests, manage system|

**Important**: Ensure these users exist in your test database before running tests.

## Quick Start Guide for Your Friend

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd SWP391_B3W_Group3_FE
   ```

2. **Install dependencies**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   npm install
   ```

3. **Install Playwright**
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

4. **Start dev server** (in one terminal)
   ```bash
   npm run dev
   ```

5. **Run tests with UI** (in another terminal)
   ```bash
   npm run test:e2e:ui
   ```

6. **Watch the magic happen!** 🎉
   - Tests will run in a visual interface
   - You'll see each step happening
   - Tests pause at breakpoints for inspection
   - Click "Resume" to continue

## What Tests Are Included

### 1. Authentication (`auth.spec.ts`)
- ✅ TC-001.1: Student login
- ✅ TC-001.2: Organizer login  
- ✅ TC-001.3: Logout

### 2. Event Management (`events.spec.ts`)
- ✅ TC-002/003: Complete event request flow
  - Organizer creates event request
  - Staff views and approves request
  - Organizer completes event details (speaker, tickets, banner)

### 3. Booking & Tickets (`booking.spec.ts`)
- ✅ TC-004.1: View event details
- ✅ TC-004.2: Display existing tickets
- ⚠️ Payment tests skipped (requires VNPay)

### 4. Check-in (`checkin.spec.ts`)
- ✅ TC-005.1: QR code check-in
- ✅ TC-005.2: Manual check-in

## Next Steps

After getting familiar with running tests, you can:
1. Add more test cases (see `E2E_TEST_PLAN.md`)
2. Customize test data
3. Add assertions for your specific requirements
4. Integrate with CI/CD pipeline

For questions or issues, contact the QA team or check the test plan document.

### Issue: Element not found
**Solution**: Use proper waits
```typescript
await page.waitForSelector('.element', { timeout: 10000 });
```

### Issue: reCAPTCHA blocks tests
**Solution**: Disable reCAPTCHA in test environment
```typescript
// In your app code
const isTestEnv = import.meta.env.VITE_ENV === 'test';
{!isTestEnv && <ReCAPTCHA />}
```

### Issue: Authentication state not persisted
**Solution**: Use Playwright's storage state
```typescript
// Save auth state after login
await page.context().storageState({ path: 'auth.json' });

// Reuse auth state
const context = await browser.newContext({ storageState: 'auth.json' });
```

## Performance Optimization

### Run tests in parallel
```bash
npx playwright test --workers=4
```

### Run only changed tests (with Git)
```bash
npx playwright test --only-changed
```

### Shard tests for CI
```bash
npx playwright test --shard=1/4
npx playwright test --shard=2/4
```

## Test Coverage Goals

- ✅ 90%+ pass rate
- ✅ All Priority 1 tests pass before release
- ✅ Average execution time < 30 minutes
- ✅ Zero flaky tests (< 5% failure rate)

## Next Steps

1. Review test plan: `E2E_TEST_PLAN.md`
2. Set up test database or mocking strategy
3. Run tests locally to verify setup
4. Configure CI/CD pipeline
5. Add more test cases for your specific features
6. Monitor test metrics and refine

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selectors Guide](https://playwright.dev/docs/selectors)
