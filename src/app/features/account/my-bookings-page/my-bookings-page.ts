import { formatDate } from '@angular/common';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  LOCALE_ID,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../../core/api-url';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { Icon } from '../../../shared/ui/icon/icon';
import { BookingApi } from '../../booking/booking-api';
import { CANCELLATION_MIN_HOURS } from '../../booking/booking-calendar';
import { Booking } from '../../booking/booking.model';
import { LocalizedDatePipe, PricePipe } from '../../../core/i18n/locale-pipes';

const HOUR = 3_600_000;

@Component({
  selector: 'app-my-bookings-page',
  imports: [RouterLink, Icon, ConfirmDialog, LocalizedDatePipe, PricePipe],
  templateUrl: './my-bookings-page.html',
  styleUrl: './my-bookings-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyBookingsPage {
  private readonly apiUrl = inject(API_URL);
  private readonly api = inject(BookingApi);
  private readonly locale = inject(LOCALE_ID);
  private readonly injector = inject(Injector);

  private readonly dialog = viewChild.required(ConfirmDialog);
  private readonly successBanner = viewChild<ElementRef<HTMLElement>>('successBanner');

  private readonly now = Date.now();

  protected readonly bookings = httpResource<Booking[]>(() => `${this.apiUrl}/bookings/me`, {
    defaultValue: [],
  });

  private readonly all = computed(() => (this.bookings.hasValue() ? this.bookings.value() : []));

  protected readonly upcoming = computed(() =>
    this.all()
      .filter((booking) => booking.status === 'CONFIRMED' && this.startOf(booking) > this.now)
      .sort((a, b) => a.startAt.localeCompare(b.startAt)),
  );

  protected readonly past = computed(() =>
    this.all().filter((booking) => !this.upcoming().includes(booking)),
  );

  protected readonly toCancel = signal<Booking | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly cancelError = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected canCancel(booking: Booking): boolean {
    return this.cancellationDeadline(booking).getTime() >= this.now;
  }

  protected cancellationDeadline(booking: Booking): Date {
    return new Date(this.startOf(booking) - CANCELLATION_MIN_HOURS * HOUR);
  }

  protected isCancelled(booking: Booking): boolean {
    return booking.status === 'CANCELLED';
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
          `Votre réservation pour ${booking.roomName}, ${this.describe(booking)}, a été annulée.`,
        );
        this.bookings.reload();
        afterNextRender(() => this.successBanner()?.nativeElement.focus(), {
          injector: this.injector,
        });
      },
      error: (error: unknown) => {
        this.cancelling.set(false);
        this.cancelError.set(
          error instanceof HttpErrorResponse && error.status === 422 && error.error?.detail
            ? error.error.detail
            : "L'annulation n'a pas pu être enregistrée. Réessayez dans un instant.",
        );
      },
    });
  }

  protected describe(booking: Booking): string {
    return formatDate(booking.startAt, "EEEE d MMMM 'à' H'h'mm", this.locale);
  }

  private startOf(booking: Booking): number {
    return new Date(booking.startAt).getTime();
  }
}