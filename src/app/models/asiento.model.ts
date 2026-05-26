import { Sala } from './sala.model';
import { Usuario } from './usuario.model';

export interface Asiento {
  id: number;
  sala: Sala;
  fila: string;
  numero: number;
  tipo: string;
  disponible: boolean;
  
  // Campos opcionales para visualización en Admin
  usuarioReserva?: Usuario;
  fechaReserva?: string;
  estadoReserva?: string;
}
