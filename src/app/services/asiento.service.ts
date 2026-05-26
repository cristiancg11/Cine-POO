import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Asiento } from '../models/asiento.model';

@Injectable({
  providedIn: 'root'
})
export class AsientoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/asientos`;

  getBySala(salaId: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${this.apiUrl}/sala/${salaId}`);
  }

  getById(id: number): Observable<Asiento> {
    return this.http.get<Asiento>(`${this.apiUrl}/${id}`);
  }
}
