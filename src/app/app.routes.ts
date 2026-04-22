import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'contacts',
    loadComponent: () => import('./pages/contacts/contacts.component').then(m => m.ContactsComponent)
  },
  {
    path: 'deals/:id',
    loadComponent: () => import('./pages/deal-detail/deal-detail.component').then(m => m.DealDetailComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.component').then(m => m.TasksComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
