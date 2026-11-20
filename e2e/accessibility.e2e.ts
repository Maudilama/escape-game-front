import { Page } from '@playwright/test';
import { ADMIN, CUSTOMER } from './support/fake-api';
import { expectNoAccessibilityViolations, Language, signIn, useLanguage } from './support/helpers';
import { expect, test } from './support/test';

const LANGUAGES: Language[] = ['fr', 'en', 'es'];

const PUBLIC_PAGES = [
  { name: 'accueil', path: '/' },
  { name: 'fiche salle', path: '/salles/1' },
  { name: 'choix du jour', path: '/reserver/1/date' },
  { name: 'connexion', path: '/connexion' },
  { name: 'inscription', path: '/inscription' },
  { name: 'page introuvable', path: '/cette-page-n-existe-pas' },
];

async function open(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

for (const language of LANGUAGES) {
  test.describe(`Accessibilité automatique (${language})`, () => {
    test.beforeEach(async ({ page }) => {
      await useLanguage(page, language);
    });

    for (const { name, path } of PUBLIC_PAGES) {
      test(name, async ({ page }) => {
        await open(page, path);
        await expect(page.locator('html')).toHaveAttribute('lang', language);
        await expectNoAccessibilityViolations(page);
      });
    }

    test('mes réservations, puis la fenêtre d’annulation ouverte', async ({ page, api }) => {
      api.addBooking({ roomId: 1, startAt: '2030-01-05T14:30:00', email: CUSTOMER.email, playerCount: 4 });
      api.addBooking({ roomId: 3, startAt: '2029-12-20T19:00:00', email: CUSTOMER.email });
      await signIn(page, CUSTOMER);

      await open(page, '/mes-reservations');
      await expectNoAccessibilityViolations(page);

      await page.locator('.booking-card .ec-btn--danger').first().click();
      await expect(page.locator('dialog[open]')).toBeVisible();
      await expectNoAccessibilityViolations(page);
    });

    test('planning administrateur', async ({ page, api }) => {
      api.addBooking({ roomId: 1, startAt: '2030-01-05T14:30:00', email: CUSTOMER.email, playerCount: 4 });
      api.addBooking({ roomId: 2, startAt: '2030-01-05T14:30:00', email: 'bob@example.com', status: 'CANCELLED' });
      await signIn(page, ADMIN);

      await open(page, '/admin/planning?date=2030-01-05');
      await expectNoAccessibilityViolations(page);
    });

    test('menu mobile ouvert', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Le menu plein écran n’existe que sur mobile.');
      await open(page, '/');

      await page.locator('.site-header__menu-button').click();
      await expect(page.locator('dialog#menu-mobile')).toBeVisible();
      await expectNoAccessibilityViolations(page);
    });
  });
}