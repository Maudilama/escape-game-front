import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookingFlowStore } from './booking-flow.store';

export const requireDate: CanActivateFn = (route) => {
  const store = inject(BookingFlowStore);
  const roomId = Number(route.paramMap.get('roomId'));

  if (store.roomId() === roomId && store.date() !== null) {
    return true;
  }
  return inject(Router).createUrlTree(['/reserver', roomId, 'date']);
};