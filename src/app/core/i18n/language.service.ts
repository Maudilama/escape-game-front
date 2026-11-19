import { computed, DOCUMENT, effect, inject, Injectable, isDevMode } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { LocalStorageService } from '../storage/browser-storage';
import {
  BROWSER_LANGUAGES,
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  isLanguage,
  Language,
  LANGUAGES,
} from './language';

const STORAGE_KEY = 'escape-game.language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly storage = inject(LocalStorageService);
  private readonly browserLanguages = inject(BROWSER_LANGUAGES);
  private readonly document = inject(DOCUMENT);

  readonly languages = LANGUAGES;

  readonly current = computed<Language>(() => {
    const active = this.transloco.activeLang();
    return isLanguage(active) ? active : DEFAULT_LANGUAGE;
  });

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.current();
    });
  }

  async init(): Promise<void> {
    const language =
      this.storage.read(STORAGE_KEY, isLanguage) ?? detectBrowserLanguage(this.browserLanguages);
    await this.load(language);
    this.transloco.setActiveLang(language);
  }

  async use(language: Language): Promise<boolean> {
    if (!(await this.load(language))) {
      return false;
    }
    this.transloco.setActiveLang(language);
    this.storage.write(STORAGE_KEY, language);
    return true;
  }

  private async load(language: Language): Promise<boolean> {
    try {
      await firstValueFrom(this.transloco.load(language));
      return true;
    } catch (error) {
      if (isDevMode()) {
        console.warn(`[i18n] traductions « ${language} » indisponibles`, error);
      }
      return false;
    }
  }
}