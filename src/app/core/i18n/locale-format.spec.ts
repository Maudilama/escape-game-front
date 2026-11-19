import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { LocaleFormat } from './locale-format';
import { LocalizedDatePipe } from './locale-pipes';
import { translocoTesting } from './testing';

function plain(text: string | null | undefined): string {
  return (text ?? '').replace(/\s/g, ' ').trim();
}

describe('LocaleFormat', () => {
  let format: LocaleFormat;
  let language: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [translocoTesting()] });
    format = TestBed.inject(LocaleFormat);
    language = TestBed.inject(LanguageService);
  });

  it('écrit les dates selon les conventions de la langue active', async () => {
    const date = '2026-11-24T14:30:00';
    expect(format.date(date, 'long')).toBe('mardi 24 novembre');

    await language.use('en');
    expect(format.date(date, 'long')).toBe('Tuesday 24 November');

    await language.use('es');
    expect(format.date(date, 'long')).toBe('martes, 24 de noviembre');
  });

  it('écrit l’heure sur 24 heures dans les trois langues', async () => {
    expect(format.time('2026-11-24T09:05:00')).toBe('09:05');
    await language.use('en');
    expect(format.time('2026-11-24T21:30:00')).toBe('21:30');
  });

  it('lit une date seule comme un jour local, pas comme minuit UTC', () => {
    expect(format.date('2026-11-24', 'dayMonth')).toBe('24 novembre');
  });

  it('affiche les centimes seulement quand il y en a', () => {
    expect(plain(format.price(120))).toBe('120 €');
    expect(plain(format.price(32.5))).toBe('32,50 €');
  });

  it('place le symbole de l’euro selon la langue', async () => {
    await language.use('en');
    expect(format.price(32.5)).toBe('€32.50');
  });
});

@Component({
  imports: [LocalizedDatePipe],
  template: `{{ date | appDate: 'long' }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OnPushHost {
  readonly date = '2026-11-24T14:30:00';
}

describe('LocalizedDatePipe', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [translocoTesting()] });
  });

  it('se met à jour quand la langue change, même dans un composant OnPush', async () => {
    const fixture = TestBed.createComponent(OnPushHost);
    await fixture.whenStable();
    expect(plain(fixture.nativeElement.textContent)).toBe('mardi 24 novembre');

    await TestBed.inject(LanguageService).use('es');
    await fixture.whenStable();

    expect(plain(fixture.nativeElement.textContent)).toBe('martes, 24 de noviembre');
  });
});