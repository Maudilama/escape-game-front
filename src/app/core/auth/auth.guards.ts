import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(AuthService).hasValidSession()) {
    return true;
  }
  return inject(Router).createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.hasValidSession()) {
    return router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
  }
  return auth.user()?.isAdmin ? true : router.createUrlTree(['/']);
};