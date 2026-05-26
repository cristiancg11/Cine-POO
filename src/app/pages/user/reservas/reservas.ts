import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../../services/reserva.service';
import { AuthService } from '../../../services/auth.service';
import { Reserva } from '../../../models/reserva.model';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {
  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);

  reservas: Reserva[] = [];
  isLoading = true;

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.isLoading = true;
    const user = this.authService.getUser();
    
    if (user && user.id) {
      this.reservaService.getByUsuarioId(user.id).subscribe({
        next: (data) => {
          this.reservas = data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando reservas:', err);
          this.isLoading = false;
        }
      });
    } else {
      console.warn('No hay usuario logueado para cargar reservas');
      this.isLoading = false;
    }
  }

  cancelarReserva(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservaService.cancel(id).subscribe({
        next: () => {
          this.cargarReservas();
        },
        error: (err) => {
          console.error('Error cancelando reserva:', err);
          alert('No se pudo cancelar la reserva.');
        }
      });
    }
  }
}
