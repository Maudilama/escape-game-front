import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../../core/api-url';
import { APP_NAME } from '../../../core/app-name';
import { Icon } from '../../../shared/ui/icon/icon';
import { RoomSummary } from '../room.model';

@Component({
  selector: 'app-room-page',
  imports: [RouterLink, CurrencyPipe, Icon],
  templateUrl: './room-page.html',
  styleUrl: './room-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomPage {
  readonly id = input.required<string>();

  private readonly apiUrl = inject(API_URL);
  private readonly title = inject(Title);

  protected readonly room = httpResource<RoomSummary>(() => `${this.apiUrl}/rooms/${this.id()}`);

  protected readonly notFound = computed(() => {
    const error = this.room.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  constructor() {
    effect(() => {
      if (this.room.hasValue()) {
        this.title.setTitle(`${this.room.value().name} · ${APP_NAME}`);
      } else if (this.notFound()) {
        this.title.setTitle(`Salle introuvable · ${APP_NAME}`);
      }
    });
  }
}