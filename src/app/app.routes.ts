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
  path: 'admin/residents',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/residents/residents.page')
      .then((m) => m.ResidentsPage),
},

{
  path: 'admin/residents/new',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/residents/detail/resident-detail.page')
      .then((m) => m.ResidentDetailPage),
},

{
  path: 'admin/residents/:id',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/residents/detail/resident-detail.page')
      .then((m) => m.ResidentDetailPage),
},

{
  path: 'admin/households',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/households/households.page')
      .then((m) => m.HouseholdsPage),
},

{
  path: 'admin/households/new',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/households/detail/household-detail.page')
      .then((m) => m.HouseholdDetailPage),
},

{
  path: 'admin/households/:id',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/households/detail/household-detail.page')
      .then((m) => m.HouseholdDetailPage),
},

{
  path: 'user/requests',
  canActivate: [authGuard, userGuard],
  loadComponent: () =>
    import('./pages/user/requests/requests.page')
      .then((m) => m.UserRequestsPage),
},

{
  path: 'user/requests/new',
  canActivate: [authGuard, userGuard],
  loadComponent: () =>
    import('./pages/user/requests/new/new-request.page')
      .then((m) => m.NewRequestPage),
},

{
  path: 'admin/requests',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/requests/requests.page')
      .then((m) => m.AdminRequestsPage),
},

{
  path: 'admin/documents',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/documents/documents.page')
      .then((m) => m.AdminDocumentsPage),
},

{
  path: 'user/documents',
  canActivate: [authGuard, userGuard],
  loadComponent: () =>
    import('./pages/user/documents/documents.page')
      .then((m) => m.UserDocumentsPage),
},
{
  path: 'admin/audit-logs',
  canActivate: [authGuard, adminGuard],
  loadComponent: () =>
    import('./pages/admin/audit-logs/audit-logs.page')
      .then((m) => m.AdminAuditLogsPage),
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