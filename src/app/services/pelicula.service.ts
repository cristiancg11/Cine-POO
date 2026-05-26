import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, shareReplay } from 'rxjs';
import { map, tap, catchError, timeout, retry } from 'rxjs/operators';
import { Pelicula } from '../models/pelicula.model';

@Injectable({
  providedIn: 'root'
})
export class PeliculaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/peliculas`;
  private peliculasCache$?: Observable<Pelicula[]>;

  getAll(ciudad?: string): Observable<Pelicula[]> {
    const currentCity = ciudad || localStorage.getItem('ciudadSeleccionada') || 'Bogotá';
    
    // Si la ciudad cambia, invalidamos el cache
    if (this.lastCity !== currentCity) {
      this.peliculasCache$ = undefined;
      this.lastCity = currentCity;
    }

    if (!this.peliculasCache$) {
      console.log('PeliculaService: Haciendo GET a', this.apiUrl, 'obteniendo catálogo global');
      this.peliculasCache$ = this.http.get<any>(this.apiUrl).pipe(
        timeout(8000),
        retry(1),
        map(response => {
          if (Array.isArray(response)) return response;
          if (response && response.content && Array.isArray(response.content)) return response.content;
          if (response && typeof response === 'object') {
            const foundArray = Object.values(response).find(val => Array.isArray(val));
            return Array.isArray(foundArray) ? foundArray : [];
          }
          return [];
        }),
        tap(data => console.log(`PeliculaService: ${data.length} películas cargadas en cache para ${currentCity}`)),
        catchError(err => {
          console.error('PeliculaService: Error en la petición GET:', err);
          this.peliculasCache$ = undefined;
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.peliculasCache$;
  }

  private lastCity?: string;

  getCartelera(ciudad?: string): Observable<Pelicula[]> {
    return this.getAll(ciudad);
  }

  getById(id: number): Observable<Pelicula> {
    return this.http.get<Pelicula>(`${this.apiUrl}/${id}`).pipe(
      timeout(5000),
      catchError(err => {
        console.error(`Error cargando película ${id}:`, err);
        throw err;
      })
    );
  }

  getEstrenos(): Observable<Pelicula[]> {
    return this.getAll().pipe(
      map(peliculas => peliculas.filter(p => p.estadoCartelera === 'ESTRENO'))
    );
  }

  create(pelicula: Pelicula): Observable<Pelicula> {
    const payload = {
      titulo: pelicula.titulo,
      descripcion: pelicula.descripcion,
      duracion: pelicula.duracion,
      genero: pelicula.genero,
      clasificacion: pelicula.clasificacion,
      precioBase: pelicula.precioBase || 0,
      estado: pelicula.estado || 'ACTIVA',
      estadoCartelera: pelicula.estadoCartelera || 'CARTELERA',
      imagenUrl: pelicula.imagenUrl || '',
      imagen: pelicula.imagenUrl || '', // Duplicamos para asegurar que el backend reciba el campo esperado
      trailerUrl: pelicula.trailerUrl || ''
    };
    
    return this.http.post<Pelicula>(this.apiUrl, payload).pipe(
      tap(() => this.peliculasCache$ = undefined), // Limpiar cache al crear
      catchError(err => {
        const backendMessage = err.error?.message || err.message || 'Error desconocido';
        throw new Error(backendMessage);
      })
    );
  }

  update(id: number, pelicula: Pelicula): Observable<Pelicula> {
    return this.http.put<Pelicula>(`${this.apiUrl}/${id}`, pelicula).pipe(
      tap(() => this.peliculasCache$ = undefined), // Limpiar cache al actualizar
      catchError(err => {
        console.error(`Error al actualizar película ${id}:`, err);
        throw err;
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.peliculasCache$ = undefined) // Limpiar cache al borrar
    );
  }
}
