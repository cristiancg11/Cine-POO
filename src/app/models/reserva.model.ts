import { Funcion } from './funcion.model';
import { Usuario } from './usuario.model';
import { Asiento } from './asiento.model';

export interface Reserva {
  id?: number;
  usuario: Usuario;
  funcion: Funcion;
  asientos: Asiento[];
  fechaReserva: string;
  total: number;
  estado: string;
}
