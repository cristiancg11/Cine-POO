import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PeliculaService } from '../../services/pelicula.service';
import { FuncionService } from '../../services/funcion.service';
import { AsientoService } from '../../services/asiento.service';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';

import { Pelicula } from '../../models/pelicula.model';
import { Funcion } from '../../models/funcion.model';
import { Asiento } from '../../models/asiento.model';

@Component({
  selector: 'app-compra-boletos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compra-boletos.html',
  styleUrl: './compra-boletos.css'
})
export class CompraBoletos implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private peliculaService = inject(PeliculaService);
  private funcionService = inject(FuncionService);
  private asientoService = inject(AsientoService);
  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);

  // Datos
  pelicula: Pelicula | null = null;
  funciones: Funcion[] = [];
  asientos: Asiento[] = [];

  // Estado del Wizard
  pasoActual: number = 1;
  isLoading = true;
  isProcessing = false;
  
  // Selecciones
  funcionSeleccionada: Funcion | null = null;
  asientosSeleccionados: Asiento[] = [];
  tipoSalaSeleccionado: string = 'NORMAL';

  // Agrupación de asientos para el mapa
  filasAsientos: { fila: string, asientos: Asiento[] }[] = [];

  get totalAPagar(): number {
    if (!this.pelicula || !this.funcionSeleccionada) return 0;
    const precio = this.funcionSeleccionada.precioFinal || this.pelicula.precioBase || 0;
    return precio * this.asientosSeleccionados.length;
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const typeParam = this.route.snapshot.queryParamMap.get('tipo');
    
    if (typeParam) {
      this.tipoSalaSeleccionado = typeParam.toUpperCase();
    }

    if (idParam) {
      const peliculaId = parseInt(idParam, 10);
      this.cargarPeliculaYFunciones(peliculaId);
    } else {
      this.router.navigate(['/cartelera']);
    }
  }

  cargarPeliculaYFunciones(peliculaId: number) {
    this.peliculaService.getById(peliculaId).subscribe({
      next: (pelicula: Pelicula) => {
        this.pelicula = pelicula;
        
        // Obtener todas las funciones ignorando el filtro de ciudad para permitir compra global
        this.funcionService.getAll().subscribe({
          next: (todasLasFunciones: Funcion[]) => {
            console.log('CompraBoletos: Todas las funciones recibidas:', todasLasFunciones);
            
            // Filtrar las funciones que pertenecen a esta película (comparación robusta)
            let funcionesPelicula = todasLasFunciones.filter(f => {
              const fPeliId = f.pelicula ? f.pelicula.id : (f as any).peliculaId;
              return fPeliId == peliculaId;
            });
            
            console.log('CompraBoletos: Funciones filtradas para película ' + peliculaId + ':', funcionesPelicula);
            
            this.funciones = funcionesPelicula;
            this.isLoading = false;
          },
          error: (err: any) => {
            console.error('Error cargando funciones', err);
            this.isLoading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Error cargando película', err);
        this.router.navigate(['/cartelera']);
      }
    });
  }

  seleccionarFuncion(funcion: Funcion) {
    this.funcionSeleccionada = funcion;
    this.isLoading = true;
    
    // Priorizar el método de FuncionService que ya incluye el ID de la función
    this.funcionService.getAsientosByFuncion(funcion.id!).subscribe({
      next: (asientos: Asiento[]) => {
        this.asientos = asientos;
        this.generarMapaAsientos();
        this.pasoActual = 2;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error cargando asientos por función, intentando por sala...', err);
        
        // Fallback: intentar por sala si falla por función
        const salaId = funcion.sala?.id || (funcion as any).salaId;
        if (salaId) {
          this.asientoService.getBySala(salaId).subscribe({
            next: (asientos: Asiento[]) => {
              this.asientos = asientos;
              this.generarMapaAsientos();
              this.pasoActual = 2;
              this.isLoading = false;
            },
            error: (errSala: any) => {
              console.error('Error cargando asientos por sala', errSala);
              this.isLoading = false;
              alert('No se pudieron cargar los asientos.');
            }
          });
        } else {
          this.isLoading = false;
          alert('No se pudo identificar la sala para esta función.');
        }
      }
    });
  }

  generarMapaAsientos() {
    const mapa = new Map<string, Asiento[]>();
    
    this.asientos.forEach(asiento => {
      if (!mapa.has(asiento.fila)) {
        mapa.set(asiento.fila, []);
      }
      mapa.get(asiento.fila)?.push(asiento);
    });

    // Ordenar filas alfabéticamente
    const filasOrdenadas = Array.from(mapa.keys()).sort();
    
    this.filasAsientos = filasOrdenadas.map(fila => ({
      fila,
      asientos: mapa.get(fila)!.sort((a, b) => a.numero - b.numero)
    }));
  }

  toggleAsiento(asiento: Asiento) {
    if (!asiento.disponible) return;
    
    const index = this.asientosSeleccionados.findIndex(a => a.id === asiento.id);
    if (index > -1) {
      this.asientosSeleccionados.splice(index, 1);
    } else {
      this.asientosSeleccionados.push(asiento);
    }
  }

  isAsientoSeleccionado(asiento: Asiento): boolean {
    return this.asientosSeleccionados.some(a => a.id === asiento.id);
  }

  irPaso3() {
    if (this.asientosSeleccionados.length > 0) {
      this.pasoActual = 3;
    }
  }

  volverPaso(paso: number) {
    this.pasoActual = paso;
    if (paso === 1) {
      this.asientosSeleccionados = [];
    }
  }

  volverCartelera() {
    this.router.navigate(['/cartelera']);
  }

  confirmarReserva() {
    if (!this.funcionSeleccionada || this.asientosSeleccionados.length === 0) return;

    this.isProcessing = true;
    const usuario = this.authService.getUser();

    if (!usuario || !usuario.id) {
      this.isProcessing = false;
      alert('Debes estar iniciado sesión para realizar una reserva.');
      this.router.navigate(['/login']);
      return;
    }

    // El backend espera una ReservaDTO que suele mapear a los IDs
    const payload = {
      usuarioId: usuario.id,
      funcionId: this.funcionSeleccionada.id,
      asientosIds: this.asientosSeleccionados.map(a => a.id),
      total: this.totalAPagar,
      fechaReserva: new Date().toISOString()
    };

    console.log('Enviando reserva real al backend:', payload);

    this.reservaService.create(payload).subscribe({
      next: (reserva: any) => {
        this.isProcessing = false;
        alert('¡Compra realizada con éxito! Tu reserva ha sido guardada en PostgreSQL.');
        this.router.navigate(['/reservas']);
      },
      error: (err: any) => {
        this.isProcessing = false;
        console.error('Error al crear reserva en PostgreSQL:', err);
        const errorMsg = err.error?.message || err.message || 'Ocurrió un error al procesar tu reserva.';
        alert('Error en el servidor: ' + errorMsg);
      }
    });
  }
}

