import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../../core/api-url';
import { Icon } from '../../../shared/ui/icon/icon';
import { CANCELLATION_MIN_HOURS } from '../booking-calendar';
import { Booking } from '../booking.model';
import { LocalizedDatePipe, PricePipe } from '../../../core/i18n/locale-pipes';

@Component({
  selector: 'app-confirmation-page',
  imports: [RouterLink, Icon, LocalizedDatePipe, PricePipe],
  templateUrl: './confirmation-page.html',
  styleUrl: './confirmation-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationPage {
  readonly id = input.required<string>();

  private readonly apiUrl = inject(API_URL);

  protected readonly booking = httpResource<Booking>(() => `${this.apiUrl}/bookings/${this.id()}`);

  protected cancellationDeadline(startAt: string): Date {
    return new Date(new Date(startAt).getTime() - CANCELLATION_MIN_HOURS * 3_600_000);
  }
}