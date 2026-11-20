import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../../core/api-url';
import { Icon } from '../../../shared/ui/icon/icon';
import { RoomCard } from '../room-card/room-card';
import { RoomSummary } from '../room.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, RoomCard, Icon, TranslocoPipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly apiUrl = inject(API_URL);
    private readonly language = inject(LanguageService);

  protected readonly rooms = httpResource<RoomSummary[]>(
    () => ({
      url: `${this.apiUrl}/rooms`,
      headers: { 'Accept-Language': this.language.current() },
    }),
    { defaultValue: [] },
  );
}