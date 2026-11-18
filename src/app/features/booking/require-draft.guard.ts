import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookingFlowStore } from './booking-flow.store';

type DraftField = 'date' | 'startAt' | 'playerCount';

const STEP_OF: Record<DraftField, string> = {
  date: 'date',
  startAt: 'creneau',
  playerCount: 'joueurs',
};

export function requireDraft(...fields: DraftField[]): CanActivateFn {
  return (route) => {
    const store = inject(BookingFlowStore);
    const roomId = Number(route.paramMap.get('roomId'));

    if (store.roomId() !== roomId) {
      return inject(Router).createUrlTree(['/reserver', roomId, 'date']);
    }
    const missing = fields.find((field) => store[field]() === null);
    return missing ? inject(Router).createUrlTree(['/reserver', roomId, STEP_OF[missing]]) : true;
  };
}