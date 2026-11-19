import { inject, Pipe, PipeTransform } from '@angular/core';
import { DateStyle, LocaleFormat } from './locale-format';

@Pipe({ name: 'appDate', pure: false })
export class LocalizedDatePipe implements PipeTransform {
  private readonly format = inject(LocaleFormat);

  transform(value: Date | string | null | undefined, style: DateStyle = 'long'): string {
    return value == null ? '' : this.format.date(value, style);
  }
}

@Pipe({ name: 'appPrice', pure: false })
export class PricePipe implements PipeTransform {
  private readonly format = inject(LocaleFormat);

  transform(amount: number | null | undefined): string {
    return amount == null ? '' : this.format.price(amount);
  }
}