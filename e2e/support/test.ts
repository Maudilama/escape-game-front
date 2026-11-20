import { test as base } from '@playwright/test';
import { FakeApi, NOW } from './fake-api';

export { expect } from '@playwright/test';

export const test = base.extend<{ api: FakeApi }>({
  api: [
    async ({ page }, use) => {
      const api = new FakeApi();
      await page.clock.setFixedTime(NOW);
      await page.route('**/api/**', (route) => api.handle(route));
      await use(api);
    },
    { auto: true },
  ],
});