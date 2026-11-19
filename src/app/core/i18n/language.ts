import { InjectionToken } from '@angular/core';

export const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

export const LANGUAGE_CODES: Language[] = LANGUAGES.map((language) => language.code);

export const DEFAULT_LANGUAGE: Language = 'fr';

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language.code === value);
}

export const BROWSER_LANGUAGES = new InjectionToken<readonly string[]>('BROWSER_LANGUAGES', {
  providedIn: 'root',
  factory: () => (typeof navigator === 'undefined' ? [] : navigator.languages),
});

export function detectBrowserLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const code = tag.toLowerCase().split('-')[0];
    if (isLanguage(code)) {
      return code;
    }
  }
  return DEFAULT_LANGUAGE;
}