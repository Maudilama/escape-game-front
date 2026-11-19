import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import fr from '../../../../public/i18n/fr.json';

import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageService } from './language.service';
import { translocoTesting } from './testing';

function keys(translation: object, prefix = ''): string[] {
  return Object.entries(translation)
    .flatMap(([key, value]) =>
      typeof value === 'object' && value !== null ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
    )
    .sort();
}

function values(translation: object): unknown[] {
  return Object.values(translation).flatMap((value) =>
    typeof value === 'object' && value !== null ? values(value) : [value],
  );
}

describe('Fichiers de traduction', () => {
  it.each([
    ['en', en],
    ['es', es],
  ])('%s contient exactement les mêmes clés que fr', (_language, translation) => {
    expect(keys(translation)).toEqual(keys(fr));
  });

  it.each([
    ['fr', fr],
    ['en', en],
    ['es', es],
  ])('%s ne contient aucun texte vide', (_language, translation) => {
    expect(values(translation).every((value) => typeof value === 'string' && value.trim() !== '')).toBe(true);
  });
});

describe('Pluriels', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [translocoTesting()] });
  });

  it('suit la règle de chaque langue : zéro est singulier en français, pluriel ailleurs', async () => {
    const transloco = TestBed.inject(TranslocoService);
    const language = TestBed.inject(LanguageService);

    expect(transloco.translate('common.players', { count: 0 })).toBe('0 joueur');
    expect(transloco.translate('common.players', { count: 2 })).toBe('2 joueurs');

    await language.use('en');
    expect(transloco.translate('common.players', { count: 0 })).toBe('0 players');
    expect(transloco.translate('common.players', { count: 1 })).toBe('1 player');

    await language.use('es');
    expect(transloco.translate('common.players', { count: 0 })).toBe('0 jugadores');
  });
});