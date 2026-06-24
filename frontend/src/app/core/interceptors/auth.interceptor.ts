import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Attaches X-Username header on every request so the backend can scope
 * project queries to the logged-in user. No JWT is used.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const stored = localStorage.getItem('isra_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.username) {
        const cloned = req.clone({
          setHeaders: { 'X-Username': user.username }
        });
        return next(cloned);
      }
    } catch { /* ignore malformed data */ }
  }
  return next(req);
};
