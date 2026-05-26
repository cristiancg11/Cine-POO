import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private authUrl = `${environment.apiUrl}/usuarios`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_ROLE_KEY = 'user_role';

  login(credentials: any): Observable<any> {
    console.log('Intentando login para:', credentials.email);
    return this.http.post<any>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Respuesta de login exitosa:', response);
        // Guardar token real si existe, o usar un identificador temporal basado en el email
        const token = response.token || btoa(credentials.email);
        this.saveToken(token);
        
        // Extraer y guardar el rol
        const rol = response.rol || (response.roles && response.roles[0]?.nombre) || response.usuario?.rol || 'ROLE_USER';
        this.saveRole(rol);

        // Guardar objeto de usuario completo
        localStorage.setItem('user', JSON.stringify(response.usuario || response));
      }),
      catchError((err: any) => {
        console.error('Error en el proceso de login:', err);
        throw err;
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(this.authUrl, userData);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  saveRole(role: string): void {
    localStorage.setItem(this.USER_ROLE_KEY, role);
  }

  getRole(): string | null {
    return localStorage.getItem(this.USER_ROLE_KEY);
  }

  getUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!localStorage.getItem('user');
  }

  isAdmin(): boolean {
    return this.getRole() === 'ROLE_ADMIN' || this.getRole() === 'ADMIN';
  }
}
