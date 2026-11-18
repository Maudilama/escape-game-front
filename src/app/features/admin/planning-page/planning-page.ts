import { CurrencyPipe, DatePipe, formatDate } from '@angular/common';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  LOCALE_ID,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_URL } from '../../../core/api-url';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { Icon } from '../../../shared/ui/icon/icon';
import { BookingApi } from '../../booking/booking-api';
import { addDays, formatTime, parseIsoDate, toIsoDate } from '../../booking/booking-calendar';
import { Booking } from '../../booking/booking.model';
import { RoomSummary } from '../../rooms/room.model';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface TimeGroup {
  time: string;
  bookings: Booking[];
}

@Component({
  selector: 'app-planning-page',
  imports: [CurrencyPipe, DatePipe, Icon, ConfirmDialog],
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
  private readonly locale = inject(LOCALE_ID);
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
      const time = formatTime(booking.startAt);
      const last = groups.at(-1);
      if (last?.time === time) {
        last.bookings.push(booking);
      } else {
        groups.push({ time, bookings: [booking] });
      }
    }
    return groups;
  });

  protected readonly toCancel = signal<Booking | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly cancelError = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly formatTime = formatTime;

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
        this.successMessage.set(
          `La réservation de ${booking.customerEmail} à ${formatTime(booking.startAt)} (${booking.roomName}) a été annulée.`,
        );
        this.bookings.reload();
        afterNextRender(() => this.successBanner()?.nativeElement.focus(), {
          injector: this.injector,
        });
      },
      error: (error: unknown) => {
        this.cancelling.set(false);
        this.cancelError.set(
          error instanceof HttpErrorResponse && error.error?.detail
            ? error.error.detail
            : "L'annulation n'a pas pu être enregistrée. Réessayez dans un instant.",
        );
      },
    });
  }

  protected describe(booking: Booking): string {
    return formatDate(booking.startAt, "EEEE d MMMM 'à' H'h'mm", this.locale);
  }

  private goTo(date: string): void {
    this.successMessage.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date },
      queryParamsHandling: 'merge',
    });
  }
}