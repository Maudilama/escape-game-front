import { safeRedirect } from './safe-redirect';

describe('safeRedirect', () => {
  it('accepte une adresse interne', () => {
    expect(safeRedirect('/reserver/1/joueurs')).toBe('/reserver/1/joueurs');
  });

  it.each(['https://faux-site.example', '//faux-site.example', 'javascript:alert(1)', '', undefined])(
    'renvoie à l’accueil pour %s',
    (url) => {
      expect(safeRedirect(url)).toBe('/');
    },
  );
});