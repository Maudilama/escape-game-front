import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { languageInterceptor } from './core/i18n/language.interceptor';
import { LanguageService } from './core/i18n/language.service';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { PageTitleStrategy } from './core/page-title-strategy';
import { provideI18nMessageFormat, TRANSLOCO_BASE_CONFIG } from './core/i18n/transloco-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withInterceptors([languageInterceptor, authInterceptor])),
    provideTransloco({
      config: { ...TRANSLOCO_BASE_CONFIG, prodMode: !isDevMode() },
      loader: TranslocoHttpLoader,
    }),
    provideI18nMessageFormat(),
    provideAppInitializer(() => inject(LanguageService).init()),
    { provide: TitleStrategy, useExisting: PageTitleStrategy },
  ],
};