import { Pelicula } from './pelicula.model';
import { Sala } from './sala.model';

export interface Funcion {
  id: number;
  pelicula: Pelicula;
  sala: Sala;
  fecha: string;
  hora: string;
  precioFinal: number;
  idioma: string;
  formato: string;
}
