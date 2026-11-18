import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { BookingFlowStore } from '../booking-flow.store';

@Component({
  selector: 'app-step-header',
  imports: [RouterLink, Icon, Progress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .step-header { display: flex; flex-direction: column; gap: var(--space-3); padding-top: var(--space-4); }
    .step-header__top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
    .step-header__back { display: inline-flex; align-items: center; gap: var(--space-2); min-height: var(--size-target); color: var(--text); text-decoration: none; }
    .step-header__room { font-size: 0.875rem; line-height: 1.25rem; color: var(--text-muted); text-align: right; }
  `,
  template: `
    <div class="ec-container ec-container--narrow step-header">
      <div class="step-header__top">
        <a [routerLink]="backLink()" class="step-header__back">
          <app-icon name="arrow-left" />
          Retour
        </a>
        @if (store.room.hasValue()) {
          <span class="step-header__room">{{ store.room.value().name }}</span>
        }
      </div>
      <app-progress [current]="step()" [label]="label()" />
    </div>
  `,
})
export class StepHeader {
  readonly step = input.required<number>();
  readonly label = input.required<string>();
  readonly backLink = input.required<string | readonly unknown[]>();

  protected readonly store = inject(BookingFlowStore);
}