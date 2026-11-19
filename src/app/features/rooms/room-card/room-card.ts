import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PricePipe } from '../../../core/i18n/locale-pipes';
import { RoomSummary } from '../room.model';

@Component({
  selector: 'app-room-card',
  imports: [RouterLink, TranslocoPipe, PricePipe],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomCard {
  readonly room = input.required<RoomSummary>();
}