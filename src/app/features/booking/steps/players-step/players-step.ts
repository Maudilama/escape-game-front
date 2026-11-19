import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PricePipe } from '../../../../core/i18n/locale-pipes';
import { Icon } from '../../../../shared/ui/icon/icon';
import { BookingFlowStore } from '../../booking-flow.store';
import { StepHeader } from '../../step-header/step-header';

@Component({
  selector: 'app-players-step',
  imports: [PricePipe, TranslocoPipe, Icon, StepHeader],
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

  protected readonly limit = signal<'min' | 'max' | null>(null);

  protected decrement(): void {
    const room = this.room();
    const count = this.count();
    if (!room || count === null) {
      return;
    }
    if (count <= room.minPlayers) {
      this.limit.set('min');
      return;
    }
    this.store.choosePlayers(count - 1);
    this.limit.set(null);
  }

  protected increment(): void {
    const room = this.room();
    const count = this.count();
    if (!room || count === null) {
      return;
    }
    if (count >= room.maxPlayers) {
      this.limit.set('max');
      return;
    }
    this.store.choosePlayers(count + 1);
    this.limit.set(null);
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