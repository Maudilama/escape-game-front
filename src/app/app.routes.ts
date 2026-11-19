import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    title: 'titles.home',
    loadComponent: () => import('./features/rooms/home-page/home-page').then((m) => m.HomePage),
  },
 {
    path: 'salles/:id',
    title: 'titles.room',
    loadComponent: () => import('./features/rooms/room-page/room-page').then((m) => m.RoomPage),
  },
 {
    path: 'reserver/:roomId',
    loadChildren: () => import('./features/booking/booking.routes').then((m) => m.BOOKING_ROUTES),
  },
    {
    path: 'connexion',
    title: 'titles.login',
    data: { mode: 'login' },
    loadComponent: () => import('./features/auth/auth-page/auth-page').then((m) => m.AuthPage),
  },
  {
    path: 'inscription',
    title: 'titles.register',
    data: { mode: 'register' },
    loadComponent: () => import('./features/auth/auth-page/auth-page').then((m) => m.AuthPage),
  },
  {
    path: 'reservations/:id/confirmation',
    title: 'titles.confirmation',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/confirmation-page/confirmation-page').then((m) => m.ConfirmationPage),
  },
  {
    path: 'mes-reservations',
    title: 'titles.myBookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/my-bookings-page/my-bookings-page').then((m) => m.MyBookingsPage),
  },
  {
    path: 'admin/planning',
    title: 'titles.planning',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/planning-page/planning-page').then((m) => m.PlanningPage),
  },
  {
    path: '**',
    title: 'titles.notFound',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];