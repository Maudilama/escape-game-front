import { httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { API_URL } from '../../../../core/api-url';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Availability } from '../../availability.model';
import { addDays, parseIsoDate, toIsoDate } from '../../booking-calendar';
import { BookingFlowStore } from '../../booking-flow.store';
import { StepHeader } from '../../step-header/step-header';
import { LocalizedDatePipe } from '../../../../core/i18n/locale-pipes';
import { LocaleFormat } from '../../../../core/i18n/locale-format';

interface SlotOption {
  startAt: string;
  label: string;
  available: boolean;
  reason: 'Complet' | 'Passé' | null;
}

@Component({
  selector: 'app-slot-step',
  imports: [RouterLink, Icon, StepHeader, LocalizedDatePipe],
  templateUrl: './slot-step.html',
  styleUrl: './slot-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlotStep {
  protected readonly store = inject(BookingFlowStore);
  private readonly apiUrl = inject(API_URL);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly slotPicker = viewChild<ElementRef<HTMLFieldSetElement>>('slotPicker');
  private readonly format = inject(LocaleFormat);

  private readonly now = new Date();
  protected readonly showError = signal(false);

protected readonly closed = computed(
    () => this.availability.hasValue() && this.availability.value().closed,
  );

  protected readonly availability = httpResource<Availability>(() => {
    const roomId = this.store.roomId();
    const date = this.store.date();
    if (roomId === null || date === null) {
      return undefined;
    }
    return { url: `${this.apiUrl}/rooms/${roomId}/availability`, params: { date } };
  });

  protected readonly slots = computed<SlotOption[]>(() => {
    if (!this.availability.hasValue()) {
      return [];
    }
    return this.availability.value().slots.map((slot) => ({
      startAt: slot.startAt,
      label: `${this.format.time(slot.startAt)} – ${this.format.time(slot.endAt)}`,
      available: slot.available,
      reason: slot.available ? null : new Date(slot.startAt) <= this.now ? 'Passé' : 'Complet',
    }));
  });

  protected readonly hasFreeSlot = computed(() => this.slots().some((slot) => slot.available));

  protected readonly selectedDate = computed(() => {
    const date = this.store.date();
    return date ? parseIsoDate(date) : null;
  });

  protected readonly selectedSlot = computed(
    () => this.slots().find((slot) => slot.startAt === this.store.startAt()) ?? null,
  );

  protected choose(startAt: string): void {
    this.store.chooseSlot(startAt);
    this.showError.set(false);
  }

  protected showNextDay(): void {
    const date = this.store.date();
    if (date) {
      this.store.chooseDate(toIsoDate(addDays(parseIsoDate(date), 1)));
    }
  }

  protected continue(): void {
    if (this.selectedSlot() === null) {
      this.showError.set(true);
      this.slotPicker()
        ?.nativeElement.querySelector<HTMLInputElement>('input:not(:disabled)')
        ?.focus();
      return;
    }
    this.router.navigate(['../joueurs'], { relativeTo: this.route });
  }
}