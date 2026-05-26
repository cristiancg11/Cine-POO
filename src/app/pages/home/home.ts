import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { PeliculaService } from '../../services/pelicula.service';
import { AuthService } from '../../services/auth.service';
import { Pelicula } from '../../models/pelicula.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  peliculaService = inject(PeliculaService);
  authService = inject(AuthService);
  router = inject(Router);
  peliculas: Pelicula[] = [];

  ngOnInit() {
    this.peliculaService.getCartelera().subscribe({
      next: (data) => {
        this.peliculas = data.slice(0, 10);
      },
      error: (err) => console.error('HomeComponent: Error:', err)
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