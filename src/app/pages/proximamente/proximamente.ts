import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PeliculaService } from '../../services/pelicula.service';
import { AuthService } from '../../services/auth.service';
import { Pelicula } from '../../models/pelicula.model';

@Component({
  selector: 'app-proximamente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proximamente.html',
  styleUrl: './proximamente.css'
})
export class Proximamente implements OnInit {
  peliculaService = inject(PeliculaService);
  authService = inject(AuthService);
  router = inject(Router);
  
  peliculas: Pelicula[] = [];
  isLoading = true;

  ngOnInit() {
    this.peliculaService.getAll().subscribe({
      next: (data: any) => {
        // Fallback filter since there might not be a direct endpoint for proximamente
        this.peliculas = data.filter((p: any) => p.estadoCartelera === 'PROXIMAMENTE');
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching proximamente', err);
        this.isLoading = false;
      }
    });
  }

  comprarBoleto(pelicula: Pelicula) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/comprar', pelicula.id]);
    } else {
      localStorage.setItem('redirectUrl', `/comprar/${pelicula.id}`);
      this.router.navigate(['/login']);
    }
  }
}
