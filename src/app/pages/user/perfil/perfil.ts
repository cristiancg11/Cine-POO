import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { ReservaService } from '../../../services/reserva.service';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { SalaService } from '../../../services/sala.service';
import { FuncionService } from '../../../services/funcion.service';
import { Usuario } from '../../../models/usuario.model';
import { Reserva } from '../../../models/reserva.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  usuarioService = inject(UsuarioService);
  reservaService = inject(ReservaService);
  salaService = inject(SalaService);
  funcionService = inject(FuncionService);
  authService = inject(AuthService);
  adminService = inject(AdminService);

  usuario: Usuario = { nombre: '', email: '', rol: '', estado: '' };
  passwordUpdate = '';
  
  reservasActivas: Reserva[] = [];
  reservasHistorial: Reserva[] = [];
  
  statGastado = 0;
  statBoletos = 0;
  
  // Estadísticas para Admin
  adminStats = {
    gananciasTotales: 0,
    usuariosActivos: 0,
    reservasTotales: 0,
    asientosOcupados: 0,
    asientosDisponibles: 0
  };
  
  isLoading = true;
  isAdmin = false;

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.cargarDatos();
  }

  cargarDatos() {
    // Para simplificar, si no hay backend de JWT completo que retorne el usuario por /perfil, 
    // intentamos sacar el id del localStorage (basado en el comportamiento anterior).
    const userStr = localStorage.getItem('user');
    let userId = 0;
    if (userStr) {
      const u = JSON.parse(userStr);
      userId = u.id;
      this.usuario = u;
    }

    if (this.isAdmin) {
      this.cargarStatsAdmin();
    }

    if (userId) {
      this.reservaService.getByUsuarioId(userId).subscribe({
        next: (reservas: any[]) => {
          this.reservasActivas = reservas.filter(r => r.estado === 'PAGADA');
          this.reservasHistorial = reservas.filter(r => r.estado !== 'PAGADA');
          
          this.statBoletos = this.reservasActivas.length;
          // En un sistema real esto vendría de una consulta SQL, aquí sumamos el historial y activas
          this.statGastado = reservas.reduce((sum, r) => sum + r.total, 0);
          
          if (!this.isAdmin) this.isLoading = false;
        },
        error: (err: any) => {
          console.error("Error al cargar reservas", err);
          this.isLoading = false;
        }
      });
    } else {
      if (!this.isAdmin) this.isLoading = false;
    }
  }

  cargarStatsAdmin() {
    this.isLoading = true;
    
    // Ejecutamos múltiples peticiones en paralelo para obtener datos reales de la DB
    forkJoin({
      usuarios: this.usuarioService.getAll(),
      reservas: this.reservaService.getAll(),
      salas: this.salaService.getAll(),
      funciones: this.funcionService.getAll()
    }).subscribe({
      next: (data) => {
        console.log('PerfilAdmin: Datos reales recibidos desde PostgreSQL:', data);
        
        const reservasValidas = data.reservas.filter(r => r.estado !== 'CANCELADA');
        
        // 1. Ganancias totales reales
        const ganancias = reservasValidas.reduce((sum, r) => sum + (r.total || 0), 0);
        
        // 2. Usuarios activos
        const usuariosActivos = data.usuarios.length;
        
        // 3. Reservas realizadas (totales)
        const reservasTotales = data.reservas.length;
        
        // 4. Asientos ocupados (en reservas no canceladas)
        const asientosOcupados = reservasValidas.reduce((sum, r) => sum + (r.asientos?.length || 0), 0);
        
        // 5. Asientos disponibles (capacidad total de todas las funciones - ocupados)
        const capacidadTotalFunciones = data.funciones.reduce((sum, f) => sum + (f.sala?.capacidad || 0), 0);
        const asientosDisponibles = Math.max(0, capacidadTotalFunciones - asientosOcupados);

        this.adminStats = {
          gananciasTotales: ganancias,
          usuariosActivos: usuariosActivos,
          reservasTotales: reservasTotales,
          asientosOcupados: asientosOcupados,
          asientosDisponibles: asientosDisponibles
        };
        
        console.log('PerfilAdmin: Estadísticas calculadas:', this.adminStats);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("PerfilAdmin: Error al cargar estadísticas reales", err);
        this.isLoading = false;
      }
    });
  }

  cancelarReserva(id?: number) {
    if (!id) return;
    if (confirm("¿Estás seguro de que deseas cancelar esta reserva? Los asientos serán liberados.")) {
      this.reservaService.cancel(id).subscribe({
        next: (res: any) => {
          alert("Reserva cancelada.");
          this.cargarDatos(); // Recargar datos
        },
        error: (err: any) => {
          alert("Error al cancelar reserva.");
        }
      });
    }
  }

  actualizarPerfil() {
    // Enviar datos actualizados
    if (this.passwordUpdate.trim() !== '') {
      // In a real scenario, password should be passed to the payload
      (this.usuario as any).password = this.passwordUpdate;
    }

    this.usuarioService.updatePerfil(this.usuario).subscribe({
      next: (res: any) => {
        alert("Perfil actualizado correctamente.");
        this.passwordUpdate = '';
        localStorage.setItem('user', JSON.stringify(this.usuario));
      },
      error: (err: any) => {
        alert("Error al actualizar perfil.");
      }
    });
  }
}
