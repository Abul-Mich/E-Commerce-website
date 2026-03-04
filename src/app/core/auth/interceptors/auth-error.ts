import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth-service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Unauthorized → redirect to login
          router.navigate(['/login']);
          break;

        case 404:
          // Resource not found → redirect to 404 page
          router.navigate(['/not-found']);
          break;
      }

      return throwError(() => error);
    }),
  );
};
