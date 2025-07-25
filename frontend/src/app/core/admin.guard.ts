import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isBlocked()) {
    router.navigate(['/blocked']);
    return false;
  }

  if (!auth.isAuthenticated() || auth.getRole() !== 'ADMIN') {
    router.navigate(['/']);
    return false;
  }
  return true;
};
