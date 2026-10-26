const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const admin = {
  id: 'test-admin', username: 'admin', name: 'Administrator',
  email: 'admin@example.com', role: 'admin', assignedAppIds: [], useIDP: false,
};
const pages = [
  ['dashboard', 'Dashboard'], ['applications', 'Applications'],
  ['email', 'Email Log'], ['user_management', 'Users'],
  ['idp_settings', 'IDP Settings'], ['saviynt_settings', 'EIC Settings'],
  ['import', 'Import Applications'],
];

async function mockApp(page, options = {}) {
  const { INITIAL_APPS } = await import(pathToFileURL(path.resolve('frontend/src/data/initialApps.js')).href);
  let apps = structuredClone(INITIAL_APPS);
  let users = [structuredClone(admin)];
  let emails = [];
  let settings = { nonProd: { url: '', username: '', password: '' }, prod: { url: '', username: '', password: '' } };
  let authenticated = options.authenticated !== false;
  const user = options.user || admin;
  await page.route('**/api/**', async route => {
    const request = route.request();
    const endpoint = new URL(request.url()).pathname;
    const post = request.method() === 'POST';
    let response;
    if (endpoint === '/api/session') {
      return route.fulfill({ status: authenticated ? 200 : 401, json: { success: authenticated, user: authenticated ? user : undefined } });
    }
    if (endpoint === '/api/login') { authenticated = true; response = { success: true, user }; }
    else if (endpoint === '/api/logout') { authenticated = false; response = { success: true }; }
    else if (endpoint === '/api/apps') { if (post) apps = request.postDataJSON(); response = post ? { success: true } : apps; }
    else if (endpoint === '/api/users') { if (post) users = request.postDataJSON(); response = post ? { success: true } : users; }
    else if (endpoint === '/api/emails') { if (post) emails = request.postDataJSON(); response = post ? { success: true } : emails; }
    else if (endpoint === '/api/settings') { if (post) settings = request.postDataJSON(); response = post ? { success: true } : settings; }
    else if (endpoint === '/api/saviynt/primary-instance') response = { configured: false };
    else response = { success: true };
    await route.fulfill({ json: response });
  });
}

test('all pages render without runtime errors and restore after refresh', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockApp(page);
  await page.goto('/');
  for (const [view, title] of pages) {
    await page.locator(`[data-ocid="nav.${view}_button"]`).click();
    await expect(page.locator('.onboarder-page-banner h1')).toHaveText(title);
    await page.reload();
    await expect(page.locator('.onboarder-page-banner h1')).toHaveText(title);
  }
  expect(errors).toEqual([]);
});

test('search, filters, selection, export, and application details preserve behavior', async ({ page }) => {
  await mockApp(page);
  await page.goto('/');
  await page.locator('[data-ocid="nav.applications_button"]').click();
  const initialCount = await page.locator('.applications-page tbody tr[data-status]').count();
  const search = page.locator('[data-ocid="apps.search_input"]');
  await search.fill('AWS IAM');
  await expect(page.locator('.applications-page tbody tr[data-status]')).toHaveCount(1);
  await search.fill('');
  await page.locator('[data-ocid="apps.status_filter"]').selectOption('onboarded');
  await expect(page.locator('.applications-page tbody tr[data-status]')).toHaveCount(2);
  await page.locator('[data-ocid="apps.status_filter"]').selectOption('all');
  await page.locator('.applications-page thead input[type="checkbox"]').check();
  await expect(page.locator('.applications-page tbody input:checked')).toHaveCount(initialCount);
  const download = page.waitForEvent('download');
  await page.locator('[data-ocid="apps.export_csv_button"]').click();
  expect((await download).suggestedFilename()).toBe('saviynt-applications.csv');
  await page.locator('[data-ocid="apps.edit_button.1"]').click();
  await page.locator('[data-ocid="details.tab.lifecycle"]').click();
  await page.reload();
  await expect(page.locator('[data-ocid="details.close_button"]')).toBeVisible();
  await expect(page.getByText('Provisioning Type', { exact: true })).toBeVisible();
});

test('login, session refresh, account menu, theme and logout work', async ({ page }) => {
  await mockApp(page, { authenticated: false });
  await page.goto('/');
  await page.locator('[data-ocid="login.username.input"]').fill('admin');
  await page.locator('[data-ocid="login.password.input"]').fill('test-password');
  await page.locator('[data-ocid="login.submit_button"]').click();
  await expect(page.locator('.onboarder-page-banner h1')).toHaveText('Dashboard');
  await page.reload();
  await expect(page.locator('.sidebar-profile')).toBeVisible();
  await page.locator('.sidebar-profile').click();
  await expect(page.locator('[data-ocid="nav.change_password_button"]')).toBeVisible();
  await page.locator('[data-ocid="nav.theme_toggle"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('[data-ocid="nav.logout_button"]').click();
  await expect(page.locator('[data-ocid="login.username.input"]')).toBeVisible();
});

test('import picker, tabs, user editor and IDP toggle remain usable', async ({ page }) => {
  await mockApp(page);
  await page.goto('/');
  await page.locator('[data-ocid="nav.import_button"]').click();
  const picker = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose CSV file to upload' }).click();
  await (await picker).setFiles({ name: 'sample.csv', mimeType: 'text/csv', buffer: Buffer.from('name,department\nTest,IT\n') });
  await expect(page.getByText('sample.csv', { exact: true })).toBeVisible();
  await page.locator('[data-ocid="import.tab.3"]').click();
  await expect(page.locator('[data-ocid="import.name_input"]')).toBeVisible();
  await page.locator('[data-ocid="nav.user_management_button"]').click();
  await page.locator('[data-ocid="user_management.add_button"]').click();
  await expect(page.locator('[data-ocid="user_management.panel"]')).toBeVisible();
  await page.locator('[data-ocid="user_management.close_button"]').click();
  await page.locator('[data-ocid="nav.idp_settings_button"]').click();
  await expect(page.locator('[data-ocid="idp.issuer_url_input"]')).toBeDisabled();
  await page.locator('[data-ocid="idp.enabled_toggle"]').click();
  await expect(page.locator('[data-ocid="idp.issuer_url_input"]')).toBeEnabled();
});

test('all pages fit desktop, tablet and phone without page overflow', async ({ page }) => {
  await mockApp(page);
  await page.goto('/');
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [view] of pages) {
      await page.locator(`[data-ocid="nav.${view}_button"]`).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${view} at ${width}`).toBe(true);
    }
  }
});

test('backend login, cookie session, document upload and logout on isolated storage', async ({ request }) => {
  const health = await request.get('/api/health');
  expect(await health.json()).toEqual({ status: 'ok' });
  const login = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
  expect((await login.json()).success).toBe(true);
  expect((await (await request.get('/api/session')).json()).user.role).toBe('admin');
  const upload = await request.post('/api/documents/upload', { multipart: { file: { name: 'test-spec.txt', mimeType: 'text/plain', buffer: Buffer.from('Integration specification smoke test') } } });
  expect(upload.ok()).toBe(true);
  await request.post('/api/logout');
  expect((await request.get('/api/session')).status()).toBe(401);
});
