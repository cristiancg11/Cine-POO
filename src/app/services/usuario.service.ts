import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  getPerfil(): Observable<Usuario> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return this.http.get<Usuario>(`${this.apiUrl}/${user.id}`);
    }
    return throwError(() => new Error('Usuario no encontrado en localStorage'));
  }

  updatePerfil(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${usuario.id}`, usuario);
  }

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
}
