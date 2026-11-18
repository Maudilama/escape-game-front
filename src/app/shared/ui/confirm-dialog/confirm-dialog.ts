import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly heading = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly pendingLabel = input('Traitement en cours…');
  readonly cancelLabel = input('Revenir en arrière');
  readonly tone = input<'danger' | 'primary'>('primary');
  readonly pending = input(false);

  readonly confirmed = output<void>();
  readonly closed = output<void>();

  protected readonly headingId = `confirm-dialog-title-${nextId}`;
  protected readonly bodyId = `confirm-dialog-body-${nextId++}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly cancelButton = viewChild.required<ElementRef<HTMLButtonElement>>('cancelButton');

  open(): void {
    this.dialog().nativeElement.showModal();
    this.cancelButton().nativeElement.focus();
  }

  close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) {
      dialog.close();
    }
  }
}