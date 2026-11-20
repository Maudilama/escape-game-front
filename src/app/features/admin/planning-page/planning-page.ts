import { httpResource } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { API_URL } from '../../../core/api-url';
import { LocalizedDatePipe, PricePipe } from '../../../core/i18n/locale-pipes';
import { Translatable } from '../../../core/i18n/translatable';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { Icon } from '../../../shared/ui/icon/icon';
import { BookingApi } from '../../booking/booking-api';
import { addDays, parseIsoDate, toIsoDate } from '../../booking/booking-calendar';
import { Booking } from '../../booking/booking.model';
import { RoomSummary } from '../../rooms/room.model';
import { apiErrorMessage } from '../../../core/i18n/api-error';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface TimeGroup {
  key: string;
  startAt: string;
  bookings: Booking[];
}

@Component({
  selector: 'app-planning-page',
  imports: [LocalizedDatePipe, PricePipe, TranslocoPipe, Icon, ConfirmDialog],
  templateUrl: './planning-page.html',
  styleUrl: './planning-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningPage {
  readonly date = input<string>();

  private readonly apiUrl = inject(API_URL);
  private readonly api = inject(BookingApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  private readonly dialog = viewChild.required(ConfirmDialog);
  private readonly successBanner = viewChild<ElementRef<HTMLElement>>('successBanner');

  protected readonly day = computed(() => {
    const date = this.date();
    return date && ISO_DATE.test(date) ? date : toIsoDate(new Date());
  });

  protected readonly dayDate = computed(() => parseIsoDate(this.day()));

  protected readonly bookings = httpResource<Booking[]>(
    () => ({ url: `${this.apiUrl}/admin/bookings`, params: { date: this.day() } }),
    { defaultValue: [] },
  );

  protected readonly rooms = httpResource<RoomSummary[]>(() => `${this.apiUrl}/rooms`, {
    defaultValue: [],
  });

  protected readonly roomFilter = signal<number | null>(null);

  protected readonly visible = computed(() => {
    const all = this.bookings.hasValue() ? this.bookings.value() : [];
    const roomId = this.roomFilter();
    return roomId === null ? all : all.filter((booking) => booking.roomId === roomId);
  });

  protected readonly summary = computed(() => {
    const confirmed = this.visible().filter((booking) => booking.status === 'CONFIRMED');
    return {
      count: confirmed.length,
      players: confirmed.reduce((sum, booking) => sum + booking.playerCount, 0),
      revenue: confirmed.reduce((sum, booking) => sum + booking.totalPrice, 0),
    };
  });

  protected readonly groups = computed<TimeGroup[]>(() => {
    const groups: TimeGroup[] = [];
    for (const booking of this.visible()) {
      const key = booking.startAt.slice(11, 16);
      const last = groups.at(-1);
      if (last?.key === key) {
        last.bookings.push(booking);
      } else {
        groups.push({ key, startAt: booking.startAt, bookings: [booking] });
      }
    }
    return groups;
  });

  protected readonly toCancel = signal<Booking | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly cancelError = signal<Translatable | null>(null);
  protected readonly cancelled = signal<Booking | null>(null);

  protected isConfirmed(booking: Booking): boolean {
    return booking.status === 'CONFIRMED';
  }

  protected changeDay(offset: number): void {
    this.goTo(toIsoDate(addDays(this.dayDate(), offset)));
  }

  protected showToday(): void {
    this.goTo(toIsoDate(new Date()));
  }

  protected onDateInput(value: string): void {
    if (ISO_DATE.test(value)) {
      this.goTo(value);
    }
  }

  protected onRoomFilter(value: string): void {
    this.roomFilter.set(value === '' ? null : Number(value));
  }

  protected askCancel(booking: Booking): void {
    this.toCancel.set(booking);
    this.cancelError.set(null);
    this.dialog().open();
  }

  protected confirmCancel(): void {
    const booking = this.toCancel();
    if (booking === null || this.cancelling()) {
      return;
    }
    this.cancelling.set(true);
    this.cancelError.set(null);

    this.api.cancel(booking.id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.dialog().close();
        this.cancelled.set(booking);
        this.bookings.reload();
        afterNextRender(() => this.successBanner()?.nativeElement.focus(), {
          injector: this.injector,
        });
      },
    error: (error: unknown) => {
        this.cancelling.set(false);
        this.cancelError.set(apiErrorMessage(error, 'cancellation.error'));
      },
    });
  }

  private goTo(date: string): void {
    this.cancelled.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date },
      queryParamsHandling: 'merge',
    });
  }
}