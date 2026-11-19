import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LocalizedDatePipe, PricePipe } from '../../../../core/i18n/locale-pipes';
import { Icon } from '../../../../shared/ui/icon/icon';
import { BookingApi } from '../../booking-api';
import { CANCELLATION_MIN_HOURS } from '../../booking-calendar';
import { BookingFlowStore } from '../../booking-flow.store';
import { StepHeader } from '../../step-header/step-header';

const HOUR = 3_600_000;

type SubmitError =
  | { kind: 'conflict' }
  | { kind: 'rule'; detail: string | null }
  | { kind: 'unknown' };

@Component({
  selector: 'app-summary-step',
  imports: [LocalizedDatePipe, PricePipe, TranslocoPipe, RouterLink, Icon, StepHeader],
  templateUrl: './summary-step.html',
  styleUrl: './summary-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryStep {
  protected readonly store = inject(BookingFlowStore);
  private readonly api = inject(BookingApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly alert = viewChild<ElementRef<HTMLElement>>('alert');

  protected readonly room = computed(() => (this.store.room.hasValue() ? this.store.room.value() : null));

  protected readonly start = computed(() => {
    const startAt = this.store.startAt();
    return startAt ? new Date(startAt) : null;
  });

  protected readonly end = computed(() => {
    const start = this.start();
    const room = this.room();
    return start && room ? new Date(start.getTime() + room.sessionMinutes * 60_000) : null;
  });

  protected readonly total = computed(() => {
    const room = this.room();
    const count = this.store.playerCount();
    return room && count !== null ? room.pricePerPerson * count : null;
  });

  protected readonly cancellationDeadline = computed(() => {
    const start = this.start();
    return start ? new Date(start.getTime() - CANCELLATION_MIN_HOURS * HOUR) : null;
  });

  protected readonly pending = signal(false);
  protected readonly error = signal<SubmitError | null>(null);

  protected confirm(): void {
    const roomId = this.store.roomId();
    const startAt = this.store.startAt();
    const playerCount = this.store.playerCount();
    if (this.pending() || roomId === null || startAt === null || playerCount === null) {
      return;
    }

    this.pending.set(true);
    this.error.set(null);

    this.api.create({ roomId, startAt, playerCount }).subscribe({
      next: (booking) => {
        this.store.clear();
        this.router.navigate(['/reservations', booking.id, 'confirmation'], { replaceUrl: true });
      },
      error: (error: unknown) => {
        this.pending.set(false);
        this.showError(error);
      },
    });
  }

  protected chooseAnotherSlot(): void {
    this.store.clearSlot();
    this.router.navigate(['../creneau'], { relativeTo: this.route });
  }

  private showError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      return;
    }
    if (error instanceof HttpErrorResponse && error.status === 409) {
      this.error.set({ kind: 'conflict' });
    } else if (error instanceof HttpErrorResponse && error.status === 422) {
      this.error.set({ kind: 'rule', detail: error.error?.detail ?? null });
    } else {
      this.error.set({ kind: 'unknown' });
    }
    afterNextRender(() => this.alert()?.nativeElement.focus(), { injector: this.injector });
  }
}