import { booleanAttribute, ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '../../../shared/ui/icon/icon';
import { isLanguage } from '../language';
import { LanguageService } from '../language.service';

let nextId = 0;

@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe, Icon],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcher {
  readonly full = input(false, { transform: booleanAttribute });

  private readonly language = inject(LanguageService);
  protected readonly languages = this.language.languages;
  protected readonly current = this.language.current;

  protected readonly id = `language-${nextId++}`;

  protected async choose(select: HTMLSelectElement): Promise<void> {
    const value = select.value;
    if (!isLanguage(value) || !(await this.language.use(value))) {
      select.value = this.current();
    }
  }
}