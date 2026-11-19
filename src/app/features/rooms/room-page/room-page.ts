import { HttpErrorResponse, httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../../core/api-url';
import { Icon } from '../../../shared/ui/icon/icon';
import { RoomSummary } from '../room.model';
import { PageTitleStrategy } from '../../../core/page-title-strategy';
import { PricePipe } from '../../../core/i18n/locale-pipes';
import { TranslocoPipe } from '@jsverse/transloco';
import { CANCELLATION_MIN_HOURS } from '../../booking/booking-calendar';

@Component({
  selector: 'app-room-page',
    imports: [RouterLink, Icon, TranslocoPipe, PricePipe],
  templateUrl: './room-page.html',
  styleUrl: './room-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomPage {
  readonly id = input.required<string>();

  private readonly apiUrl = inject(API_URL);
  private readonly pageTitle = inject(PageTitleStrategy);
  protected readonly cancellationHours = CANCELLATION_MIN_HOURS;

  protected readonly room = httpResource<RoomSummary>(() => `${this.apiUrl}/rooms/${this.id()}`);

  protected readonly notFound = computed(() => {
    const error = this.room.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  constructor() {
    effect(() => {
      if (this.room.hasValue()) {
        this.pageTitle.setPageTitle({ text: this.room.value().name });
      } else if (this.notFound()) {
        this.pageTitle.setPageTitle({ key: 'titles.roomNotFound' });
      }
    });
  }
}