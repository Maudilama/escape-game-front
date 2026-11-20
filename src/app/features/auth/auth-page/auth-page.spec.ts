import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../../core/i18n/language.service';
import { translocoTesting } from '../../../core/i18n/testing';
import { AuthPage } from './auth-page';

describe('AuthPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [translocoTesting()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  async function render() {
    const fixture = TestBed.createComponent(AuthPage);
    await fixture.whenStable();
    return fixture;
  }

  function type(page: HTMLElement, selector: string, value: string): void {
    const field = page.querySelector<HTMLInputElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  it('signale les champs manquants et place le focus sur le premier', async () => {
    const fixture = await render();
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(page.querySelector('#login-email-error')?.textContent).toContain('Renseignez votre adresse e-mail.');
    expect(page.querySelector('#login-email')?.getAttribute('aria-describedby')).toBe('login-email-error');
    expect(document.activeElement?.id).toBe('login-email');
  });

  it('retraduit les erreurs déjà affichées quand la langue change', async () => {
    const fixture = await render();
    const page = fixture.nativeElement as HTMLElement;
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    await TestBed.inject(LanguageService).use('es');
    await fixture.whenStable();

    expect(page.querySelector('label[for="login-email"]')?.textContent).toContain('Correo electrónico');
    expect(page.querySelector('#login-email-error')?.textContent).toContain('Introduce tu correo electrónico.');
  });

  it('annonce un identifiant incorrect sans dire lequel des deux est faux', async () => {
    const fixture = await render();
    const page = fixture.nativeElement as HTMLElement;
    type(page, '#login-email', 'maud@example.com');
    type(page, '#login-password', 'mauvais');

    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/login')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'Adresse e-mail ou mot de passe incorrect.',
    );
  });
});