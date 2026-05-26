import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Funcion } from '../models/funcion.model';
import { Asiento } from '../models/asiento.model';

@Injectable({
  providedIn: 'root'
})
export class FuncionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/funciones`;

  getByPelicula(peliculaId: number, ciudad?: string): Observable<Funcion[]> {
    const currentCity = ciudad || localStorage.getItem('ciudadSeleccionada') || 'Bogotá';
    return this.http.get<Funcion[]>(`${this.apiUrl}/pelicula/${peliculaId}`, { params: { ciudad: currentCity } });
  }

  getById(id: number): Observable<Funcion> {
    return this.http.get<Funcion>(`${this.apiUrl}/${id}`);
  }

  getAsientosByFuncion(id: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${this.apiUrl}/${id}/asientos`);
  }

  getAll(): Observable<Funcion[]> {
    return this.http.get<Funcion[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  create(funcion: any): Observable<Funcion> {
    return this.http.post<Funcion>(this.apiUrl, funcion);
  }

  update(id: number, funcion: any): Observable<Funcion> {
    return this.http.put<Funcion>(`${this.apiUrl}/${id}`, funcion);
  }
}
