import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { fakeJwt, inOneHour } from './testing';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  const token = fakeJwt({ sub: '7', email: 'maud@example.com', exp: inOneHour() });

  beforeEach(() => {
    sessionStorage.setItem(
      'escape-game.session',
      JSON.stringify({ token, userId: 7, email: 'maud@example.com', roles: [], expiresAt: Date.now() + 3_600_000 }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('ajoute le jeton aux appels de l’API', () => {
    http.get('/api/bookings/me').subscribe();

    const request = httpTesting.expectOne('/api/bookings/me');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush([]);
  });

  it('n’envoie jamais le jeton à un autre site', () => {
    http.get('https://autre-site.example/data').subscribe();

    const request = httpTesting.expectOne('https://autre-site.example/data');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('déconnecte et renvoie vers la connexion quand le jeton a expiré (401)', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('/api/bookings/me').subscribe({ error: () => undefined });
    httpTesting.expectOne('/api/bookings/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(TestBed.inject(AuthService).user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/connexion'], expect.objectContaining({
      queryParams: expect.objectContaining({ raison: 'session-expiree' }),
    }));
  });
});