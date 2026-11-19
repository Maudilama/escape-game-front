import { computed, inject, Injectable } from '@angular/core';
import { parseIsoDate } from '../../features/booking/booking-calendar';
import { Language } from './language';
import { LanguageService } from './language.service';

const DATE_STYLES = {
  day: { day: 'numeric' },
  weekdayShort: { weekday: 'short' },
  dayMonth: { day: 'numeric', month: 'long' },
  short: { weekday: 'short', day: 'numeric', month: 'short' },
  medium: { weekday: 'short', day: 'numeric', month: 'long' },
  long: { weekday: 'long', day: 'numeric', month: 'long' },
  full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  time: { hour: '2-digit', minute: '2-digit' },
  dateTime: { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateStyle = keyof typeof DATE_STYLES;

const INTL_LOCALES: Record<Language, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

@Injectable({ providedIn: 'root' })
export class LocaleFormat {
  private readonly language = inject(LanguageService);

  readonly locale = computed(() => INTL_LOCALES[this.language.current()]);

  private readonly dateFormats = new Map<string, Intl.DateTimeFormat>();
  private readonly priceFormats = new Map<string, Intl.NumberFormat>();

  date(value: Date | string, style: DateStyle = 'long'): string {
    const locale = this.locale();
    const key = `${locale}|${style}`;
    let format = this.dateFormats.get(key);
    if (format === undefined) {
      format = new Intl.DateTimeFormat(locale, DATE_STYLES[style]);
      this.dateFormats.set(key, format);
    }
    return format.format(toDate(value));
  }

  time(value: Date | string): string {
    return this.date(value, 'time');
  }

  price(amount: number): string {
    const locale = this.locale();
    const digits = Number.isInteger(amount) ? 0 : 2;
    const key = `${locale}|${digits}`;
    let format = this.priceFormats.get(key);
    if (format === undefined) {
      format = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
      this.priceFormats.set(key, format);
    }
    return format.format(amount);
  }
}

function toDate(value: Date | string): Date {
  if (value instanceof Date) {
    return value;
  }
  return ISO_DATE.test(value) ? parseIsoDate(value) : new Date(value);
}