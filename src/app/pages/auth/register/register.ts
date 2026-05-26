import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = {
    nombre: '',
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  onSubmit() {
    this.errorMessage = '';
    this.isLoading = true;
    
    this.authService.register(this.userData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert("Registro exitoso. Inicia sesión para continuar.");
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Error en el registro. ' + (err.error?.message || 'Por favor, intenta con otro correo.');
      }
    });
  }
}
