import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [

  /* ─── AUTH PAGES (no shell) ─── */
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password.page').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
  },

  /* ─── ADMIN SHELL (persistent sidebar) ─── */
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin/layout/layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
      },

      {
        path: 'residents',
        loadComponent: () =>
          import('./pages/admin/residents/residents.page').then((m) => m.ResidentsPage),
      },
      {
        path: 'residents/new',
        loadComponent: () =>
          import('./pages/admin/residents/detail/resident-detail.page').then((m) => m.ResidentDetailPage),
      },
      {
        path: 'residents/:id',
        loadComponent: () =>
          import('./pages/admin/residents/detail/resident-detail.page').then((m) => m.ResidentDetailPage),
      },

      {
        path: 'households',
        loadComponent: () =>
          import('./pages/admin/households/households.page').then((m) => m.HouseholdsPage),
      },
      {
        path: 'households/new',
        loadComponent: () =>
          import('./pages/admin/households/detail/household-detail.page').then((m) => m.HouseholdDetailPage),
      },
      {
        path: 'households/:id',
        loadComponent: () =>
          import('./pages/admin/households/detail/household-detail.page').then((m) => m.HouseholdDetailPage),
      },

      {
        path: 'requests',
        loadComponent: () =>
          import('./pages/admin/requests/requests.page').then((m) => m.AdminRequestsPage),
      },

      {
        path: 'documents',
        loadComponent: () =>
          import('./pages/admin/documents/documents.page').then((m) => m.AdminDocumentsPage),
      },

      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./pages/admin/audit-logs/audit-logs.page').then((m) => m.AdminAuditLogsPage),
      },
    ],
  },

  /* ─── USER PAGES (no shell, or their own shell later) ─── */
  {
    path: 'user/dashboard',
    canActivate: [authGuard, userGuard],
    loadComponent: () =>
      import('./pages/user/dashboard/user-dashboard.page').then((m) => m.UserDashboardPage),
  },
  {
    path: 'user/requests',
    canActivate: [authGuard, userGuard],
    loadComponent: () =>
      import('./pages/user/requests/requests.page').then((m) => m.UserRequestsPage),
  },
  {
    path: 'user/requests/new',
    canActivate: [authGuard, userGuard],
    loadComponent: () =>
      import('./pages/user/requests/new/new-request.page').then((m) => m.NewRequestPage),
  },
  {
    path: 'user/documents',
    canActivate: [authGuard, userGuard],
    loadComponent: () =>
      import('./pages/user/documents/documents.page').then((m) => m.UserDocumentsPage),
  },
  {
    path: 'user/profile',
    canActivate: [authGuard, userGuard],
    loadComponent: () =>
      import('./pages/user/profile/profile.page').then((m) => m.ProfilePage),
  },

  /* ─── PUBLIC ─── */
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];