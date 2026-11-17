import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RoomSummary } from '../room.model';
import { RoomPage } from './room-page';

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

describe('RoomPage', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  async function renderRoom(id: string, respond: (request: TestRequest) => void) {
    const fixture = TestBed.createComponent(RoomPage);
    fixture.componentRef.setInput('id', id);
    TestBed.tick();
    respond(httpTesting.expectOne(`/api/rooms/${id}`));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('affiche la salle demandée dans l’URL', async () => {
    const page = await renderRoom('1', (request) => request.flush(ASILE));

    expect(page.querySelector('h1')?.textContent).toContain("L'Asile de Saint-Ombre");
    expect(page.textContent).toContain('2 à 5');
    expect(page.textContent).toContain('60 min');
  });

  it('met le nom de la salle dans le titre de l’onglet', async () => {
    await renderRoom('1', (request) => request.flush(ASILE));

    expect(TestBed.inject(Title).getTitle()).toBe("L'Asile de Saint-Ombre · Escape Game");
  });

  it('associe chaque caractéristique à sa valeur', async () => {
    const page = await renderRoom('1', (request) => request.flush(ASILE));

    const facts = Array.from(page.querySelectorAll('.room__fact')).map((fact) => [
      fact.querySelector('dt')?.textContent?.trim(),
      fact.querySelector('dd')?.textContent?.trim(),
    ]);
    expect(facts).toContainEqual(['Difficulté', '3 sur 5']);
  });

  it('affiche « salle introuvable » quand l’API répond 404, sans bouton Réessayer', async () => {
    const page = await renderRoom('99', (request) =>
      request.flush({ status: 404 }, { status: 404, statusText: 'Not Found' }),
    );

    expect(page.querySelector('h1')?.textContent).toContain("Cette salle n'existe pas");
    expect(page.querySelector('[role="alert"]')).toBeNull();
  });

  it('propose de réessayer quand l’API est en panne', async () => {
    const page = await renderRoom('1', (request) =>
      request.flush('Erreur', { status: 500, statusText: 'Server Error' }),
    );

    expect(page.querySelector('[role="alert"] button')?.textContent).toContain('Réessayer');
  });
});