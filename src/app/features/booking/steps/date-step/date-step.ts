import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { API_URL } from '../../../../core/api-url';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Availability } from '../../availability.model';
import {
  addDays,
  BOOKING_WINDOW_DAYS,
  parseIsoDate,
  startOfToday,
  toIsoDate,
} from '../../booking-calendar';
import { BookingFlowStore } from '../../booking-flow.store';
import { StepHeader } from '../../step-header/step-header';
import { LocalizedDatePipe } from '../../../../core/i18n/locale-pipes';

interface DayOption {
  date: Date;
  iso: string;
  status: string;
  selectable: boolean;
}

@Component({
  selector: 'app-date-step',
  imports: [Icon, StepHeader, LocalizedDatePipe],
  templateUrl: './date-step.html',
  styleUrl: './date-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateStep {
  protected readonly store = inject(BookingFlowStore);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dayPicker = viewChild<ElementRef<HTMLFieldSetElement>>('dayPicker');

  private readonly today = startOfToday();
  protected readonly lastBookableDay = addDays(this.today, BOOKING_WINDOW_DAYS);

  protected readonly weekOffset = signal(0);
  protected readonly showError = signal(false);

  protected readonly days = computed(() =>
    Array.from({ length: 7 }, (_, index) => addDays(this.today, this.weekOffset() * 7 + index)),
  );

  protected readonly canGoBack = computed(() => this.weekOffset() > 0);
  protected readonly canGoForward = computed(
    () => addDays(this.today, (this.weekOffset() + 1) * 7) <= this.lastBookableDay,
  );

  protected readonly availability = rxResource({
    params: () => {
      const roomId = this.store.roomId();
      return roomId === null ? undefined : { roomId, dates: this.days().map(toIsoDate) };
    },
    stream: ({ params }) =>
      forkJoin(
        params.dates.map((date) =>
          this.http.get<Availability>(`${this.apiUrl}/rooms/${params.roomId}/availability`, {
            params: { date },
          }),
        ),
      ),
  });

  protected readonly options = computed<DayOption[]>(() => {
    const results = this.availability.hasValue() ? this.availability.value() : [];
    return this.days().map((date, index) => {
      const iso = toIsoDate(date);
      if (date > this.lastBookableDay) {
        return { date, iso, status: 'Pas encore ouvert', selectable: false };
      }
    const result = results[index];
      if (result?.closed) {
        return { date, iso, status: 'Fermé', selectable: false };
      }
      const free = result?.slots.filter((slot) => slot.available).length ?? 0;
      return {
        date,
        iso,
        status: free === 0 ? 'Complet' : `${free} libre${free > 1 ? 's' : ''}`,
        selectable: free > 0,
      };
    });
  });

  protected readonly selectedDate = computed(() => {
    const date = this.store.date();
    return date ? parseIsoDate(date) : null;
  });

  protected choose(iso: string): void {
    this.store.chooseDate(iso);
    this.showError.set(false);
  }

  protected previousWeek(): void {
    this.weekOffset.update((offset) => offset - 1);
  }

  protected nextWeek(): void {
    this.weekOffset.update((offset) => offset + 1);
  }

  protected continue(): void {
    if (this.store.date() === null) {
      this.showError.set(true);
      this.dayPicker()?.nativeElement.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
      return;
    }
    this.router.navigate(['../creneau'], { relativeTo: this.route });
  }
}