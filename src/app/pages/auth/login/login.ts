import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  onSubmit() {
    this.errorMessage = '';
    this.isLoading = true;
    
    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const redirectUrl = localStorage.getItem('redirectUrl');
        
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else if (redirectUrl) {
          localStorage.removeItem('redirectUrl');
          this.router.navigateByUrl(redirectUrl);
        } else {
          this.router.navigate(['/cartelera']);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        // Mostrar mensaje real del backend si existe, o usar uno por defecto
        this.errorMessage = err.error?.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.';
      }
    });
  }
}
