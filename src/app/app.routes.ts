import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Les salles',
    loadComponent: () => import('./features/rooms/home-page/home-page').then((m) => m.HomePage),
  },
 {
    path: 'salles/:id',
    title: 'Fiche salle',
    loadComponent: () => import('./features/rooms/room-page/room-page').then((m) => m.RoomPage),
  },
 {
    path: 'reserver/:roomId',
    loadChildren: () => import('./features/booking/booking.routes').then((m) => m.BOOKING_ROUTES),
  },
    {
    path: 'connexion',
    title: 'Connexion',
    data: { mode: 'login' },
    loadComponent: () => import('./features/auth/auth-page/auth-page').then((m) => m.AuthPage),
  },
  {
    path: 'inscription',
    title: 'Créer un compte',
    data: { mode: 'register' },
    loadComponent: () => import('./features/auth/auth-page/auth-page').then((m) => m.AuthPage),
  },
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];