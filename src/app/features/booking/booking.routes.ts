import { Routes } from '@angular/router';
import { BookingFlow } from './booking-flow/booking-flow';
import { BookingFlowStore } from './booking-flow.store';
import { requireDate } from './require-date.guard';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    component: BookingFlow,
    providers: [BookingFlowStore],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'date' },
      {
        path: 'date',
        title: 'Réservation : le jour',
        loadComponent: () => import('./steps/date-step/date-step').then((m) => m.DateStep),
      },
      {
        path: 'creneau',
        title: 'Réservation : le créneau',
        canActivate: [requireDate],
        loadComponent: () => import('./steps/slot-step/slot-step').then((m) => m.SlotStep),
      },
    ],
  },
];