import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guards';
import { BookingFlow } from './booking-flow/booking-flow';
import { BookingFlowStore } from './booking-flow.store';
import { requireDraft } from './require-draft.guard';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    component: BookingFlow,
    providers: [BookingFlowStore],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'date' },
      {
        path: 'date',
        title: 'titles.bookingDate',
        loadComponent: () => import('./steps/date-step/date-step').then((m) => m.DateStep),
      },
      {
        path: 'creneau',
        title: 'titles.bookingSlot',
        canActivate: [requireDraft('date')],
        loadComponent: () => import('./steps/slot-step/slot-step').then((m) => m.SlotStep),
      },
      {
        path: 'joueurs',
        title: 'titles.bookingPlayers',
        canActivate: [requireDraft('date', 'startAt'), authGuard],
        loadComponent: () => import('./steps/players-step/players-step').then((m) => m.PlayersStep),
      },
      {
        path: 'recapitulatif',
        title: 'titles.bookingSummary',
        canActivate: [requireDraft('date', 'startAt', 'playerCount'), authGuard],
        loadComponent: () => import('./steps/summary-step/summary-step').then((m) => m.SummaryStep),
      },
    ],
  },
];