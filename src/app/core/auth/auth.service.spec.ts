import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { fakeJwt, inOneHour } from './testing';

describe('AuthService', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('ouvre une session à partir du jeton renvoyé par l’API', () => {
    const auth = TestBed.inject(AuthService);
    const token = fakeJwt({ sub: '7', email: 'maud@example.com', roles: ['CUSTOMER'], exp: inOneHour() });

    auth.login({ email: 'maud@example.com', password: 'motdepasse123' }).subscribe();
    httpTesting.expectOne('/api/auth/login').flush({ accessToken: token, tokenType: 'Bearer', expiresIn: 7200 });

    expect(auth.token()).toBe(token);
    expect(auth.user()).toEqual({ id: 7, email: 'maud@example.com', isAdmin: false });
    expect(auth.hasValidSession()).toBe(true);
  });

  it('reconnaît un administrateur', () => {
    const auth = TestBed.inject(AuthService);

    auth.login({ email: 'admin@escapegame.local', password: 'x' }).subscribe();
    httpTesting.expectOne('/api/auth/login').flush({
      accessToken: fakeJwt({ sub: '1', email: 'admin@escapegame.local', roles: ['ADMIN'], exp: inOneHour() }),
    });

    expect(auth.user()?.isAdmin).toBe(true);
  });

  it('ignore une session expirée au rechargement de la page', () => {
    sessionStorage.setItem(
      'escape-game.session',
      JSON.stringify({ token: 'x', userId: 7, email: 'maud@example.com', roles: [], expiresAt: Date.now() - 1000 }),
    );

    const auth = TestBed.inject(AuthService);

    expect(auth.user()).toBeNull();
    expect(auth.hasValidSession()).toBe(false);
  });

  it('efface tout à la déconnexion', () => {
    const auth = TestBed.inject(AuthService);
    auth.login({ email: 'maud@example.com', password: 'x' }).subscribe();
    httpTesting.expectOne('/api/auth/login').flush({
      accessToken: fakeJwt({ sub: '7', email: 'maud@example.com', exp: inOneHour() }),
    });

    auth.logout();

    expect(auth.user()).toBeNull();
    expect(sessionStorage.getItem('escape-game.session')).toBeNull();
  });
});