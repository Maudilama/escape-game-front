import { TestBed } from '@angular/core/testing';
import { LanguageService } from '../language.service';
import { translocoTesting } from '../testing';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [translocoTesting()] });
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(LanguageSwitcher);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('nomme chaque langue dans sa propre langue', async () => {
    const page = await render();

    const options = [...page.querySelectorAll('option')];
    expect(options.map((option) => [option.lang, option.textContent?.trim()])).toEqual([
      ['fr', 'Français'],
      ['en', 'English'],
      ['es', 'Español'],
    ]);
  });

  it('a un libellé et prévient que la page sera traduite', async () => {
    const page = await render();
    const select = page.querySelector('select')!;

    expect(page.querySelector(`label[for="${select.id}"]`)?.textContent?.trim()).toBe('Langue');
    const hint = page.querySelector(`#${select.getAttribute('aria-describedby')}`);
    expect(hint?.textContent).toContain('dès que vous choisissez une langue');
  });

  it('change la langue de l’application quand on choisit une option', async () => {
    const page = await render();
    const select = page.querySelector('select')!;
    expect(select.value).toBe('fr');

    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(TestBed.inject(LanguageService).current()).toBe('en'));
    await TestBed.inject(LanguageService).use('en');

    expect(select.value).toBe('en');
  });
});