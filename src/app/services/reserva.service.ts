import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservas`;

  getAll(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  getByUsuarioId(usuarioId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  getById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

  create(reserva: any): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva);
  }

  cancel(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
