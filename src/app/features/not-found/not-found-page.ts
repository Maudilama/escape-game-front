import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; padding-block: var(--space-16); }
    .not-found { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-4); }
  `,
  template: `
    <div class="ec-container not-found">
      <h1 class="text-h1">{{ 'notFound.title' | transloco }}</h1>
      <p class="text-body-1">{{ 'notFound.text' | transloco }}</p>
      <a routerLink="/" class="ec-btn ec-btn--primary">{{ 'notFound.cta' | transloco }}</a>
    </div>
  `,
})
export class NotFoundPage {}