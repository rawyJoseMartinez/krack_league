export interface ArchivoGaleria {
  id: number;
  tipo: 'foto' | 'video';
  url: string;
  desc: string;
}

export interface Sponsor {
  id: number;
  nombre: string;
  logoUrl: string;
}

export interface Jugador {
  id: number;
  nombre: string;
  posicion: string;
  equipo: string;
  puntos: number;
  asistencias: number;
  rebotes: number;
  foto: string;
}

export interface Partido {
  id: number;
  equipoLocal: string;
  puntosLocal: number;
  equipoVisitante: string;
  puntosVisitante: number;
  fecha: string;
  logoLocal?: string;
  logoVisitante?: string;
}

export interface HomeData {
  titulo: string;
  subtitulo: string;
  bannerUrl: string;
}

export interface QuienesData {
  titulo: string;
  descripcion: string;
  fotoUrl: string;
}

export type EstadoFranja = 'reservado' | 'juego' | 'cerrado';

export interface FranjaHoraria {
  state: EstadoFranja;
  note?: string;
}

export interface DiaCancha {
  hours?: Record<number, FranjaHoraria>;
}

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface SolicitudReserva {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: number;
  nombre: string;
  telefono: string; // dígitos, con código de país (ej. 549...)
  estado: EstadoSolicitud;
}
