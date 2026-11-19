import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Booking } from '../../booking/booking.model';
import { RoomSummary } from '../../rooms/room.model';
import { PlanningPage } from './planning-page';
import { translocoTesting } from '../../../core/i18n/testing';

function room(id: number, name: string): RoomSummary {
  return {
    id,
    name,
    theme: '',
    description: '',
    difficulty: 3,
    minPlayers: 2,
    maxPlayers: 6,
    sessionMinutes: 60,
    pricePerPerson: 30,
  };
}

function booking(overrides: Partial<Booking>): Booking {
  return {
    id: 1,
    roomId: 1,
    roomName: "L'Asile de Saint-Ombre",
    customerEmail: 'alice@example.com',
    startAt: '2030-01-05T10:00:00',
    endAt: '2030-01-05T11:00:00',
    playerCount: 4,
    totalPrice: 120,
    status: 'CONFIRMED',
    ...overrides,
  };
}

const BOOKINGS: Booking[] = [
  booking({ id: 1 }),
  booking({ id: 2, roomId: 2, roomName: 'Le Rituel', customerEmail: 'bob@example.com', playerCount: 3, totalPrice: 96 }),
  booking({ id: 3, roomId: 2, roomName: 'Le Rituel', customerEmail: 'emma@example.com', playerCount: 6, totalPrice: 192, status: 'CANCELLED' }),
];

describe('PlanningPage', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [translocoTesting()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  async function render(date = '2030-01-05') {
    const fixture = TestBed.createComponent(PlanningPage);
    fixture.componentRef.setInput('date', date);
    TestBed.tick();
    const request = httpTesting.expectOne((req) => req.url === '/api/admin/bookings');
    httpTesting.expectOne('/api/rooms').flush([room(1, "L'Asile de Saint-Ombre"), room(2, 'Le Rituel')]);
    return { fixture, request };
  }

  it('charge le planning du jour indiqué dans l’adresse', async () => {
    const { fixture, request } = await render('2030-01-05');

    expect(request.request.params.get('date')).toBe('2030-01-05');
    request.flush(BOOKINGS);
    await fixture.whenStable();
  });

  it('ne compte que les réservations confirmées dans le résumé', async () => {
    const { fixture, request } = await render();
    request.flush(BOOKINGS);
    await fixture.whenStable();

    const summary = (fixture.nativeElement as HTMLElement).querySelector('.planning__summary');
    expect(summary?.textContent).toContain('2 réservations confirmées');
    expect(summary?.textContent).toContain('7 joueurs');
  });

  it('ne propose pas d’annuler une réservation déjà annulée', async () => {
    const { fixture, request } = await render();
    request.flush(BOOKINGS);
    await fixture.whenStable();

    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('.planning-table .ec-btn--danger');
    expect(buttons).toHaveLength(2);
  });

  it('filtre le planning par salle', async () => {
    const { fixture, request } = await render();
    request.flush(BOOKINGS);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    const select = page.querySelector<HTMLSelectElement>('#planning-room')!;
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const rows = page.querySelectorAll('.planning-table tbody tr');
    expect(rows).toHaveLength(2);
    expect(page.querySelector('.planning-table')?.textContent).not.toContain('alice@example.com');
  });

  it('affiche aujourd’hui quand la date de l’adresse est invalide', async () => {
    const { fixture, request } = await render('demain');

    expect(request.request.params.get('date')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    request.flush([]);
    await fixture.whenStable();
  });
});