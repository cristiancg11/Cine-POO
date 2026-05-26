import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Sala } from '../models/sala.model';

@Injectable({
  providedIn: 'root'
})
export class SalaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/salas`;

  getAll(): Observable<Sala[]> {
    return this.http.get<Sala[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  create(sala: Sala): Observable<Sala> {
    return this.http.post<Sala>(this.apiUrl, sala);
  }

  update(id: number, sala: Sala): Observable<Sala> {
    return this.http.put<Sala>(`${this.apiUrl}/${id}`, sala);
  }
}
