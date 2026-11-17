import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/ui/icon/icon';
import { APP_NAME } from '../app-name';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly appName = APP_NAME;
  protected readonly menuOpen = signal(false);

  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigateByUrl('/');
  }

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
}