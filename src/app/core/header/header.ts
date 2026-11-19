import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '../../shared/ui/icon/icon';
import { APP_NAME } from '../app-name';
import { AuthService } from '../auth/auth.service';
import { LanguageSwitcher } from '../i18n/language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon, TranslocoPipe, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly appName = APP_NAME;
  protected readonly menuOpen = signal(false);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');

  protected openMenu(): void {
    this.menu().nativeElement.showModal();
    this.menuOpen.set(true);
  }

  protected closeMenu(): void {
    const menu = this.menu().nativeElement;
    if (menu.open) {
      menu.close();
    }
  }

  protected onMenuClosed(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigateByUrl('/');
  }
}