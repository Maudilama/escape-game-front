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

  protected openMenu(): void {
    this.menu().nativeElement.showModal();
    this.menuOpen.set(true);
  }

  protected closeMenu(): void {
    this.menu().nativeElement.close();
  }

  protected onMenuClosed(): void {
    this.menuOpen.set(false);
  }
}