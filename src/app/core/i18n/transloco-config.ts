import { TranslocoConfig } from '@jsverse/transloco';
import { DEFAULT_LANGUAGE, LANGUAGE_CODES } from './language';

export const TRANSLOCO_BASE_CONFIG = {
  availableLangs: LANGUAGE_CODES,
  defaultLang: DEFAULT_LANGUAGE,
  fallbackLang: DEFAULT_LANGUAGE,
  reRenderOnLangChange: true,
  missingHandler: {
    logMissingKey: true,
    useFallbackTranslation: true,
    allowEmpty: false,
  },
} satisfies Partial<TranslocoConfig>;