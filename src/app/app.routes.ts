import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Les salles',
    loadComponent: () => import('./features/rooms/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];