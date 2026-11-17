import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const CIRCLE = 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z';

const ICONS = {
  'arrow-left': 'M19 12H5M11 18l-6-6 6-6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-right': 'M9 6l6 6-6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  x: 'M6 6l12 12M18 6L6 18',
  calendar: 'M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM8 3v4M16 3v4M4 10h16',
  clock: `${CIRCLE}M12 7v5l3 2`,
  lock: 'M7 11h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3',
  info: `${CIRCLE}M12 11v5M12 8h.01`,
  'circle-alert': `${CIRCLE}M12 7v6M12 16h.01`,
  'circle-check': `${CIRCLE}M8 12l3 3 5-6`,
  'circle-x': `${CIRCLE}M9 9l6 6M15 9l-6 6`,
  'triangle-alert': 'M12 4l9 16H3zM12 10v4M12 17h.01',
  minus: 'M5 12h14',
  plus: 'M12 5v14M5 12h14',
} as const;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <svg
      class="ec-icon"
      [class.ec-icon--sm]="size() === 'sm'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<'md' | 'sm'>('md');

  protected readonly path = computed(() => ICONS[this.name()]);
}