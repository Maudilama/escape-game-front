import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; padding-block: var(--space-16); }
    .not-found { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-4); }
  `,
  template: `
    <div class="ec-container not-found">
      <h1 class="text-h1">Cette page s'est volatilisée</h1>
      <p class="text-body-1">L'adresse demandée n'existe pas, ou plus.</p>
      <a routerLink="/" class="ec-btn ec-btn--primary">Retour aux salles</a>
    </div>
  `,
})
export class NotFoundPage {}