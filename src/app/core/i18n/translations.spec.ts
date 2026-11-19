import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import fr from '../../../../public/i18n/fr.json';

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