import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Booking } from '../../booking/booking.model';
import { MyBookingsPage } from './my-bookings-page';

function booking(overrides: Partial<Booking>): Booking {
  return {
    id: 1,
    roomId: 1,
    roomName: "L'Asile de Saint-Ombre",
    customerEmail: 'maud@example.com',
    startAt: '2030-01-05T14:30:00',
    endAt: '2030-01-05T15:30:00',
    playerCount: 4,
    totalPrice: 120,
    status: 'CONFIRMED',
    ...overrides,
  };
}

function inHours(hours: number): string {
  const date = new Date(Date.now() + hours * 3_600_000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

describe('MyBookingsPage', () => {
  let httpTesting: HttpTestingController;

  beforeAll(() => {
    const proto = HTMLDialogElement.prototype;
    proto.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  async function render(bookings: Booking[]) {
    const fixture = TestBed.createComponent(MyBookingsPage);
    TestBed.tick();
    httpTesting.expectOne('/api/bookings/me').flush(bookings);
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  it('sépare les réservations à venir des réservations passées et annulées', async () => {
    const { page } = await render([
      booking({ id: 1 }),
      booking({ id: 2, roomName: 'Le Rituel', status: 'CANCELLED' }),
    ]);

    const sections = page.querySelectorAll('section');
    expect(sections[0].textContent).toContain("L'Asile de Saint-Ombre");
    expect(sections[1].textContent).toContain('Le Rituel');
    expect(sections[1].textContent).toContain('Annulée');
  });

  it('ne propose pas d’annuler à moins de 24 h de la session', async () => {
    const { page } = await render([booking({ startAt: inHours(3), endAt: inHours(4) })]);

    expect(page.textContent).toContain('Annulation impossible à moins de 24 h');
    expect(page.querySelector('.booking-card .ec-btn--danger')).toBeNull();
  });

  it('invite à découvrir les salles quand il n’y a aucune réservation', async () => {
    const { page } = await render([]);

    expect(page.textContent).toContain("Vous n'avez pas encore de réservation.");
  });

  it('annule une réservation après confirmation', async () => {
    const { fixture, page } = await render([booking({ id: 7 })]);

    page.querySelector<HTMLButtonElement>('.booking-card .ec-btn--danger')!.click();
    await fixture.whenStable();
    const dialog = page.querySelector('dialog')!;
    expect(dialog.hasAttribute('open')).toBe(true);

    dialog.querySelector<HTMLButtonElement>('.ec-btn--danger')!.click();
    httpTesting
      .expectOne({ method: 'PATCH', url: '/api/bookings/7/cancel' })
      .flush(booking({ id: 7, status: 'CANCELLED' }));
    TestBed.tick();
    httpTesting.expectOne('/api/bookings/me').flush([booking({ id: 7, status: 'CANCELLED' })]);
    await fixture.whenStable();

    expect(dialog.hasAttribute('open')).toBe(false);
    expect(page.querySelector('[role="status"]')?.textContent).toContain('a été annulée');
  });

  it('affiche dans la fenêtre le refus de l’API (422)', async () => {
    const { fixture, page } = await render([booking({ id: 7 })]);

    page.querySelector<HTMLButtonElement>('.booking-card .ec-btn--danger')!.click();
    await fixture.whenStable();
    page.querySelector<HTMLButtonElement>('dialog .ec-btn--danger')!.click();
    httpTesting.expectOne('/api/bookings/7/cancel').flush(
      { detail: 'Une réservation ne peut plus être annulée moins de 24 h avant la session.' },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await fixture.whenStable();

    expect(page.querySelector('dialog [role="alert"]')?.textContent).toContain('moins de 24 h');
  });
});