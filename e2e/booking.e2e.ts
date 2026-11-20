import { CUSTOMER } from './support/fake-api';
import { choose, signIn } from './support/helpers';
import { expect, test } from './support/test';

test.describe('Réservation', () => {
  test('réserve une salle de bout en bout, connexion comprise', async ({ page, api }) => {
    await page.goto('/');
    await page.getByRole('link', { name: "Découvrir la salle L'Asile de Saint-Ombre" }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText("L'Asile de Saint-Ombre");
    await page.getByRole('link', { name: "Réserver L'Asile de Saint-Ombre" }).click();

    await expect(page.getByRole('radio', { name: /lundi 7 janvier, Fermé/ })).toBeDisabled();
    await choose(page, /jeudi 3 janvier/);
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'À quelle heure ?' })).toBeFocused();
    await choose(page, /14:30/);
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByText('Connectez-vous pour réserver ce créneau.')).toBeVisible();
    await page.getByLabel('Adresse e-mail').fill(CUSTOMER.email);
    await page.getByLabel('Mot de passe').fill(CUSTOMER.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Combien serez-vous ?' })).toBeVisible();
    await page.getByRole('button', { name: 'Ajouter un joueur' }).click();
    await expect(page.locator('.booking-actions__value')).toContainText('3 joueurs');
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByText(/jeudi 3 janvier/)).toBeVisible();
    await page.getByRole('button', { name: 'Confirmer la réservation' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Réservation confirmée' })).toBeVisible();
    expect(api.bookings.at(-1)).toMatchObject({
      roomId: 1,
      startAt: '2030-01-03T14:30:00',
      playerCount: 3,
      totalPrice: 90,
    });
  });

  test('propose un autre créneau quand le sien vient d’être pris', async ({ page, api }) => {
    await signIn(page, CUSTOMER);
    await page.goto('/reserver/1/date');
    await choose(page, /jeudi 3 janvier/);
    await page.getByRole('button', { name: 'Continuer' }).click();
    await choose(page, /14:30/);
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();

    api.takeSlotBeforeNextBooking();
    await page.getByRole('button', { name: 'Confirmer la réservation' }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toContainText("Ce créneau vient d'être réservé");
    await expect(alert).toBeFocused();

    await page.getByRole('button', { name: 'Choisir un autre créneau' }).click();
    await expect(page).toHaveURL(/\/reserver\/1\/creneau$/);
    await expect(page.getByRole('heading', { level: 1, name: 'À quelle heure ?' })).toBeVisible();
  });
});