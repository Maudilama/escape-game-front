import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-progress',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ec-progress">
      <div class="ec-progress__bar" aria-hidden="true">
        @for (done of segments(); track $index) {
          <span class="ec-progress__seg" [class.ec-progress__seg--done]="done"></span>
        }
      </div>
      <p class="ec-progress__label">
        {{ 'booking.progress' | transloco: { current: current(), total: total(), label: label() } }}
      </p>
    </div>
  `,
})
export class Progress {
  readonly current = input.required<number>();
  readonly label = input.required<string>();
  readonly total = input(4);

  protected readonly segments = computed(() =>
    Array.from({ length: this.total() }, (_, index) => index < this.current()),
  );
}