import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  
  isLoggedIn = false;
  userName = '';
  
  ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Pasto'];
  ciudadSeleccionada = localStorage.getItem('ciudadSeleccionada') || 'Bogotá';

  ngOnInit() {
    console.log('App: Inicializando con ciudad:', this.ciudadSeleccionada);
    
    // Validar que la ciudad guardada sea válida, si no, resetear a Bogotá
    if (!this.ciudades.includes(this.ciudadSeleccionada)) {
      this.ciudadSeleccionada = 'Bogotá';
      localStorage.setItem('ciudadSeleccionada', 'Bogotá');
    }
    
    this.updateAuthStatus();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      console.log('App: Navegación detectada, actualizando estado...');
      this.updateAuthStatus();
    });
  }

  updateAuthStatus() {
    try {
      this.isLoggedIn = this.authService.isLoggedIn();
      if (this.isLoggedIn) {
        const user = this.authService.getUser();
        this.userName = user?.nombre || 'Usuario';
      }
      // Usar setTimeout para evitar errores de ciclo de detección
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    } catch (e) {
      console.error('App: Error en updateAuthStatus', e);
      this.isLoggedIn = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }

  cambiarCiudad(event: any) {
    const nuevaCiudad = event.target.value;
    console.log('App: Guardando nueva ciudad:', nuevaCiudad);
    
    this.ciudadSeleccionada = nuevaCiudad;
    localStorage.setItem('ciudadSeleccionada', nuevaCiudad);
    
    // Forzar detección de cambios y recargar después de un breve delay
    this.cdr.detectChanges();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  logout() {
    this.authService.logout();
    this.updateAuthStatus();
    this.router.navigate(['/']);
  }
}
