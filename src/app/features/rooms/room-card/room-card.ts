import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoomSummary } from '../room.model';
import { PricePipe } from '../../../core/i18n/locale-pipes';

@Component({
  selector: 'app-room-card',
  imports: [RouterLink, PricePipe],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomCard {
  readonly room = input.required<RoomSummary>();
}