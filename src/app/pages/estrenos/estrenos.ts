import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PeliculaService } from '../../services/pelicula.service';
import { AuthService } from '../../services/auth.service';
import { Pelicula } from '../../models/pelicula.model';

@Component({
  selector: 'app-estrenos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estrenos.html',
  styleUrl: './estrenos.css'
})
export class Estrenos implements OnInit {
  peliculaService = inject(PeliculaService);
  authService = inject(AuthService);
  router = inject(Router);
  
  peliculas: Pelicula[] = [];
  isLoading = true;

  ngOnInit() {
    this.peliculaService.getEstrenos().subscribe({
      next: (data: any) => {
        this.peliculas = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching estrenos', err);
        alert('Error cargando estrenos: ' + (err.message || JSON.stringify(err)));
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
