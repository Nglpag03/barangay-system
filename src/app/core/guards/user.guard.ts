import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const userGuard: CanActivateFn = async () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const profile = await authService.getCurrentProfile();

  if (!profile) {
    return router.createUrlTree(['/login']);
  }

  if (!profile.is_active) {
    await authService.signOut();

    return router.createUrlTree(['/login']);
  }

  if (profile.role === 'resident') {
    return true;
  }

  return router.createUrlTree(['/admin/dashboard']);
};