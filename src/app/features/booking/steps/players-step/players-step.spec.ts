import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../../../core/i18n/language.service';
import { translocoTesting } from '../../../../core/i18n/testing';
import { RoomSummary } from '../../../rooms/room.model';
import { BookingFlowStore } from '../../booking-flow.store';
import { PlayersStep } from './players-step';

const ASILE: RoomSummary = {
  id: 1,
  name: "L'Asile de Saint-Ombre",
  theme: '',
  description: '',
  difficulty: 3,
  minPlayers: 2,
  maxPlayers: 5,
  sessionMinutes: 60,
  pricePerPerson: 30,
};

describe('PlayersStep', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [translocoTesting()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), BookingFlowStore],
    });
  });

  async function render() {
    TestBed.inject(BookingFlowStore).start(1);
    const fixture = TestBed.createComponent(PlayersStep);
    TestBed.tick();
    TestBed.inject(HttpTestingController).expectOne('/api/rooms/1').flush(ASILE);
    await fixture.whenStable();
    return fixture;
  }

  it('part du minimum de la salle et accorde le total au pluriel', async () => {
    const fixture = await render();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('.ec-counter__value')?.textContent).toContain('2');
    expect(page.querySelector('.booking-actions__value')?.textContent).toContain('2 joueurs');
  });

  it('retraduit le message de limite quand la langue change', async () => {
    const fixture = await render();
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector<HTMLButtonElement>('[aria-label="Retirer un joueur"]')!.click();
    await fixture.whenStable();
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'Il faut au moins 2 joueurs dans cette salle.',
    );

    await TestBed.inject(LanguageService).use('en');
    await fixture.whenStable();

    expect(page.querySelector('[role="status"]')?.textContent).toContain('This room needs at least 2 players.');
  });
});