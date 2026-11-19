import { inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { of, switchMap } from 'rxjs';
import { APP_NAME } from './app-name';

export type PageTitle = { key: string } | { text: string };

@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private readonly page = signal<PageTitle | null>(null);

  constructor() {
    super();
    toObservable(this.page)
      .pipe(
        switchMap((page) => {
          if (page === null) {
            return of(null);
          }
          return 'text' in page ? of(page.text) : this.transloco.selectTranslate<string>(page.key);
        }),
      )
      .subscribe((pageTitle) => {
        this.title.setTitle(pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME);
      });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.page.set(key ? { key } : null);
  }

  setPageTitle(title: PageTitle): void {
    this.page.set(title);
  }
}