import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async () => {

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

  if (profile.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/user/dashboard']);
};