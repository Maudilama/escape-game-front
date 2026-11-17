import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoomSummary } from '../room.model';

@Component({
  selector: 'app-room-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomCard {
  readonly room = input.required<RoomSummary>();
}