import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Availability } from '../../availability.model';
import { BookingFlowStore } from '../../booking-flow.store';
import { SlotStep } from './slot-step';
import { RoomSummary } from '../../../rooms/room.model';

const ASILE: RoomSummary = {
  id: 1,
  name: "L'Asile de Saint-Ombre",
  theme: 'Hôpital psychiatrique',
  description: 'Description',
  difficulty: 3,
  minPlayers: 2,
  maxPlayers: 5,
  sessionMinutes: 60,
  pricePerPerson: 30,
};

const AVAILABILITY: Availability = {
  roomId: 1,
  roomName: "L'Asile de Saint-Ombre",
  date: '2030-01-05',
  slots: [
    { startAt: '2030-01-05T10:00:00', endAt: '2030-01-05T11:00:00', available: true },
    { startAt: '2030-01-05T11:30:00', endAt: '2030-01-05T12:30:00', available: false },
  ],
  closed: false,
};

describe('SlotStep', () => {
  let httpTesting: HttpTestingController;
  let store: BookingFlowStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        BookingFlowStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    store = TestBed.inject(BookingFlowStore);
    store.start(1);
    store.chooseDate('2030-01-05');
  });

    async function render() {
    const fixture = TestBed.createComponent(SlotStep);
    TestBed.tick();
    httpTesting.expectOne('/api/rooms/1').flush(ASILE);
    httpTesting
      .expectOne((request) => request.url === '/api/rooms/1/availability')
      .flush(AVAILABILITY);
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }
  
  it('affiche les créneaux et marque ceux qui sont complets', async () => {
    const { page } = await render();

    expect(page.querySelectorAll('.ec-slot')).toHaveLength(2);
    expect(page.querySelectorAll('input[type="radio"]:disabled')).toHaveLength(1);
    expect(page.textContent).toContain('Complet');
  });

  it('enregistre le créneau choisi dans le brouillon', async () => {
    const { page } = await render();

    page.querySelector<HTMLInputElement>('input[type="radio"]:not(:disabled)')!.click();

    expect(store.startAt()).toBe('2030-01-05T10:00:00');
  });

  it('demande un créneau et y place le focus si on continue sans choisir', async () => {
    const { fixture, page } = await render();

    page.querySelector<HTMLButtonElement>('.booking-actions button')!.click();
    await fixture.whenStable();

    expect(page.textContent).toContain('Choisissez un créneau pour continuer.');
    expect(document.activeElement).toBe(
      page.querySelector('input[type="radio"]:not(:disabled)'),
    );
  });
});