import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import fr from '../../../../public/i18n/fr.json';
import { TRANSLOCO_BASE_CONFIG } from './transloco-config';

export function translocoTesting(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { fr, en, es },
    preloadLangs: true,
    ...options,
    translocoConfig: { ...TRANSLOCO_BASE_CONFIG, ...options.translocoConfig },
  });
}