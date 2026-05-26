export interface Pelicula {
  id?: number;
  titulo: string;
  descripcion: string;
  duracion: number;
  genero: string;
  clasificacion: string;
  precioBase?: number;
  estado: string;
  estadoCartelera?: string;
  imagenUrl?: string;
  imagen?: string; // Add this property to fix strict typing
  trailerUrl?: string;
}
