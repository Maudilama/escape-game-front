import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { safeRedirect } from '../../../core/auth/safe-redirect';
import { rawText, Translatable } from '../../../core/i18n/translatable';
import { Icon } from '../../../shared/ui/icon/icon';

type Mode = 'login' | 'register';

const FIELD_ORDER = ['firstName', 'lastName', 'email', 'password'] as const;

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive, TranslocoPipe, Icon],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  readonly mode = input<Mode>('login');
  readonly retour = input<string>();
  readonly raison = input<string>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly passwordMin = PASSWORD_MIN;
  protected readonly passwordMax = PASSWORD_MAX;

  protected readonly pending = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly fromBooking = computed(() => this.retour()?.startsWith('/reserver') ?? false);
  protected readonly sessionExpired = computed(() => this.raison() === 'session-expiree');

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: [
      '',
      [Validators.required, Validators.minLength(PASSWORD_MIN), Validators.maxLength(PASSWORD_MAX)],
    ],
  });

  protected fieldError(control: AbstractControl, requiredKey: string): Translatable | null {
    if (!control.touched || control.valid) {
      return null;
    }
    const errors = control.errors ?? {};
    if (errors['required']) return { key: requiredKey };
    if (errors['email']) return { key: 'auth.errors.email' };
    if (errors['minlength']) {
      return { key: 'auth.errors.minLength', params: { count: errors['minlength'].requiredLength } };
    }
    if (errors['maxlength']) {
      return { key: 'auth.errors.maxLength', params: { count: errors['maxlength'].requiredLength } };
    }
    if (errors['taken']) return { key: 'auth.errors.taken' };
    if (errors['server']) return rawText(errors['server']);
    return { key: 'auth.errors.invalid' };
  }

  protected submit(): void {
    const form = this.activeForm();
    this.serverError.set(null);
    form.markAllAsTouched();

    if (form.invalid) {
      this.focusFirstInvalid(form.controls);
      return;
    }

    const request$: Observable<void> =
      this.mode() === 'login'
        ? this.auth.login(this.loginForm.getRawValue())
        : this.auth.register(this.registerForm.getRawValue());

    this.pending.set(true);
    request$.subscribe({
      next: () => this.router.navigateByUrl(safeRedirect(this.retour())),
      error: (error: unknown) => {
        this.pending.set(false);
        this.handleError(error);
      },
    });
  }

  private handleError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.serverError.set('auth.errors.unexpected');
      return;
    }
    if (error.status === 401) {
      this.serverError.set('auth.errors.credentials');
    } else if (error.status === 409) {
      this.registerForm.controls.email.setErrors({ taken: true });
      this.focusFirstInvalid(this.registerForm.controls);
    } else if (error.status === 400 && error.error?.errors) {
      const form = this.activeForm();
      for (const [field, message] of Object.entries(error.error.errors as Record<string, string>)) {
        form.get(field)?.setErrors({ server: message });
      }
      this.focusFirstInvalid(form.controls);
    } else {
      this.serverError.set('auth.errors.unavailable');
    }
  }

  private activeForm(): FormGroup {
    return this.mode() === 'login' ? this.loginForm : this.registerForm;
  }

  private focusFirstInvalid(controls: Record<string, AbstractControl>): void {
    const first = FIELD_ORDER.find((name) => controls[name]?.invalid);
    if (first) {
      this.host.nativeElement.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
    }
  }
}