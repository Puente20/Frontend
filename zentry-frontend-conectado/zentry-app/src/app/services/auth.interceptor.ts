import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('zentry_token');
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Token ${token}`
        }
      });
      return next(cloned);
    }
  }
  return next(req);
};
