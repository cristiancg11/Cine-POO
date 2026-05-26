import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    try {
      // Remover caracteres invisibles o saltos de línea del token que puedan crashear HttpHeaders
      const cleanToken = token.replace(/[^A-Za-z0-9+/=.-_]/g, '');
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${cleanToken}`)
      });
      return next(clonedReq);
    } catch (err) {
      console.error('Error en interceptor de auth:', err);
      // Si falla, enviamos sin token en lugar de colgar la app
      return next(req);
    }
  }

  return next(req);
};
