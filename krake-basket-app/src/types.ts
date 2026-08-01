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

export type Conferencia = 'Este' | 'Oeste';

export interface FotoEquipo {
  id: number;
  url: string;
  desc: string;
}

export interface Equipo {
  id: number;
  nombre: string;
  logo?: string;
  conferencia: Conferencia;
  victorias: number;
  derrotas: number;
  pct: string; // ej: ",732"
  gb: string; // ej: "4,0"
  conf: string; // récord en conferencia, ej: "36-16"
  div: string; // récord en división, ej: "10-6"
  racha: string; // ej: "W3", "L1"
  fotos?: FotoEquipo[];
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
  jornada?: string; // ej: "Jornada 1"
}

export interface LiderEquipo {
  id: number;
  equipo: string; // debe coincidir con el nombre usado en Partidos/Clasificación
  liderNombre: string;
  telefono: string; // dígitos con código de país, ej: 549...
}

export type PeriodoJuego = 'P1' | 'P2' | 'P3' | 'P4' | 'OT1' | 'OT2';

export interface StatsPeriodo {
  min: number;
  pts: number;
  fgM: number; // tiros de campo anotados
  fgA: number; // tiros de campo intentados
  tpM: number; // triples anotados
  tpA: number; // triples intentados
  ftM: number; // libres anotados
  ftA: number; // libres intentados
}

export interface JugadorBoxscore {
  jugadorId: number;
  nombre: string;
  foto?: string;
  lado: 'local' | 'visitante';
  periodos: Partial<Record<PeriodoJuego, StatsPeriodo>>;
}

export interface Boxscore {
  id: number; // igual al id del Partido
  partidoId: number;
  jugadores: JugadorBoxscore[];
}

export interface HomeBanner {
  id: number;
  tipo: 'imagen' | 'video';
  url: string;
}

export interface HomeData {
  titulo: string;
  subtitulo: string;
  banners: HomeBanner[];
}

export interface FotoHistoria {
  id: number;
  url: string;
}

export interface QuienesData {
  titulo: string;
  descripcion: string;
  fotoUrl: string; // legacy: se conserva para migrar datos viejos a "fotos"
  fotos: FotoHistoria[];
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

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  imagenUrl: string;
  talles: string[]; // ej: ['S', 'M', 'L']
  colores: string[]; // ej: ['Negro', 'Blanco']
}

export interface ServicioIndumentaria {
  id: number;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
}
