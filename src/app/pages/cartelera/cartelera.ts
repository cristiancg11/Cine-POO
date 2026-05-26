import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PeliculaService } from '../../services/pelicula.service';
import { AuthService } from '../../services/auth.service';
import { Pelicula } from '../../models/pelicula.model';

@Component({
  selector: 'app-cartelera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.css'
})
export class Cartelera implements OnInit {
  peliculaService = inject(PeliculaService);
  authService = inject(AuthService);
  router = inject(Router);
  
  peliculas: Pelicula[] = [];
  isLoading = true;

  ngOnInit() {
    this.cargarPeliculas();
  }

  cargarPeliculas() {
    console.log('CarteleraComponent: Cargando películas...');
    this.isLoading = true;
    const ciudad = localStorage.getItem('ciudadSeleccionada') || 'Bogotá';
    this.peliculaService.getCartelera(ciudad).subscribe({
      next: (data: Pelicula[]) => {
        this.peliculas = data || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('CarteleraComponent: Error:', err);
        this.peliculas = [];
        this.isLoading = false;
      }
    });
  }

  comprarBoleto(pelicula: Pelicula, tipo: 'NORMAL' | 'VIP' = 'NORMAL') {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/comprar', pelicula.id], { queryParams: { tipo } });
    } else {
      localStorage.setItem('redirectUrl', `/comprar/${pelicula.id}?tipo=${tipo}`);
      this.router.navigate(['/login']);
    }
  }
}
