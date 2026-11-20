import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { translocoTesting } from '../../../../core/i18n/testing';
import { RoomSummary } from '../../../rooms/room.model';
import { BookingFlowStore } from '../../booking-flow.store';
import { SummaryStep } from './summary-step';

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

describe('SummaryStep', () => {
  let httpTesting: HttpTestingController;
  let store: BookingFlowStore;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [translocoTesting()],
      providers: [BookingFlowStore, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    store = TestBed.inject(BookingFlowStore);
    store.start(1);
    store.chooseDate('2030-01-05');
    store.chooseSlot('2030-01-05T14:30:00');
    store.choosePlayers(4);
  });

  async function render() {
    const fixture = TestBed.createComponent(SummaryStep);
    TestBed.tick();
    httpTesting.expectOne('/api/rooms/1').flush(ASILE);
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  function clickConfirm(page: HTMLElement) {
    page.querySelector<HTMLButtonElement>('.booking-actions button')!.click();
    return httpTesting.expectOne({ method: 'POST', url: '/api/bookings' });
  }

  it('affiche le total et l’heure limite d’annulation', async () => {
    const { page } = await render();

    expect(page.textContent).toContain('120');
    expect(page.textContent).toContain("Annulation gratuite jusqu'au");
    expect(page.textContent).toContain('14:30');
  });

  it('envoie la réservation, vide le brouillon et ouvre la confirmation', async () => {
    const { page } = await render();

    const request = clickConfirm(page);
    expect(request.request.body).toEqual({ roomId: 1, startAt: '2030-01-05T14:30:00', playerCount: 4 });
    request.flush({ id: 42 });

    expect(store.startAt()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/reservations', 42, 'confirmation'], { replaceUrl: true });
  });

  it('propose un autre créneau quand celui-ci vient d’être pris (409)', async () => {
    const { fixture, page } = await render();

    clickConfirm(page).flush({ status: 409 }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    const alert = page.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("Ce créneau vient d'être réservé");
    expect(alert?.querySelector('button')?.textContent).toContain('Choisir un autre créneau');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('traduit le refus de l’API d’après son code (422)', async () => {
    const { fixture, page } = await render();

    clickConfirm(page).flush(
      { code: 'ROOM_CLOSED', detail: 'Texte destiné aux développeurs, jamais affiché.' },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await fixture.whenStable();

    const alert = page.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("L'escape game est fermé ce jour-là.");
    expect(alert?.textContent).not.toContain('jamais affiché');
  });

  it('affiche un message générique quand le code de l’API est inconnu (422)', async () => {
    const { fixture, page } = await render();

    clickConfirm(page).flush(
      { code: 'CODE_AJOUTE_PLUS_TARD', detail: 'Texte destiné aux développeurs, jamais affiché.' },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await fixture.whenStable();

    const alert = page.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("Cette réservation n'est pas possible.");
    expect(alert?.textContent).not.toContain('jamais affiché');
  });

  it('n’envoie qu’une seule réservation en cas de double clic', async () => {
    const { page } = await render();
    const button = page.querySelector<HTMLButtonElement>('.booking-actions button')!;

    button.click();
    button.click();

    expect(httpTesting.match({ method: 'POST', url: '/api/bookings' })).toHaveLength(1);
  });
});