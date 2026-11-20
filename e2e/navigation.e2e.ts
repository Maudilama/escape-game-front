import { expect, test } from './support/test';

test.describe('Langue', () => {
  test('traduit la page sans la recharger, et s’en souvient', async ({ page, api, isMobile }) => {
    await page.goto('/');
    const title = page.getByRole('heading', { level: 1 });
    await expect(title).toHaveText('Quatre salles. Une seule sortie.');

    if (isMobile) {
      await page.getByRole('button', { name: 'Menu' }).click();
    }
    await page.getByLabel('Langue').filter({ visible: true }).selectOption('es');

    await expect(title).toHaveText('Cuatro salas. Una sola salida.');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect.poll(() => api.lastAcceptLanguage).toBe('es');

    await page.reload();
    await expect(title).toHaveText('Cuatro salas. Una sola salida.');
  });
});

test.describe('Clavier', () => {
  test('le lien d’évitement mène au contenu sans changer de page', async ({ page }) => {
    await page.goto('/salles/1');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Aller au contenu' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page.locator('#contenu')).toBeFocused();
    await expect(page).toHaveURL(/\/salles\/1$/);

    await page.keyboard.press('Tab');
    await expect(page.locator('#contenu :focus')).toHaveCount(1);
  });
});