import { TestBed } from '@angular/core/testing';
import { BROWSER_LANGUAGES, detectBrowserLanguage } from './language';
import { LanguageService } from './language.service';
import { translocoTesting } from './testing';

describe('LanguageService', () => {
  function setup(browserLanguages: string[] = ['fr-FR']): LanguageService {
    TestBed.configureTestingModule({
      imports: [translocoTesting()],
      providers: [{ provide: BROWSER_LANGUAGES, useValue: browserLanguages }],
    });
    return TestBed.inject(LanguageService);
  }

  beforeEach(() => localStorage.clear());

  it('change de langue, met à jour <html lang> et mémorise le choix', async () => {
    const language = setup();

    await language.use('es');
    TestBed.tick();

    expect(language.current()).toBe('es');
    expect(document.documentElement.lang).toBe('es');
    expect(localStorage.getItem('escape-game.language')).toBe('"es"');
  });

  it('reprend au démarrage la langue choisie la dernière fois', async () => {
    localStorage.setItem('escape-game.language', '"en"');
    const language = setup(['es-ES']);

    await language.init();

    expect(language.current()).toBe('en');
  });

  it('suit la langue du navigateur à la première visite', async () => {
    const language = setup(['es-MX', 'en']);

    await language.init();

    expect(language.current()).toBe('es');
  });

  it('ignore une valeur mémorisée invalide', async () => {
    localStorage.setItem('escape-game.language', '"klingon"');
    const language = setup(['en-GB']);

    await language.init();

    expect(language.current()).toBe('en');
    expect(localStorage.getItem('escape-game.language')).toBeNull();
  });
});

describe('detectBrowserLanguage', () => {
  it('prend la première langue proposée que l’application connaît', () => {
    expect(detectBrowserLanguage(['de-DE', 'es-MX', 'en'])).toBe('es');
  });

  it('se rabat sur le français', () => {
    expect(detectBrowserLanguage(['de', 'it'])).toBe('fr');
  });
});