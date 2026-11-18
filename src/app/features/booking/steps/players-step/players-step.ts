import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Icon } from '../../../../shared/ui/icon/icon';
import { BookingFlowStore } from '../../booking-flow.store';
import { StepHeader } from '../../step-header/step-header';

@Component({
  selector: 'app-players-step',
  imports: [CurrencyPipe, Icon, StepHeader],
  templateUrl: './players-step.html',
  styleUrl: './players-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayersStep {
  protected readonly store = inject(BookingFlowStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly room = computed(() => (this.store.room.hasValue() ? this.store.room.value() : null));

  protected readonly count = computed(() => this.store.playerCount() ?? this.room()?.minPlayers ?? null);

  protected readonly total = computed(() => {
    const room = this.room();
    const count = this.count();
    return room && count !== null ? room.pricePerPerson * count : null;
  });

  protected readonly limitMessage = signal<string | null>(null);

  protected decrement(): void {
    const room = this.room();
    const count = this.count();
    if (!room || count === null) {
      return;
    }
    if (count <= room.minPlayers) {
      this.limitMessage.set(`Il faut au moins ${room.minPlayers} joueurs dans cette salle.`);
      return;
    }
    this.store.choosePlayers(count - 1);
    this.limitMessage.set(null);
  }

  protected increment(): void {
    const room = this.room();
    const count = this.count();
    if (!room || count === null) {
      return;
    }
    if (count >= room.maxPlayers) {
      this.limitMessage.set(`${room.maxPlayers} joueurs maximum dans cette salle.`);
      return;
    }
    this.store.choosePlayers(count + 1);
    this.limitMessage.set(null);
  }

  protected continue(): void {
    const count = this.count();
    if (count === null) {
      return;
    }
    this.store.choosePlayers(count);
    this.router.navigate(['../recapitulatif'], { relativeTo: this.route });
  }
}