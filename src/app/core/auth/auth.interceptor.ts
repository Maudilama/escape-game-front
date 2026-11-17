import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api-url';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const apiUrl = inject(API_URL);

  const token = auth.token();
  const isApiRequest = request.url.startsWith(apiUrl);
  const authenticated = token !== null && isApiRequest;

  const outgoing = authenticated
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (authenticated && error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        router.navigate(['/connexion'], {
          queryParams: { retour: router.url, raison: 'session-expiree' },
        });
      }
      return throwError(() => error);
    }),
  );
};