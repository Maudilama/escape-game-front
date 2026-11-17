import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BookingFlowStore } from '../booking-flow.store';

@Component({
  selector: 'app-booking-flow',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (roomNotFound()) {
      <div class="ec-container booking-step">
        <h1 class="text-h2">Cette salle n'existe pas</h1>
        <p class="text-body-1">Impossible de réserver une salle introuvable.</p>
        <a routerLink="/" fragment="salles" class="ec-btn ec-btn--primary">Voir toutes les salles</a>
      </div>
    } @else {
      <router-outlet />
    }
  `,
})
export class BookingFlow {
  readonly roomId = input.required<string>();

  private readonly store = inject(BookingFlowStore);

  protected readonly roomNotFound = computed(() => {
    const error = this.store.room.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  constructor() {
    effect(() => this.store.start(Number(this.roomId())));
  }
}