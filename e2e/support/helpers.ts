import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

export type Language = 'fr' | 'en' | 'es';

export async function useLanguage(page: Page, language: Language): Promise<void> {
  await page.addInitScript((value) => {
    window.localStorage.setItem('escape-game.language', JSON.stringify(value));
  }, language);
}

export async function signIn(page: Page, user: { email: string; password: string }): Promise<void> {
  await page.goto('/connexion');
  await page.locator('#login-email').fill(user.email);
  await page.locator('#login-password').fill(user.password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/connexion/);
}

export async function choose(page: Page, name: string | RegExp): Promise<void> {
  const option = page.getByRole('radio', { name });
  await page.locator('label').filter({ has: option }).click();
  await expect(option).toBeChecked();
}

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  await test.info().attach('axe-violations.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const summary = results.violations.map(
    (violation) =>
      `${violation.id} [${violation.impact}] ${violation.help} → ${violation.nodes
        .map((node) => node.target.join(' '))
        .join(' | ')}`,
  );
  expect(summary).toEqual([]);
}