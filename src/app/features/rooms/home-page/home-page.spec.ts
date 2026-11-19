import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RoomSummary } from '../room.model';
import { HomePage } from './home-page';
import { translocoTesting } from '../../../core/i18n/testing';

const ASILE: RoomSummary = {
  id: 1,
  name: "L'Asile de Saint-Ombre",
  theme: 'Hôpital psychiatrique',
  description: "Fermé en 1962, l'asile n'a jamais vraiment été vidé.",
  difficulty: 3,
  minPlayers: 2,
  maxPlayers: 5,
  sessionMinutes: 60,
  pricePerPerson: 30,
};

describe('HomePage', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [translocoTesting()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  async function renderWithResponse(respond: (request: ReturnType<HttpTestingController['expectOne']>) => void) {
    const fixture = TestBed.createComponent(HomePage);
    TestBed.tick();
    respond(httpTesting.expectOne('/api/rooms'));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('affiche une carte par salle renvoyée par l’API', async () => {
    const page = await renderWithResponse((request) => request.flush([ASILE]));

    expect(page.querySelectorAll('article')).toHaveLength(1);
    expect(page.textContent).toContain("L'Asile de Saint-Ombre");
    expect(page.textContent).toContain('Difficulté 3 sur 5');
  });

  it('donne à chaque lien « Découvrir » le nom de sa salle', async () => {
    const page = await renderWithResponse((request) => request.flush([ASILE]));

    const link = page.querySelector('article a');
    expect(link?.textContent?.trim()).toBe("Découvrir la salle L'Asile de Saint-Ombre");
  });

  it('affiche une erreur avec un bouton « Réessayer » si l’API échoue', async () => {
    const page = await renderWithResponse((request) =>
      request.flush('Erreur', { status: 500, statusText: 'Server Error' }),
    );

    const alert = page.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Impossible de charger les salles');
    expect(alert?.querySelector('button')?.textContent).toContain('Réessayer');
  });

  it('indique quand aucune salle n’est ouverte', async () => {
    const page = await renderWithResponse((request) => request.flush([]));

    expect(page.textContent).toContain("Aucune salle n'est ouverte");
  });
});