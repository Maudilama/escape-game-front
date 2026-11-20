import { HttpErrorResponse } from '@angular/common/http';
import fr from '../../../../public/i18n/fr.json';
import { API_ERROR_CODES, apiErrorMessage } from './api-error';

function apiError(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('apiErrorMessage', () => {
  it('traduit d’après le code et transmet les paramètres', () => {
    const error = apiError(422, {
      code: 'PLAYER_COUNT_OUT_OF_RANGE',
      params: { min: 2, max: 5 },
      detail: 'La salle accepte de 2 à 5 joueurs.',
    });

    expect(apiErrorMessage(error, 'repli')).toEqual({
      key: 'apiErrors.PLAYER_COUNT_OUT_OF_RANGE',
      params: { min: 2, max: 5 },
    });
  });

  it('ignore un code inconnu plutôt que d’afficher une clé brute', () => {
    expect(apiErrorMessage(apiError(422, { code: 'NOUVEAU_CODE' }), 'repli')).toEqual({ key: 'repli' });
  });

  it('utilise le repli quand le serveur est injoignable', () => {
    expect(apiErrorMessage(apiError(0, null), 'repli')).toEqual({ key: 'repli' });
  });

  it.each(API_ERROR_CODES)('%s a un message en français', (code) => {
    expect((fr.apiErrors as Record<string, string>)[code]).toBeTruthy();
  });
});