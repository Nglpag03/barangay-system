import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page')
        .then((m) => m.LoginPage),
  },

{
  path: 'admin/dashboard',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/dashboard/admin-dashboard.page')
      .then((m) => m.AdminDashboardPage),
},

{
  path: 'user/dashboard',
  canActivate: [authGuard, userGuard],
  loadComponent: () =>
    import('./pages/user/dashboard/user-dashboard.page')
      .then((m) => m.UserDashboardPage),
},

{
  path: 'user/profile',
  canActivate: [authGuard, userGuard],
  loadComponent: () =>
    import('./pages/user/profile/profile.page')
      .then((m) => m.ProfilePage),
},

  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page')
        .then((m) => m.HomePage),
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];