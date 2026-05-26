import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeliculaService } from '../../../services/pelicula.service';
import { SalaService } from '../../../services/sala.service';
import { FuncionService } from '../../../services/funcion.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ReservaService } from '../../../services/reserva.service';
import { AdminService } from '../../../services/admin.service';

import { Pelicula } from '../../../models/pelicula.model';
import { Sala } from '../../../models/sala.model';
import { Funcion } from '../../../models/funcion.model';
import { Usuario } from '../../../models/usuario.model';
import { Reserva } from '../../../models/reserva.model';
import { Asiento } from '../../../models/asiento.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private peliculaService = inject(PeliculaService);
  private salaService = inject(SalaService);
  private funcionService = inject(FuncionService);
  private usuarioService = inject(UsuarioService);
  private reservaService = inject(ReservaService);
  private adminService = inject(AdminService);

  activeTab: string = 'resumen';

  peliculas: Pelicula[] = [];
  salas: Sala[] = [];
  funciones: Funcion[] = [];
  usuarios: Usuario[] = [];
  reservas: Reserva[] = [];
  
  // Para ver asientos de una función
  verAsientosFuncion: Funcion | null = null;
  asientosDeFuncion: Asiento[] = [];
  filasAsientosDeFuncion: { fila: string, asientos: Asiento[] }[] = [];

  // Estadísticas reales
  estadisticas = {
    usuariosActivos: 0,
    reservasActivas: 0,
    gananciasTotales: 0,
    peliculasTop: [] as { titulo: string, total: number }[],
    funcionesOcupadas: [] as { titulo: string, hora: string, ocupacion: number }[]
  };

  totalVendido: number = 0;
  isLoading = true;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    console.log('DashboardComponent: Cargando datos reales de la DB...');
    this.isLoading = true;
    
    // Usamos forkJoin para obtener todos los datos necesarios y calcular estadísticas reales
    forkJoin({
      peliculas: this.peliculaService.getAll(),
      salas: this.salaService.getAll(),
      funciones: this.funcionService.getAll(),
      usuarios: this.usuarioService.getAll(),
      reservas: this.reservaService.getAll()
    }).subscribe({
      next: (data) => {
        console.log('DashboardComponent: Datos recibidos:', data);
        
        this.peliculas = data.peliculas;
        this.salas = data.salas;
        this.funciones = data.funciones;
        this.usuarios = data.usuarios;
        this.reservas = data.reservas;
        
        const reservasValidas = this.reservas.filter(r => r.estado !== 'CANCELADA');
        
        // Calcular estadísticas reales en el frontend
        this.estadisticas = {
          usuariosActivos: this.usuarios.length,
          reservasActivas: reservasValidas.length,
          gananciasTotales: reservasValidas.reduce((acc, r) => acc + (r.total || 0), 0),
          
          // Películas más reservadas
          peliculasTop: this.obtenerPeliculasTop(reservasValidas),
          
          // Funciones más ocupadas
          funcionesOcupadas: this.obtenerFuncionesOcupadas(reservasValidas)
        };
        
        this.totalVendido = this.estadisticas.gananciasTotales;
        this.isLoading = false;
        console.log('DashboardComponent: Estadísticas reales calculadas:', this.estadisticas);
      },
      error: (err) => {
        console.error('DashboardComponent: Error cargando datos:', err);
        this.isLoading = false;
      }
    });
  }

  private obtenerPeliculasTop(reservas: Reserva[]) {
    const pelisMap = new Map<string, number>();
    reservas.forEach(r => {
      const titulo = r.funcion?.pelicula?.titulo || 'Desconocida';
      pelisMap.set(titulo, (pelisMap.get(titulo) || 0) + 1);
    });
    return Array.from(pelisMap.entries())
      .map(([titulo, total]) => ({ titulo, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  private obtenerFuncionesOcupadas(reservas: Reserva[]) {
    return this.funciones.map(f => {
      const ocupados = reservas
        .filter(r => r.funcion?.id === f.id)
        .reduce((acc, r) => acc + (r.asientos?.length || 0), 0);
      
      const capacidad = f.sala?.capacidad || 1;
      return {
        titulo: f.pelicula?.titulo || 'Desconocida',
        hora: f.hora,
        ocupacion: Math.round((ocupados / capacidad) * 100)
      };
    }).sort((a, b) => b.ocupacion - a.ocupacion).slice(0, 5);
  }

  // Eliminar el cálculo manual de estadísticas ya que ahora vienen del backend
  calcularEstadisticas() {
    // Ya no es necesario calcular localmente si el backend provee todo
    console.log('DashboardComponent: Estadísticas sincronizadas con backend');
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // --- MÉTODOS CRUD PELÍCULAS ---

  showPeliculaForm = false;
  peliculaActual: Pelicula = {
    id: 0,
    titulo: '',
    genero: '',
    duracion: 0,
    clasificacion: '',
    precioBase: 0,
    descripcion: '',
    imagen: '',
    imagenUrl: '',
    estado: 'ACTIVA',
    estadoCartelera: 'CARTELERA',
    trailerUrl: ''
  };

  abrirPeliculaForm(pelicula?: Pelicula) {
    if (pelicula) {
      this.peliculaActual = { ...pelicula };
    } else {
      this.peliculaActual = {
        id: 0,
        titulo: '',
        genero: '',
        duracion: 0,
        clasificacion: '',
        precioBase: 0,
        descripcion: '',
        imagen: '',
        imagenUrl: '',
        estado: 'ACTIVA',
        estadoCartelera: 'CARTELERA',
        trailerUrl: ''
      };
    }
    this.showPeliculaForm = true;
  }

  cerrarPeliculaForm() {
    this.showPeliculaForm = false;
  }

  guardarPelicula() {
    // Validar datos mínimos antes de enviar
    if (!this.peliculaActual.titulo || !this.peliculaActual.genero) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    // Aseguramos que el campo imagen y imagenUrl tengan el mismo valor de la URL ingresada
    if (this.peliculaActual.imagenUrl) {
      this.peliculaActual.imagen = this.peliculaActual.imagenUrl;
    }

    if (this.peliculaActual.id) {
      this.peliculaService.update(this.peliculaActual.id, this.peliculaActual).subscribe({
        next: (res: Pelicula) => {
          const idx = this.peliculas.findIndex(p => p.id === res.id);
          if (idx !== -1) this.peliculas[idx] = res;
          this.cerrarPeliculaForm();
          alert('Película actualizada con éxito en PostgreSQL');
          this.cargarDatos(); // Recargar para reflejar cambios en cartelera
        },
        error: (err: any) => alert('Error actualizando película: ' + err.message)
      });
    } else {
      this.peliculaService.create(this.peliculaActual).subscribe({
        next: (res: Pelicula) => {
          this.peliculas.push(res);
          this.cerrarPeliculaForm();
          alert('Película creada con éxito en PostgreSQL y disponible en cartelera');
          this.cargarDatos(); // Recargar todo para asegurar sincronía y estadísticas
        },
        error: (err: any) => {
          console.error('Error al crear película:', err);
          alert('Error al crear: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  eliminarPelicula(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar esta película?')) {
      this.peliculaService.delete(id).subscribe(() => {
        this.peliculas = this.peliculas.filter(p => p.id !== id);
      });
    }
  }

  eliminarSala(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar esta sala?')) {
      this.salaService.delete(id).subscribe(() => {
        this.salas = this.salas.filter(s => s.id !== id);
      });
    }
  }

  eliminarFuncion(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar esta función?')) {
      this.funcionService.delete(id).subscribe(() => {
        this.funciones = this.funciones.filter(f => f.id !== id);
      });
    }
  }

  abrirVerAsientos(funcion: Funcion) {
    this.verAsientosFuncion = funcion;
    this.asientosDeFuncion = [];
    this.filasAsientosDeFuncion = [];
    
    this.funcionService.getAsientosByFuncion(funcion.id!).subscribe({
      next: (asientos: Asiento[]) => {
        // Aseguramos que los asientos se mapeen con las reservas actuales de esta función específica
        const reservasFuncion = this.reservas.filter(r => 
          r.funcion?.id === funcion.id && r.estado !== 'CANCELADA'
        );
        
        this.asientosDeFuncion = asientos.map(asiento => {
          // Buscamos si el asiento está en alguna reserva de esta función
          const reservaAsiento = reservasFuncion.find(r => 
            r.asientos?.some(a => a.id === asiento.id)
          );
          
          if (reservaAsiento) {
            return {
              ...asiento,
              disponible: false,
              usuarioReserva: reservaAsiento.usuario,
              fechaReserva: reservaAsiento.fechaReserva,
              estadoReserva: reservaAsiento.estado
            };
          }
          return {
            ...asiento,
            disponible: true
          };
        });

        const mapa = new Map<string, Asiento[]>();
        this.asientosDeFuncion.forEach(a => {
          if (!mapa.has(a.fila)) mapa.set(a.fila, []);
          mapa.get(a.fila)?.push(a);
        });
        const filasOrdenadas = Array.from(mapa.keys()).sort();
        this.filasAsientosDeFuncion = filasOrdenadas.map(f => ({
          fila: f,
          asientos: mapa.get(f)!.sort((a, b) => a.numero - b.numero)
        }));
      },
      error: (err: any) => console.error('Error cargando asientos:', err)
    });
  }

  // --- MÉTODOS CRUD SALAS ---
  showSalaForm = false;
  salaActual: Sala = {
    nombre: '',
    capacidad: 0,
    tipoSala: 'NORMAL',
    estado: 'ACTIVA'
  };

  abrirSalaForm(sala?: Sala) {
    if (sala) {
      this.salaActual = { ...sala };
    } else {
      this.salaActual = {
        nombre: '',
        capacidad: 0,
        tipoSala: 'NORMAL',
        estado: 'ACTIVA'
      };
    }
    this.showSalaForm = true;
  }

  guardarSala() {
     if (this.salaActual.id) {
       this.salaService.update(this.salaActual.id, this.salaActual).subscribe({
         next: (res: Sala) => {
           this.cargarDatos();
           this.showSalaForm = false;
         },
         error: (err: any) => alert('Error: ' + err.message)
       });
     } else {
       this.salaService.create(this.salaActual).subscribe({
         next: (res: Sala) => {
           this.cargarDatos();
           this.showSalaForm = false;
         },
         error: (err: any) => alert('Error: ' + err.message)
       });
     }
   }

  // --- MÉTODOS CRUD FUNCIONES ---
  showFuncionForm = false;
  funcionActual: any = {
    peliculaId: 0,
    salaId: 0,
    fecha: '',
    hora: '',
    precioFinal: 0,
    idioma: 'Español',
    formato: '2D'
  };

  abrirFuncionForm(funcion?: Funcion) {
    if (funcion) {
      this.funcionActual = {
        id: funcion.id,
        peliculaId: funcion.pelicula?.id,
        salaId: funcion.sala?.id,
        fecha: funcion.fecha,
        hora: funcion.hora,
        precioFinal: funcion.precioFinal,
        idioma: funcion.idioma,
        formato: funcion.formato,
        ciudad: (funcion as any).ciudad || localStorage.getItem('ciudadSeleccionada') || 'Bogotá'
      };
    } else {
      this.funcionActual = {
        peliculaId: this.peliculas[0]?.id || 0,
        salaId: this.salas[0]?.id || 0,
        fecha: '',
        hora: '',
        precioFinal: 0,
        idioma: 'Español',
        formato: '2D',
        ciudad: localStorage.getItem('ciudadSeleccionada') || 'Bogotá'
      };
    }
    this.showFuncionForm = true;
  }

  guardarFuncion() {
      // Estructura que espera Spring Boot: objetos completos para las relaciones
      const payload = {
        ...this.funcionActual,
        pelicula: { id: this.funcionActual.peliculaId },
        sala: { id: this.funcionActual.salaId }
      };

      if (this.funcionActual.id) {
        this.funcionService.update(this.funcionActual.id, payload).subscribe({
          next: () => { 
            this.cargarDatos(); 
            this.showFuncionForm = false; 
            alert('Función actualizada');
          },
          error: (err: any) => alert('Error: ' + err.message)
        });
      } else {
        this.funcionService.create(payload).subscribe({
          next: () => { 
            this.cargarDatos(); 
            this.showFuncionForm = false; 
            alert('Función creada');
          },
          error: (err: any) => alert('Error: ' + err.message)
        });
      }
    }
}

