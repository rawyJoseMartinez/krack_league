import React, { useState, useEffect } from 'react';
import type { Jugador, Partido, Equipo, Conferencia, Boxscore, JugadorBoxscore, StatsPeriodo, PeriodoJuego, LiderEquipo } from '../types';

export interface EstadisticasProps {
  jugadores: Jugador[];
  setJugadores: React.Dispatch<React.SetStateAction<Jugador[]>>;
  onDeleteJugador: (id: number) => Promise<void>;
  partidos: Partido[];
  setPartidos: React.Dispatch<React.SetStateAction<Partido[]>>;
  onDeletePartido: (id: number) => Promise<void>;
  equipos: Equipo[];
  setEquipos: (nuevosEquiposOrFn: Equipo[] | ((prev: Equipo[]) => Equipo[])) => Promise<void>;
  onDeleteEquipo: (id: number) => Promise<void>;
  boxscores: Boxscore[];
  onGuardarBoxscore: (boxscore: Boxscore) => Promise<void>;
  onDeleteBoxscore: (id: number) => Promise<void>;
  lideresEquipo: LiderEquipo[];
  onGuardarLider: (lider: LiderEquipo) => Promise<void>;
  onDeleteLider: (id: number) => Promise<void>;
  isAdmin: boolean;
}

const LOGO_PLACEHOLDER = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=100';

type SeccionEstadisticas = 'clasificacion' | 'partidos' | 'jugadores' | 'equipos';
type TabPeriodo = 'ALL' | PeriodoJuego;

const PERIODOS: PeriodoJuego[] = ['P1', 'P2', 'P3', 'P4', 'OT1', 'OT2'];

const statsVacias = (): StatsPeriodo => ({ min: 0, pts: 0, fgM: 0, fgA: 0, tpM: 0, tpA: 0, ftM: 0, ftA: 0 });

const sumarStats = (a: StatsPeriodo, b: StatsPeriodo): StatsPeriodo => ({
  min: a.min + b.min,
  pts: a.pts + b.pts,
  fgM: a.fgM + b.fgM,
  fgA: a.fgA + b.fgA,
  tpM: a.tpM + b.tpM,
  tpA: a.tpA + b.tpA,
  ftM: a.ftM + b.ftM,
  ftA: a.ftA + b.ftA
});

const statsTotalesJugador = (jugador: JugadorBoxscore): StatsPeriodo =>
  PERIODOS.reduce((acc, p) => sumarStats(acc, jugador.periodos[p] || statsVacias()), statsVacias());

const formatPct = (m: number, a: number) => (a === 0 ? '-' : `${Math.round((m / a) * 100)}%`);

export default function Estadisticas({ jugadores, setJugadores, onDeleteJugador, partidos, setPartidos, onDeletePartido, equipos, setEquipos, onDeleteEquipo, boxscores, onGuardarBoxscore, onDeleteBoxscore, lideresEquipo, onGuardarLider, onDeleteLider, isAdmin }: EstadisticasProps) {
  // Pestaña activa dentro del componente
  const [seccionActiva, setSeccionActiva] = useState<SeccionEstadisticas>('clasificacion');

  // Estados para la Clasificación de Equipos
  const [conferenciaActiva, setConferenciaActiva] = useState<Conferencia>('Este');

  const [eqNombre, setEqNombre] = useState('');
  const [eqLogo, setEqLogo] = useState('');
  const [eqConferencia, setEqConferencia] = useState<Conferencia>('Este');
  const [eqVictorias, setEqVictorias] = useState('');
  const [eqDerrotas, setEqDerrotas] = useState('');
  const [eqPct, setEqPct] = useState('');
  const [eqGb, setEqGb] = useState('');
  const [eqConf, setEqConf] = useState('');
  const [eqDiv, setEqDiv] = useState('');
  const [eqRacha, setEqRacha] = useState('');

  const [editandoEquipoId, setEditandoEquipoId] = useState<number | null>(null);
  const [editEquipoForm, setEditEquipoForm] = useState<Equipo | null>(null);
  // Estados para el formulario de Registro de Jugadores
  const [jNombre, setJNombre] = useState('');
  const [jPosicion, setJPosicion] = useState('Base');
  const [jEquipo, setJEquipo] = useState('');
  const [jPuntos, setJPuntos] = useState(0);
  const [jAsistencias, setJAsistencias] = useState(0);
  const [jRebotes, setJRebotes] = useState(0);
  const [jFoto, setJFoto] = useState('');

  // --- NUEVOS ESTADOS PARA EDICIÓN DE JUGADORES ---
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Jugador | null>(null);

  // Estados para el formulario de Partidos
  const [eqLocal, setEqLocal] = useState('');
  const [ptsLocal, setPtsLocal] = useState('');
  const [logoLocal, setLogoLocal] = useState('');

  const [eqVisitante, setEqVisitante] = useState('');
  const [ptsVisitante, setPtsVisitante] = useState('');
  const [logoVisitante, setLogoVisitante] = useState('');

  const [pFecha, setPFecha] = useState('');
  const [pJornada, setPJornada] = useState('');
  const [editandoPartidoId, setEditandoPartidoId] = useState<number | null>(null);
  const [jornadaFiltro, setJornadaFiltro] = useState('Todas');

  // Estados para el formulario de Líderes de Equipo
  const [lEquipo, setLEquipo] = useState('');
  const [lLiderNombre, setLLiderNombre] = useState('');
  const [lTelefono, setLTelefono] = useState('');
  const [editandoLiderId, setEditandoLiderId] = useState<number | null>(null);
  const [editLiderForm, setEditLiderForm] = useState<LiderEquipo | null>(null);

  // Estados para el Boxscore
  const [boxscoreAbierto, setBoxscoreAbierto] = useState<number | null>(null);
  const [periodoActivo, setPeriodoActivo] = useState<TabPeriodo>('ALL');
  const [boxscoreEdit, setBoxscoreEdit] = useState<JugadorBoxscore[] | null>(null);
  const [bxJugadorId, setBxJugadorId] = useState('');
  const [bxLado, setBxLado] = useState<'local' | 'visitante'>('local');

  // Estados para la galería de fotos por Equipo
  const [equipoGaleriaId, setEquipoGaleriaId] = useState<number | null>(null);
  const [fotoUrl, setFotoUrl] = useState('');
  const [fotoDesc, setFotoDesc] = useState('');

  // Estado para avisar cuando el boxscore mostrado viene precargado de un partido anterior entre los mismos equipos
  const [boxscorePrecargado, setBoxscorePrecargado] = useState(false);

  // Sincroniza la copia editable del boxscore cada vez que se abre uno o cambian los datos de Firebase
  useEffect(() => {
    if (boxscoreAbierto === null) {
      setBoxscoreEdit(null);
      setBoxscorePrecargado(false);
      return;
    }

    const bx = boxscores.find(b => b.partidoId === boxscoreAbierto);
    if (bx && bx.jugadores.length > 0) {
      setBoxscoreEdit(bx.jugadores.map(j => ({ ...j, periodos: { ...j.periodos } })));
      setBoxscorePrecargado(false);
      return;
    }

    // Este partido todavía no tiene boxscore propio (o tiene uno vacío guardado): si los mismos dos equipos ya jugaron antes
    // (en otra jornada), usamos ese boxscore como punto de partida para no cargar todo de nuevo.
    const partidoActual = partidos.find(p => p.id === boxscoreAbierto);
    const partidoPrevio = partidoActual
      ? partidos
          .filter(p => p.id !== partidoActual.id && (
            (p.equipoLocal === partidoActual.equipoLocal && p.equipoVisitante === partidoActual.equipoVisitante) ||
            (p.equipoLocal === partidoActual.equipoVisitante && p.equipoVisitante === partidoActual.equipoLocal)
          ))
          .sort((a, b) => b.id - a.id)[0]
      : undefined;
    const boxscorePrevio = partidoPrevio ? boxscores.find(b => b.partidoId === partidoPrevio.id) : undefined;

    if (partidoPrevio && boxscorePrevio) {
      const seInvirtioElLado = partidoPrevio.equipoLocal === partidoActual!.equipoVisitante;
      setBoxscoreEdit(boxscorePrevio.jugadores.map(j => ({
        ...j,
        lado: seInvirtioElLado ? (j.lado === 'local' ? 'visitante' : 'local') : j.lado,
        periodos: { ...j.periodos }
      })));
      setBoxscorePrecargado(true);
      return;
    }

    setBoxscoreEdit([]);
    setBoxscorePrecargado(false);
  }, [boxscoreAbierto, boxscores, partidos]);

  // Guardar Jugador Nuevo
  const handleAddJugador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jNombre.trim() || !jEquipo.trim()) {
      alert("Por favor rellena el nombre y el equipo del jugador.");
      return;
    }

    const nuevoJugador: Jugador = {
      id: Date.now(),
      nombre: jNombre.trim(),
      posicion: jPosicion,
      equipo: jEquipo.trim(),
      puntos: Number(jPuntos),
      asistencias: Number(jAsistencias),
      rebotes: Number(jRebotes),
      foto: jFoto.trim() || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=200'
    };

    setJugadores([...jugadores, nuevoJugador]);
    setJNombre('');
    setJEquipo('');
    setJPuntos(0);
    setJAsistencias(0);
    setJRebotes(0);
    setJFoto('');
    alert("¡Jugador registrado correctamente! 🏀");
  };

  // --- FUNCIONES PARA MANEJAR LA EDICIÓN ---
  const handleIniciarEdicion = (jugador: Jugador) => {
    setEditandoId(jugador.id);
    setEditForm({ ...jugador }); // Clonamos el jugador en el estado temporal
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setEditForm(null);
  };

  const handleGuardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editForm.nombre.trim() || !editForm.equipo.trim()) {
      alert("El nombre y el equipo no pueden estar vacíos.");
      return;
    }

    // Reemplazamos el jugador viejo con los datos del formulario de edición
    setJugadores(jugadores.map(j => j.id === editForm.id ? editForm : j));
    setEditandoId(null);
    setEditForm(null);
    alert("¡Tarjeta de jugador actualizada! 📝");
  };

  const handleEditFormChange = <K extends keyof Jugador>(campo: K, valor: Jugador[K]) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      [campo]: valor
    });
  };

  const resetFormPartido = () => {
    setEqLocal('');
    setPtsLocal('');
    setLogoLocal('');
    setEqVisitante('');
    setPtsVisitante('');
    setLogoVisitante('');
    setPFecha('');
    setPJornada('');
  };

  // Elegir un equipo ya cargado para autocompletar nombre y logo (local o visitante)
  const handleElegirEquipoPartido = (lado: 'local' | 'visitante', nombreEquipo: string) => {
    if (!nombreEquipo) return;
    const equipo = equipos.find(eq => eq.nombre === nombreEquipo);
    if (lado === 'local') {
      setEqLocal(nombreEquipo);
      if (equipo?.logo) setLogoLocal(equipo.logo);
    } else {
      setEqVisitante(nombreEquipo);
      if (equipo?.logo) setLogoVisitante(equipo.logo);
    }
  };

  // Guardar Partido (alta o edición)
  const handleSubmitPartido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqLocal.trim() || !eqVisitante.trim() || !ptsLocal || !ptsVisitante || !pFecha) {
      alert("Por favor completa todos los campos obligatorios del partido.");
      return;
    }

    const datosPartido = {
      equipoLocal: eqLocal.trim(),
      puntosLocal: Number(ptsLocal),
      equipoVisitante: eqVisitante.trim(),
      puntosVisitante: Number(ptsVisitante),
      fecha: pFecha,
      jornada: pJornada.trim(),
      logoLocal: logoLocal.trim() || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=100',
      logoVisitante: logoVisitante.trim() || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=100'
    };

    if (editandoPartidoId !== null) {
      setPartidos(partidos.map(p => p.id === editandoPartidoId ? { id: editandoPartidoId, ...datosPartido } : p));
      setEditandoPartidoId(null);
      resetFormPartido();
      alert("¡Partido actualizado con éxito! ✏️");
      return;
    }

    const nuevoPartido: Partido = { id: Date.now(), ...datosPartido };
    setPartidos([...partidos, nuevoPartido]);
    resetFormPartido();
    setBoxscoreAbierto(nuevoPartido.id);
    alert("¡Partido guardado con éxito! 🏁");
  };

  const handleIniciarEdicionPartido = (partido: Partido) => {
    setEditandoPartidoId(partido.id);
    setEqLocal(partido.equipoLocal);
    setPtsLocal(String(partido.puntosLocal));
    setLogoLocal(partido.logoLocal || '');
    setEqVisitante(partido.equipoVisitante);
    setPtsVisitante(String(partido.puntosVisitante));
    setLogoVisitante(partido.logoVisitante || '');
    setPFecha(partido.fecha);
    setPJornada(partido.jornada || '');
  };

  const handleCancelarEdicionPartido = () => {
    setEditandoPartidoId(null);
    resetFormPartido();
  };

  const handleDeleteJugador = async (id: number) => {
    if (window.confirm("¿Eliminar este jugador?")) {
      try {
        await onDeleteJugador(id);
        if (editandoId === id) handleCancelarEdicion();
      } catch (err) {
        console.error('Error al eliminar el jugador en Firebase:', err);
        alert("No se pudo eliminar el jugador. Revisa la consola (F12) para ver el error de Firebase.");
      }
    }
  };

  const handleDeletePartido = async (id: number) => {
    if (window.confirm("¿Eliminar este registro de partido?")) {
      try {
        await onDeletePartido(id);
        if (boxscoreAbierto === id) setBoxscoreAbierto(null);
        if (editandoPartidoId === id) handleCancelarEdicionPartido();
      } catch (err) {
        console.error('Error al eliminar el partido en Firebase:', err);
        alert("No se pudo eliminar el partido. Revisa la consola (F12) para ver el error de Firebase.");
      }
    }
  };

  // --- LÍDERES DE EQUIPO (aviso de partido por WhatsApp) ---
  const handleAddLider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lEquipo.trim() || !lLiderNombre.trim() || !lTelefono.trim()) {
      alert("Completa el equipo, el nombre del líder y su WhatsApp.");
      return;
    }

    const nuevoLider: LiderEquipo = {
      id: Date.now(),
      equipo: lEquipo.trim(),
      liderNombre: lLiderNombre.trim(),
      telefono: lTelefono.trim()
    };

    try {
      await onGuardarLider(nuevoLider);
      setLEquipo('');
      setLLiderNombre('');
      setLTelefono('');
    } catch (err) {
      console.error('Error al guardar el líder de equipo en Firebase:', err);
      alert("No se pudo guardar el líder de equipo. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const handleIniciarEdicionLider = (lider: LiderEquipo) => {
    setEditandoLiderId(lider.id);
    setEditLiderForm({ ...lider });
  };

  const handleCancelarEdicionLider = () => {
    setEditandoLiderId(null);
    setEditLiderForm(null);
  };

  const handleGuardarEdicionLider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLiderForm || !editLiderForm.equipo.trim() || !editLiderForm.telefono.trim()) {
      alert("El equipo y el WhatsApp no pueden estar vacíos.");
      return;
    }
    try {
      await onGuardarLider(editLiderForm);
      setEditandoLiderId(null);
      setEditLiderForm(null);
    } catch (err) {
      console.error('Error al actualizar el líder de equipo en Firebase:', err);
      alert("No se pudo guardar la edición. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const handleEditLiderFormChange = <K extends keyof LiderEquipo>(campo: K, valor: LiderEquipo[K]) => {
    if (!editLiderForm) return;
    setEditLiderForm({ ...editLiderForm, [campo]: valor });
  };

  const handleDeleteLider = async (id: number) => {
    if (!window.confirm("¿Eliminar este líder de equipo?")) return;
    try {
      await onDeleteLider(id);
      if (editandoLiderId === id) handleCancelarEdicionLider();
    } catch (err) {
      console.error('Error al eliminar el líder de equipo en Firebase:', err);
      alert("No se pudo eliminar el líder de equipo. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const handleAvisarLider = (equipoNombre: string, rival: string, fecha: string) => {
    const lider = lideresEquipo.find(l => l.equipo.trim().toLowerCase() === equipoNombre.trim().toLowerCase());
    if (!lider) return;

    const mensaje = encodeURIComponent(
      `Hola ${lider.liderNombre}! Te avisamos que se registró un partido para *${equipoNombre}*:\n\n` +
      `🗓️ Fecha: ${fecha}\n` +
      `🆚 Rival: ${rival}\n\n` +
      `⚠️ Recordá que la inasistencia sin aviso previo implica el pago de la penalidad correspondiente según el Reglamento de la Krack League 3x3.\n\n` +
      `¡Nos vemos en la cancha! 🏀`
    );
    window.open(`https://wa.me/${lider.telefono}?text=${mensaje}`, '_blank', 'noopener,noreferrer');
  };

  // Abrir/cerrar el panel de Boxscore de un partido
  const handleToggleBoxscore = (partidoId: number) => {
    setBoxscoreAbierto(prev => (prev === partidoId ? null : partidoId));
    setPeriodoActivo('ALL');
  };

  const handleAgregarJugadorBoxscore = () => {
    if (!bxJugadorId || !boxscoreEdit) return;
    const jugador = jugadores.find(j => j.id === Number(bxJugadorId));
    if (!jugador) return;
    if (boxscoreEdit.some(j => j.jugadorId === jugador.id)) {
      alert("Ese jugador ya está en el boxscore.");
      return;
    }
    setBoxscoreEdit([...boxscoreEdit, { jugadorId: jugador.id, nombre: jugador.nombre, foto: jugador.foto, lado: bxLado, periodos: {} }]);
    setBxJugadorId('');
  };

  const handleQuitarJugadorBoxscore = (jugadorId: number) => {
    if (!boxscoreEdit) return;
    setBoxscoreEdit(boxscoreEdit.filter(j => j.jugadorId !== jugadorId));
  };

  const handleStatChange = (jugadorId: number, periodo: PeriodoJuego, campo: keyof StatsPeriodo, valor: number) => {
    if (!boxscoreEdit) return;
    setBoxscoreEdit(boxscoreEdit.map(j => {
      if (j.jugadorId !== jugadorId) return j;
      const actual = j.periodos[periodo] || statsVacias();
      return { ...j, periodos: { ...j.periodos, [periodo]: { ...actual, [campo]: valor } } };
    }));
  };

  const handleGuardarBoxscore = async () => {
    if (boxscoreAbierto === null || !boxscoreEdit) return;
    try {
      await onGuardarBoxscore({ id: boxscoreAbierto, partidoId: boxscoreAbierto, jugadores: boxscoreEdit });
      alert("¡Boxscore guardado! 📊");
    } catch (err) {
      console.error('Error al guardar el boxscore:', err);
      alert("No se pudo guardar el boxscore. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const handleEliminarBoxscore = async () => {
    if (boxscoreAbierto === null) return;
    if (!window.confirm("¿Eliminar el boxscore completo de este partido?")) return;
    try {
      await onDeleteBoxscore(boxscoreAbierto);
      setBoxscoreAbierto(null);
    } catch (err) {
      console.error('Error al eliminar el boxscore:', err);
      alert("No se pudo eliminar el boxscore. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const boxscorePartido = boxscoreAbierto !== null ? partidos.find(p => p.id === boxscoreAbierto) || null : null;

  // Guardar Equipo Nuevo (Clasificación)
  const handleAddEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqNombre.trim() || !eqVictorias || !eqDerrotas) {
      alert("Por favor completa el nombre y el récord (G/P) del equipo.");
      return;
    }

    const nuevoEquipo: Equipo = {
      id: Date.now(),
      nombre: eqNombre.trim(),
      logo: eqLogo.trim() || LOGO_PLACEHOLDER,
      conferencia: eqConferencia,
      victorias: Number(eqVictorias),
      derrotas: Number(eqDerrotas),
      pct: eqPct.trim(),
      gb: eqGb.trim(),
      conf: eqConf.trim(),
      div: eqDiv.trim(),
      racha: eqRacha.trim()
    };

    try {
      await setEquipos([...equipos, nuevoEquipo]);
      setEqNombre('');
      setEqLogo('');
      setEqVictorias('');
      setEqDerrotas('');
      setEqPct('');
      setEqGb('');
      setEqConf('');
      setEqDiv('');
      setEqRacha('');
      alert("¡Equipo agregado a la clasificación! 🏆");
    } catch (err) {
      console.error('Error al guardar el equipo en Firebase:', err);
      alert("No se pudo guardar el equipo. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const handleIniciarEdicionEquipo = (equipo: Equipo) => {
    setEditandoEquipoId(equipo.id);
    setEditEquipoForm({ ...equipo });
  };

  const handleCancelarEdicionEquipo = () => {
    setEditandoEquipoId(null);
    setEditEquipoForm(null);
  };

  const handleGuardarEdicionEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEquipoForm || !editEquipoForm.nombre.trim()) {
      alert("El nombre del equipo no puede estar vacío.");
      return;
    }

    try {
      await setEquipos(equipos.map(eq => eq.id === editEquipoForm.id ? editEquipoForm : eq));
      setEditandoEquipoId(null);
      setEditEquipoForm(null);
    } catch (err) {
      console.error('Error al actualizar el equipo en Firebase:', err);
      alert("No se pudo guardar la edición. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const handleEditEquipoFormChange = <K extends keyof Equipo>(campo: K, valor: Equipo[K]) => {
    if (!editEquipoForm) return;
    setEditEquipoForm({
      ...editEquipoForm,
      [campo]: valor
    });
  };

  const handleDeleteEquipo = async (id: number) => {
    if (window.confirm("¿Eliminar este equipo de la clasificación?")) {
      try {
        await onDeleteEquipo(id);
        if (editandoEquipoId === id) handleCancelarEdicionEquipo();
      } catch (err) {
        console.error('Error al eliminar el equipo en Firebase:', err);
        alert("No se pudo eliminar el equipo. Revisa la consola (F12) para ver el error de Firebase.");
      }
    }
  };

  const equiposConferencia = equipos
    .filter(eq => eq.conferencia === conferenciaActiva)
    .sort((a, b) => (b.victorias - b.derrotas) - (a.victorias - a.derrotas));

  const jugadoresOrdenados = [...jugadores].sort((a, b) => b.puntos - a.puntos);

  // Filtro de partidos por Jornada
  const jornadasDisponibles = ['Todas', ...Array.from(new Set(partidos.map(p => p.jornada).filter((j): j is string => !!j)))];
  const partidosFiltrados = partidos.filter(p => jornadaFiltro === 'Todas' || p.jornada === jornadaFiltro);

  // Galería de fotos por Equipo
  const equipoGaleria = equipos.find(eq => eq.id === equipoGaleriaId) || null;

  const handleAgregarFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoGaleriaId || !fotoUrl.trim()) {
      alert("Selecciona un equipo y completa la URL de la foto.");
      return;
    }

    const nuevaFoto = { id: Date.now(), url: fotoUrl.trim(), desc: fotoDesc.trim() };

    try {
      await setEquipos(equipos.map(eq =>
        eq.id === equipoGaleriaId ? { ...eq, fotos: [...(eq.fotos || []), nuevaFoto] } : eq
      ));
      setFotoUrl('');
      setFotoDesc('');
    } catch (err) {
      console.error('Error al guardar la foto en Firebase:', err);
      alert("No se pudo guardar la foto. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const handleEliminarFoto = async (equipoId: number, fotoId: number) => {
    if (!window.confirm("¿Eliminar esta foto de la galería del equipo?")) return;
    try {
      await setEquipos(equipos.map(eq =>
        eq.id === equipoId ? { ...eq, fotos: (eq.fotos || []).filter(f => f.id !== fotoId) } : eq
      ));
    } catch (err) {
      console.error('Error al eliminar la foto en Firebase:', err);
      alert("No se pudo eliminar la foto. Revisa la consola (F12) para ver el error de Firebase.");
    }
  };

  const handleDescargarFoto = async (url: string, nombreArchivo: string) => {
    try {
      const respuesta = await fetch(url);
      const blob = await respuesta.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.warn('No se pudo descargar la imagen directamente, se abre en una pestaña nueva.', err);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-12">
      {/* TÍTULO DE LA SECCIÓN */}
      <div className="border-b-2 border-[#05fcfe] pb-2 text-center md:text-left">
        <h2 className="text-3xl text-[#05fcfe] font-bold">📊 Estadísticas y Resultados</h2>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex gap-2 border-b border-gray-800 overflow-x-auto">
        {([
          { id: 'clasificacion', label: '🏆 Clasificación' },
          { id: 'partidos', label: '🗓️ Partidos' },
          { id: 'jugadores', label: '🏀 Jugadores' },
          { id: 'equipos', label: '🖼️ Equipos' }
        ] as { id: SeccionEstadisticas; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSeccionActiva(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap cursor-pointer border-b-2 transition-colors ${
              seccionActiva === tab.id
                ? 'border-[#05fcfe] text-[#05fcfe]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== MÓDULO DE CLASIFICACIÓN ==================== */}
      {seccionActiva === 'clasificacion' && (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-2">🏆 Clasificación</h3>
          <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
            {(['Este', 'Oeste'] as Conferencia[]).map((conf) => (
              <button
                key={conf}
                type="button"
                onClick={() => setConferenciaActiva(conf)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
                  conferenciaActiva === conf ? 'bg-[#05fcfe] text-gray-900' : 'text-gray-300 hover:text-white'
                }`}
              >
                {conf}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario Registrar Equipo */}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-3xl mx-auto shadow-xl">
            <h4 className="text-xl font-bold text-[#05fcfe] mb-4 flex items-center gap-2">🏆 Agregar Equipo a la Clasificación</h4>
            <form onSubmit={handleAddEquipo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nombre del Equipo:</label>
                  <input type="text" value={eqNombre} onChange={(e) => setEqNombre(e.target.value)} placeholder="Ej: Krack League" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">URL del Logo:</label>
                  <input type="url" value={eqLogo} onChange={(e) => setEqLogo(e.target.value)} placeholder="https://enlace-del-logo.jpg" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Conferencia:</label>
                  <select value={eqConferencia} onChange={(e) => setEqConferencia(e.target.value as Conferencia)} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none">
                    <option value="Este">Este</option>
                    <option value="Oeste">Oeste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Victorias (G):</label>
                  <input type="number" min="0" value={eqVictorias} onChange={(e) => setEqVictorias(e.target.value)} placeholder="Ej: 56" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Derrotas (P):</label>
                  <input type="number" min="0" value={eqDerrotas} onChange={(e) => setEqDerrotas(e.target.value)} placeholder="Ej: 26" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Racha:</label>
                  <input type="text" value={eqRacha} onChange={(e) => setEqRacha(e.target.value)} placeholder="Ej: W2" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">PCT:</label>
                  <input type="text" value={eqPct} onChange={(e) => setEqPct(e.target.value)} placeholder="Ej: ,683" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">GB:</label>
                  <input type="text" value={eqGb} onChange={(e) => setEqGb(e.target.value)} placeholder="Ej: 4,0" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Récord CONF:</label>
                  <input type="text" value={eqConf} onChange={(e) => setEqConf(e.target.value)} placeholder="Ej: 36-16" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Récord DIV:</label>
                  <input type="text" value={eqDiv} onChange={(e) => setEqDiv(e.target.value)} placeholder="Ej: 10-6" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded transition-colors cursor-pointer shadow-md">
                Agregar Equipo
              </button>
            </form>
          </div>
        )}

        {/* Tabla de Clasificación */}
        {equiposConferencia.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">No hay equipos cargados en la conferencia {conferenciaActiva}.</div>
        ) : (
          <div className="overflow-x-auto bg-gray-950 border border-gray-800 rounded-xl shadow-lg">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-800">
                  <th className="py-3 px-4">Equipo</th>
                  <th className="py-3 px-2 text-center">G</th>
                  <th className="py-3 px-2 text-center">P</th>
                  <th className="py-3 px-2 text-center">PCT</th>
                  <th className="py-3 px-2 text-center">GB</th>
                  <th className="py-3 px-2 text-center">CONF</th>
                  <th className="py-3 px-2 text-center">DIV</th>
                  <th className="py-3 px-2 text-center">RACHA</th>
                  {isAdmin && <th className="py-3 px-2 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {equiposConferencia.map((equipo, idx) => {
                  const esModoEdicion = editandoEquipoId === equipo.id && editEquipoForm;

                  if (esModoEdicion && editEquipoForm) {
                    return (
                      <tr key={equipo.id} className="border-b border-gray-800/60 bg-gray-900/80">
                        <td className="py-2 px-4">
                          <input type="text" value={editEquipoForm.nombre} onChange={(e) => handleEditEquipoFormChange('nombre', e.target.value)} className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                          <input type="url" value={editEquipoForm.logo || ''} onChange={(e) => handleEditEquipoFormChange('logo', e.target.value)} placeholder="URL logo" className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none mt-1" />
                        </td>
                        <td className="px-2"><input type="number" min="0" value={editEquipoForm.victorias} onChange={(e) => handleEditEquipoFormChange('victorias', Number(e.target.value))} className="w-14 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        <td className="px-2"><input type="number" min="0" value={editEquipoForm.derrotas} onChange={(e) => handleEditEquipoFormChange('derrotas', Number(e.target.value))} className="w-14 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        <td className="px-2"><input type="text" value={editEquipoForm.pct} onChange={(e) => handleEditEquipoFormChange('pct', e.target.value)} className="w-16 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        <td className="px-2"><input type="text" value={editEquipoForm.gb} onChange={(e) => handleEditEquipoFormChange('gb', e.target.value)} className="w-14 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        <td className="px-2"><input type="text" value={editEquipoForm.conf} onChange={(e) => handleEditEquipoFormChange('conf', e.target.value)} className="w-16 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        <td className="px-2"><input type="text" value={editEquipoForm.div} onChange={(e) => handleEditEquipoFormChange('div', e.target.value)} className="w-16 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        <td className="px-2"><input type="text" value={editEquipoForm.racha} onChange={(e) => handleEditEquipoFormChange('racha', e.target.value)} className="w-14 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        {isAdmin && (
                          <td className="px-2">
                            <div className="flex gap-1 justify-center">
                              <button onClick={handleGuardarEdicionEquipo} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">Guardar</button>
                              <button onClick={handleCancelarEdicionEquipo} className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] py-1 px-2 rounded cursor-pointer">Cancelar</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  }

                  return (
                    <tr key={equipo.id} className="border-b border-gray-800/60 hover:bg-gray-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[160px]">
                          <span className="text-gray-500 font-semibold w-4">{idx + 1}</span>
                          <img src={equipo.logo || LOGO_PLACEHOLDER} alt={equipo.nombre} className="w-7 h-7 rounded-full object-cover bg-gray-900 border border-gray-800 shrink-0" />
                          <span className="font-semibold text-white truncate">{equipo.nombre}</span>
                        </div>
                      </td>
                      <td className="text-center px-2 text-gray-200">{equipo.victorias}</td>
                      <td className="text-center px-2 text-gray-200">{equipo.derrotas}</td>
                      <td className="text-center px-2 text-gray-200">{equipo.pct}</td>
                      <td className="text-center px-2 text-gray-400">{equipo.gb}</td>
                      <td className="text-center px-2 text-gray-400">{equipo.conf}</td>
                      <td className="text-center px-2 text-gray-400">{equipo.div}</td>
                      <td className="text-center px-2 font-semibold text-emerald-400">{equipo.racha}</td>
                      {isAdmin && (
                        <td className="px-2">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleIniciarEdicionEquipo(equipo)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">✏️</button>
                            <button onClick={() => handleDeleteEquipo(equipo.id)} className="bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">🗑️</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* ==================== MÓDULO DE PARTIDOS ==================== */}
      {seccionActiva === 'partidos' && (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-2">🗓️ Últimos Partidos</h3>

        {/* Formulario Registrar Partido */}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-3xl mx-auto shadow-xl">
            <h4 className="text-xl font-bold text-[#05fcfe] mb-4 flex items-center gap-2">
              {editandoPartidoId !== null ? '✏️ Editar Partido' : '🗓️ Registrar Partido'}
            </h4>
            <form onSubmit={handleSubmitPartido} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-3">
                  <h5 className="text-sm font-bold text-orange-400">🏠 EQUIPO LOCAL</h5>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre del Equipo:</label>
                    {equipos.length > 0 && (
                      <select value="" onChange={(e) => handleElegirEquipoPartido('local', e.target.value)} className="w-full p-2 text-xs rounded bg-gray-900 border border-gray-700 text-gray-300 focus:outline-none mb-1">
                        <option value="">— Elegir equipo ya cargado —</option>
                        {equipos.map(eq => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
                      </select>
                    )}
                    <input type="text" value={eqLocal} onChange={(e) => setEqLocal(e.target.value)} placeholder="Ej: Krack League" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-orange-400" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Puntos Anotados:</label>
                    <input type="number" min="0" value={ptsLocal} onChange={(e) => setPtsLocal(e.target.value)} placeholder="Ej: 85" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-orange-400" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">URL del Logo / Foto:</label>
                    <input type="url" value={logoLocal} onChange={(e) => setLogoLocal(e.target.value)} placeholder="https://enlace-del-logo.jpg" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-orange-400" />
                  </div>
                </div>

                {/* Visitante */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-3">
                  <h5 className="text-sm font-bold text-sky-400">🚀 EQUIPO VISITANTE</h5>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre del Equipo:</label>
                    {equipos.length > 0 && (
                      <select value="" onChange={(e) => handleElegirEquipoPartido('visitante', e.target.value)} className="w-full p-2 text-xs rounded bg-gray-900 border border-gray-700 text-gray-300 focus:outline-none mb-1">
                        <option value="">— Elegir equipo ya cargado —</option>
                        {equipos.map(eq => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
                      </select>
                    )}
                    <input type="text" value={eqVisitante} onChange={(e) => setEqVisitante(e.target.value)} placeholder="Ej: Halcones FC" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-sky-400" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Puntos Anotados:</label>
                    <input type="number" min="0" value={ptsVisitante} onChange={(e) => setPtsVisitante(e.target.value)} placeholder="Ej: 80" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-sky-400" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">URL del Logo / Foto:</label>
                    <input type="url" value={logoVisitante} onChange={(e) => setLogoVisitante(e.target.value)} placeholder="https://enlace-del-logo.jpg" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-sky-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fecha del encuentro:</label>
                  <input type="date" value={pFecha} onChange={(e) => setPFecha(e.target.value)} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe] [color-scheme:dark]" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Jornada (opcional):</label>
                  <input type="text" list="jornadas-existentes" value={pJornada} onChange={(e) => setPJornada(e.target.value)} placeholder="Ej: Jornada 1" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" />
                  <datalist id="jornadas-existentes">
                    {jornadasDisponibles.filter(j => j !== 'Todas').map(j => <option key={j} value={j} />)}
                  </datalist>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded transition-colors cursor-pointer shadow-md">
                  {editandoPartidoId !== null ? '💾 Guardar Cambios del Partido' : 'Guardar Partido'}
                </button>
                {editandoPartidoId !== null && (
                  <button type="button" onClick={handleCancelarEdicionPartido} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-5 rounded transition-colors cursor-pointer">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Gestión de Líderes de Equipo (Solo Admin) */}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-3xl mx-auto shadow-xl space-y-4">
            <h4 className="text-xl font-bold text-[#05fcfe] text-center flex items-center justify-center gap-2">👤 Líderes de Equipo (avisos por WhatsApp)</h4>

            {lideresEquipo.length === 0 ? (
              <p className="text-xs text-gray-500 text-center">Todavía no cargaste ningún líder de equipo.</p>
            ) : (
              <div className="space-y-2">
                {lideresEquipo.map(lider => {
                  const enEdicion = editandoLiderId === lider.id && editLiderForm;

                  if (enEdicion && editLiderForm) {
                    return (
                      <form key={lider.id} onSubmit={handleGuardarEdicionLider} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-900 border border-gray-700 rounded-lg p-3">
                        <div>
                          {equipos.length > 0 && (
                            <select value="" onChange={(e) => e.target.value && handleEditLiderFormChange('equipo', e.target.value)} className="w-full p-1 text-[10px] rounded bg-gray-950 border border-gray-700 text-gray-300 focus:outline-none mb-1">
                              <option value="">— Elegir —</option>
                              {equipos.map(eq => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
                            </select>
                          )}
                          <input type="text" value={editLiderForm.equipo} onChange={(e) => handleEditLiderFormChange('equipo', e.target.value)} placeholder="Equipo" className="w-full p-1.5 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                        </div>
                        <input type="text" value={editLiderForm.liderNombre} onChange={(e) => handleEditLiderFormChange('liderNombre', e.target.value)} placeholder="Nombre del líder" className="p-1.5 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                        <input type="text" value={editLiderForm.telefono} onChange={(e) => handleEditLiderFormChange('telefono', e.target.value)} placeholder="Ej: 5491122334455" className="p-1.5 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                        <div className="flex gap-2 sm:col-span-3">
                          <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 rounded text-xs cursor-pointer">Guardar</button>
                          <button type="button" onClick={handleCancelarEdicionLider} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 rounded text-xs cursor-pointer">Cancelar</button>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div key={lider.id} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{lider.equipo}</p>
                        <p className="text-[11px] text-gray-400 truncate">{lider.liderNombre || 'Sin nombre'} · +{lider.telefono}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleIniciarEdicionLider(lider)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">✏️</button>
                        <button onClick={() => handleDeleteLider(lider.id)} className="bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleAddLider} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                {equipos.length > 0 && (
                  <select value="" onChange={(e) => e.target.value && setLEquipo(e.target.value)} className="w-full p-2 text-xs rounded bg-gray-950 border border-gray-700 text-gray-300 focus:outline-none mb-1">
                    <option value="">— Elegir equipo ya cargado —</option>
                    {equipos.map(eq => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
                  </select>
                )}
                <input type="text" value={lEquipo} onChange={(e) => setLEquipo(e.target.value)} placeholder="Nombre del equipo" className="w-full p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
              </div>
              <input type="text" value={lLiderNombre} onChange={(e) => setLLiderNombre(e.target.value)} placeholder="Nombre del líder" className="p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
              <input type="text" value={lTelefono} onChange={(e) => setLTelefono(e.target.value)} placeholder="WhatsApp (ej: 5491122334455)" className="p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
              <button type="submit" className="sm:col-span-3 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition-colors cursor-pointer text-sm">➕ Agregar Líder de Equipo</button>
            </form>
            <p className="text-[11px] text-gray-500 text-center">El nombre del equipo debe escribirse igual a como lo cargás en el partido (Local/Visitante), para que el sistema lo reconozca.</p>
          </div>
        )}

        {/* Filtro por Jornada */}
        {jornadasDisponibles.length > 1 && (
          <div className="flex gap-1 bg-gray-800 p-1 rounded-lg overflow-x-auto w-fit max-w-full">
            {jornadasDisponibles.map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => setJornadaFiltro(j)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  jornadaFiltro === j ? 'bg-[#05fcfe] text-gray-900' : 'text-gray-300 hover:text-white'
                }`}
              >
                {j}
              </button>
            ))}
          </div>
        )}

        {/* Listado de Partidos (tabla compacta) + Boxscore al costado */}
        {partidos.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">No hay registros de encuentros disponibles.</div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Tabla de partidos */}
            <div className="w-full lg:w-2/5 bg-gray-950 border border-gray-800 rounded-xl shadow-lg overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-800">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-2">Jornada</th>
                    <th className="py-3 px-2">Local</th>
                    <th className="py-3 px-2 text-center">Marcador</th>
                    <th className="py-3 px-2">Visitante</th>
                    {isAdmin && <th className="py-3 px-2 text-center"></th>}
                  </tr>
                </thead>
                <tbody>
                  {partidosFiltrados.map((partido) => {
                    const localGana = partido.puntosLocal > partido.puntosVisitante;
                    const empate = partido.puntosLocal === partido.puntosVisitante;
                    const imgLocal = partido.logoLocal || LOGO_PLACEHOLDER;
                    const imgVisitante = partido.logoVisitante || LOGO_PLACEHOLDER;
                    const seleccionado = boxscoreAbierto === partido.id;

                    return (
                      <tr
                        key={partido.id}
                        onClick={() => handleToggleBoxscore(partido.id)}
                        className={`cursor-pointer border-b border-gray-800/60 transition-colors ${
                          seleccionado ? 'bg-gray-900' : 'hover:bg-gray-900/60'
                        }`}
                      >
                        <td className="py-3 px-4 text-[11px] text-gray-500 font-semibold">{partido.fecha}</td>
                        <td className="px-2 text-[11px] text-gray-500">{partido.jornada || '-'}</td>
                        <td className="px-2">
                          <div className="flex items-center gap-2 min-w-[110px]">
                            <img src={imgLocal} alt={partido.equipoLocal} className="w-7 h-7 rounded-full object-cover border border-gray-800 shrink-0 bg-gray-900" />
                            <span className={`font-semibold truncate text-sm ${localGana && !empate ? 'text-[#05fcfe]' : 'text-gray-300'}`}>
                              {partido.equipoLocal}
                            </span>
                          </div>
                        </td>
                        <td className="text-center px-2 font-black tracking-wide">
                          <span className={localGana && !empate ? 'text-orange-400' : 'text-gray-300'}>{partido.puntosLocal}</span>
                          <span className="text-gray-600 mx-1">-</span>
                          <span className={!localGana && !empate ? 'text-orange-400' : 'text-gray-300'}>{partido.puntosVisitante}</span>
                        </td>
                        <td className="px-2">
                          <div className="flex items-center gap-2 min-w-[110px]">
                            <img src={imgVisitante} alt={partido.equipoVisitante} className="w-7 h-7 rounded-full object-cover border border-gray-800 shrink-0 bg-gray-900" />
                            <span className={`font-semibold truncate text-sm ${!localGana && !empate ? 'text-[#05fcfe]' : 'text-gray-300'}`}>
                              {partido.equipoVisitante}
                            </span>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleIniciarEdicionPartido(partido); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeletePartido(partido.id); }}
                                className="bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ==================== PANEL DE BOXSCORE (AL COSTADO) ==================== */}
            {boxscorePartido && boxscoreEdit ? (
              <div className="w-full lg:w-3/5 bg-gray-950 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gray-900 p-4 flex items-center justify-between gap-3 border-b border-gray-800 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={boxscorePartido.logoLocal || LOGO_PLACEHOLDER} alt={boxscorePartido.equipoLocal} className="w-8 h-8 rounded-full object-cover bg-gray-800 border border-gray-800 shrink-0" />
                    <span className="font-bold text-white truncate">{boxscorePartido.equipoLocal}</span>
                  </div>
                  <div className="text-xl font-black text-[#05fcfe] shrink-0">{boxscorePartido.puntosLocal} - {boxscorePartido.puntosVisitante}</div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-white truncate">{boxscorePartido.equipoVisitante}</span>
                    <img src={boxscorePartido.logoVisitante || LOGO_PLACEHOLDER} alt={boxscorePartido.equipoVisitante} className="w-8 h-8 rounded-full object-cover bg-gray-800 border border-gray-800 shrink-0" />
                  </div>
                  <button onClick={() => setBoxscoreAbierto(null)} className="text-gray-400 hover:text-white text-xs cursor-pointer">✕ Cerrar</button>
                </div>

                {/* Avisar por WhatsApp a los líderes de cada equipo (Solo Admin) */}
                {isAdmin && (
                  <div className="p-3 bg-emerald-950/30 border-b border-emerald-800 flex flex-wrap gap-2">
                    {[
                      { nombre: boxscorePartido.equipoLocal, rival: boxscorePartido.equipoVisitante },
                      { nombre: boxscorePartido.equipoVisitante, rival: boxscorePartido.equipoLocal }
                    ].map(({ nombre, rival }) => {
                      const tieneLider = lideresEquipo.some(l => l.equipo.trim().toLowerCase() === nombre.trim().toLowerCase());
                      return tieneLider ? (
                        <button
                          key={nombre}
                          onClick={() => handleAvisarLider(nombre, rival, boxscorePartido.fecha)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                        >
                          📲 Avisar a {nombre}
                        </button>
                      ) : (
                        <span key={nombre} className="text-[11px] text-gray-500 bg-gray-900 border border-gray-800 rounded-lg py-1.5 px-3">
                          {nombre}: sin líder cargado
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Pestañas de período */}
                <div className="flex gap-1 p-3 bg-gray-900/60 overflow-x-auto border-b border-gray-800">
                  {(['ALL', ...PERIODOS] as TabPeriodo[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriodoActivo(p)}
                      className={`px-3 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                        periodoActivo === p ? 'bg-[#05fcfe] text-gray-900' : 'bg-gray-800 text-gray-300 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {isAdmin && periodoActivo === 'ALL' && (
                  <div className="px-4 py-2 bg-yellow-950/40 border-b border-yellow-800 text-yellow-400 text-xs">
                    ℹ️ "ALL" es de solo lectura y muestra el acumulado de todos los períodos. Para cargar minutos, puntos o tiros, seleccioná primero un período: P1, P2, P3, P4, OT1 u OT2.
                  </div>
                )}

                {isAdmin && boxscorePrecargado && (
                  <div className="px-4 py-2 bg-sky-950/40 border-b border-sky-800 text-sky-400 text-xs">
                    ℹ️ Este partido todavía no tiene boxscore propio: se precargó la misma lista de jugadores y los valores del último partido entre estos dos equipos. Editá los minutos, puntos y tiros para reflejar este encuentro y guardá los cambios.
                  </div>
                )}

                {/* Agregar jugador al boxscore (admin) */}
                {isAdmin && (
                  <div className="p-4 bg-gray-900/40 border-b border-gray-800 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Jugador:</label>
                      <select value={bxJugadorId} onChange={(e) => setBxJugadorId(e.target.value)} className="p-2 text-xs rounded bg-gray-900 border border-gray-700 text-white focus:outline-none min-w-[180px]">
                        <option value="">Seleccionar...</option>
                        {jugadores.map(j => (
                          <option key={j.id} value={j.id}>{j.nombre} ({j.equipo})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Lado:</label>
                      <select value={bxLado} onChange={(e) => setBxLado(e.target.value as 'local' | 'visitante')} className="p-2 text-xs rounded bg-gray-900 border border-gray-700 text-white focus:outline-none">
                        <option value="local">🏠 {boxscorePartido.equipoLocal}</option>
                        <option value="visitante">🚀 {boxscorePartido.equipoVisitante}</option>
                      </select>
                    </div>
                    <button type="button" onClick={handleAgregarJugadorBoxscore} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded cursor-pointer">
                      ➕ Agregar al Boxscore
                    </button>
                  </div>
                )}

                {(['local', 'visitante'] as const).map((lado) => {
                  const filas = boxscoreEdit.filter(j => j.lado === lado);
                  const totales = filas.reduce((acc, j) => sumarStats(acc, periodoActivo === 'ALL' ? statsTotalesJugador(j) : (j.periodos[periodoActivo] || statsVacias())), statsVacias());
                  const editable = isAdmin && periodoActivo !== 'ALL';

                  return (
                    <div key={lado} className="p-4 border-b border-gray-800 last:border-b-0">
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {lado === 'local' ? `🏠 ${boxscorePartido.equipoLocal}` : `🚀 ${boxscorePartido.equipoVisitante}`}
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                          <thead>
                            <tr className="text-gray-500 uppercase tracking-wider border-b border-gray-800">
                              <th className="py-2 px-2">Jugador</th>
                              <th className="py-2 px-2 text-center">MIN</th>
                              <th className="py-2 px-2 text-center">PTS</th>
                              <th className="py-2 px-2 text-center">FG{editable ? '' : '%'}</th>
                              <th className="py-2 px-2 text-center">3P{editable ? '' : '%'}</th>
                              <th className="py-2 px-2 text-center">FT{editable ? '' : '%'}</th>
                              {isAdmin && <th className="py-2 px-2 text-center"></th>}
                            </tr>
                          </thead>
                          <tbody>
                            {filas.length === 0 ? (
                              <tr><td colSpan={7} className="py-4 text-center text-gray-500">Sin jugadores cargados en este lado.</td></tr>
                            ) : filas.map((j) => {
                              const stats = periodoActivo === 'ALL' ? statsTotalesJugador(j) : (j.periodos[periodoActivo] || statsVacias());
                              return (
                                <tr key={j.jugadorId} className="border-b border-gray-800/60">
                                  <td className="py-2 px-2">
                                    <div className="flex items-center gap-2 min-w-[140px]">
                                      <img src={j.foto || LOGO_PLACEHOLDER} alt={j.nombre} className="w-6 h-6 rounded-full object-cover bg-gray-900 shrink-0" />
                                      <span className="text-white font-semibold truncate">{j.nombre}</span>
                                    </div>
                                  </td>
                                  {editable ? (
                                    <>
                                      <td className="px-1"><input type="number" min="0" value={stats.min} onChange={(e) => handleStatChange(j.jugadorId, periodoActivo as PeriodoJuego, 'min', Number(e.target.value))} className="w-12 p-1 text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                                      <td className="px-1"><input type="number" min="0" value={stats.pts} onChange={(e) => handleStatChange(j.jugadorId, periodoActivo as PeriodoJuego, 'pts', Number(e.target.value))} className="w-12 p-1 text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                                      <td className="px-1">
                                        <div className="flex items-center justify-center gap-1">
                                          <input type="number" min="0" value={stats.fgM} onChange={(e) => handleStatChange(j.jugadorId, periodoActivo as PeriodoJuego, 'fgM', Number(e.target.value))} className="w-8 p-1 text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                                          <span className="text-gray-500">/</span>
                                          <input type="number" min="0" value={stats.fgA} onChange={(e) => handleStatChange(j.jugadorId, periodoActivo as PeriodoJuego, 'fgA', Number(e.target.value))} className="w-8 p-1 text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                                        </div>
                                      </td>
                                      <td className="px-1">
                                        <div className="flex items-center justify-center gap-1">
                                          <input type="number" min="0" value={stats.tpM} onChange={(e) => handleStatChange(j.jugadorId, periodoActivo as PeriodoJuego, 'tpM', Number(e.target.value))} className="w-8 p-1 text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                                          <span className="text-gray-500">/</span>
                                          <input type="number" min="0" value={stats.tpA} onChange={(e) => handleStatChange(j.jugadorId, periodoActivo as PeriodoJuego, 'tpA', Number(e.target.value))} className="w-8 p-1 text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                                        </div>
                                      </td>
                                      <td className="px-1">
                                        <div className="flex items-center justify-center gap-1">
                                          <input type="number" min="0" value={stats.ftM} onChange={(e) => handleStatChange(j.jugadorId, periodoActivo as PeriodoJuego, 'ftM', Number(e.target.value))} className="w-8 p-1 text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                                          <span className="text-gray-500">/</span>
                                          <input type="number" min="0" value={stats.ftA} onChange={(e) => handleStatChange(j.jugadorId, periodoActivo as PeriodoJuego, 'ftA', Number(e.target.value))} className="w-8 p-1 text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="text-center px-2 text-gray-200">{stats.min}</td>
                                      <td className="text-center px-2 font-bold text-orange-400">{stats.pts}</td>
                                      <td className="text-center px-2 text-gray-300">{formatPct(stats.fgM, stats.fgA)}</td>
                                      <td className="text-center px-2 text-gray-300">{formatPct(stats.tpM, stats.tpA)}</td>
                                      <td className="text-center px-2 text-gray-300">{formatPct(stats.ftM, stats.ftA)}</td>
                                    </>
                                  )}
                                  {isAdmin && (
                                    <td className="px-2 text-center">
                                      <button onClick={() => handleQuitarJugadorBoxscore(j.jugadorId)} className="text-red-500 hover:text-red-400 cursor-pointer">🗑️</button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                          {filas.length > 0 && (
                            <tfoot>
                              <tr className="border-t border-gray-700 bg-gray-900/60 font-bold">
                                <td className="py-2 px-2 text-gray-300">TOTAL</td>
                                <td className="text-center px-2 text-white">{totales.min}</td>
                                <td className="text-center px-2 text-[#05fcfe]">{totales.pts}</td>
                                <td className="text-center px-2 text-gray-300">{editable ? `${totales.fgM}/${totales.fgA}` : formatPct(totales.fgM, totales.fgA)}</td>
                                <td className="text-center px-2 text-gray-300">{editable ? `${totales.tpM}/${totales.tpA}` : formatPct(totales.tpM, totales.tpA)}</td>
                                <td className="text-center px-2 text-gray-300">{editable ? `${totales.ftM}/${totales.ftA}` : formatPct(totales.ftM, totales.ftA)}</td>
                                {isAdmin && <td></td>}
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  );
                })}

                {isAdmin && (
                  <div className="p-4 flex gap-3">
                    <button onClick={handleGuardarBoxscore} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition-colors cursor-pointer">
                      💾 Guardar Cambios del Boxscore
                    </button>
                    <button onClick={handleEliminarBoxscore} className="bg-gray-800 hover:bg-red-700 text-gray-300 hover:text-white text-sm font-bold py-2 px-4 rounded transition-colors cursor-pointer">
                      🗑️ Eliminar Boxscore
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex w-full lg:w-3/5 items-center justify-center text-center text-gray-500 text-sm py-16 border border-dashed border-gray-800 rounded-xl">
                Seleccioná un partido para ver su boxscore.
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* ==================== MÓDULO DE JUGADORES ==================== */}
      {seccionActiva === 'jugadores' && (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-2">🏀 Estadísticas de Jugadores</h3>

        {/* Formulario Registrar Jugador */}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto shadow-xl">
            <h4 className="text-xl font-bold text-[#05fcfe] mb-4 text-center">➕ Añadir Perfil de Jugador</h4>
            <form onSubmit={handleAddJugador} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nombre Completo:</label>
                  <input type="text" value={jNombre} onChange={(e) => setJNombre(e.target.value)} placeholder="Ej: LeBron James" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Equipo / Club:</label>
                  {equipos.length > 0 && (
                    <select value="" onChange={(e) => e.target.value && setJEquipo(e.target.value)} className="w-full p-2 text-xs rounded bg-gray-900 border border-gray-700 text-gray-300 focus:outline-none mb-1">
                      <option value="">— Elegir equipo ya cargado —</option>
                      {equipos.map(eq => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
                    </select>
                  )}
                  <input type="text" value={jEquipo} onChange={(e) => setJEquipo(e.target.value)} placeholder="Ej: Krack League" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Posición de Juego:</label>
                  <select value={jPosicion} onChange={(e) => setJPosicion(e.target.value)} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none">
                    <option value="Base">Base (PG)</option>
                    <option value="Escolta">Escolta (SG)</option>
                    <option value="Alero">Alero (SF)</option>
                    <option value="Ala-Pívot">Ala-Pívot (PF)</option>
                    <option value="Pívot">Pívot (C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Puntos Totales:</label>
                  <input type="number" min="0" value={jPuntos} onChange={(e) => setJPuntos(Number(e.target.value))} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Asistencias Totales:</label>
                  <input type="number" min="0" value={jAsistencias} onChange={(e) => setJAsistencias(Number(e.target.value))} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Rebotes Totales:</label>
                  <input type="number" min="0" value={jRebotes} onChange={(e) => setJRebotes(Number(e.target.value))} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Enlace URL de la Foto del Jugador:</label>
                <input type="url" value={jFoto} onChange={(e) => setJFoto(e.target.value)} placeholder="https://enlace-de-imagen.jpg" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded cursor-pointer transition-colors mt-2">
                Registrar Ficha de Jugador
              </button>
            </form>
          </div>
        )}

        {/* Tabla de Ranking de Jugadores */}
        {jugadores.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">No hay jugadores cargados en la plantilla.</div>
        ) : (
          <div className="overflow-x-auto bg-gray-950 border border-gray-800 rounded-xl shadow-lg">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-800">
                  <th className="py-3 px-4">Jugador</th>
                  <th className="py-3 px-2 text-center">Equipo</th>
                  <th className="py-3 px-2 text-center">Posición</th>
                  <th className="py-3 px-2 text-center">PTS</th>
                  <th className="py-3 px-2 text-center">AST</th>
                  <th className="py-3 px-2 text-center">REB</th>
                  {isAdmin && <th className="py-3 px-2 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {jugadoresOrdenados.map((jugador, idx) => {
                  const esModoEdicion = editandoId === jugador.id && editForm;

                  if (esModoEdicion && editForm) {
                    return (
                      <tr key={jugador.id} className="border-b border-gray-800/60 bg-gray-900/80">
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <img src={editForm.foto || LOGO_PLACEHOLDER} alt={editForm.nombre} className="w-8 h-8 rounded-full object-cover bg-gray-900 border border-gray-800 shrink-0" />
                            <input type="text" value={editForm.nombre} onChange={(e) => handleEditFormChange('nombre', e.target.value)} className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                          </div>
                          <input type="url" value={editForm.foto} onChange={(e) => handleEditFormChange('foto', e.target.value)} placeholder="URL foto" className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none mt-1" />
                        </td>
                        <td className="px-2">
                          {equipos.length > 0 && (
                            <select value="" onChange={(e) => e.target.value && handleEditFormChange('equipo', e.target.value)} className="w-24 p-1 text-[10px] rounded bg-gray-950 border border-gray-700 text-gray-300 focus:outline-none mb-1">
                              <option value="">— Elegir —</option>
                              {equipos.map(eq => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
                            </select>
                          )}
                          <input type="text" value={editForm.equipo} onChange={(e) => handleEditFormChange('equipo', e.target.value)} className="w-24 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                        </td>
                        <td className="px-2">
                          <select value={editForm.posicion} onChange={(e) => handleEditFormChange('posicion', e.target.value)} className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none">
                            <option value="Base">Base (PG)</option>
                            <option value="Escolta">Escolta (SG)</option>
                            <option value="Alero">Alero (SF)</option>
                            <option value="Ala-Pívot">Ala-Pívot (PF)</option>
                            <option value="Pívot">Pívot (C)</option>
                          </select>
                        </td>
                        <td className="px-2"><input type="number" min="0" value={editForm.puntos} onChange={(e) => handleEditFormChange('puntos', Number(e.target.value))} className="w-14 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        <td className="px-2"><input type="number" min="0" value={editForm.asistencias} onChange={(e) => handleEditFormChange('asistencias', Number(e.target.value))} className="w-14 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        <td className="px-2"><input type="number" min="0" value={editForm.rebotes} onChange={(e) => handleEditFormChange('rebotes', Number(e.target.value))} className="w-14 p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" /></td>
                        {isAdmin && (
                          <td className="px-2">
                            <div className="flex gap-1 justify-center">
                              <button onClick={handleGuardarEdicion} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">Guardar</button>
                              <button onClick={handleCancelarEdicion} className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] py-1 px-2 rounded cursor-pointer">Cancelar</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  }

                  return (
                    <tr key={jugador.id} className="border-b border-gray-800/60 hover:bg-gray-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <span className="text-gray-500 font-semibold w-4">{idx + 1}</span>
                          <img src={jugador.foto || LOGO_PLACEHOLDER} alt={jugador.nombre} className="w-9 h-9 rounded-full object-cover bg-gray-900 border border-gray-800 shrink-0" />
                          <span className="font-semibold text-white truncate">{jugador.nombre}</span>
                        </div>
                      </td>
                      <td className="text-center px-2">
                        <span className="bg-orange-950/40 border border-orange-800 text-orange-400 text-[9px] uppercase font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          {jugador.equipo}
                        </span>
                      </td>
                      <td className="text-center px-2">
                        <span className="bg-gray-900 border border-gray-700 text-[#05fcfe] text-[9px] uppercase font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          {jugador.posicion}
                        </span>
                      </td>
                      <td className="text-center px-2 font-bold text-orange-400">{jugador.puntos}</td>
                      <td className="text-center px-2 font-semibold text-sky-400">{jugador.asistencias}</td>
                      <td className="text-center px-2 font-semibold text-emerald-400">{jugador.rebotes}</td>
                      {isAdmin && (
                        <td className="px-2">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleIniciarEdicion(jugador)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">✏️</button>
                            <button onClick={() => handleDeleteJugador(jugador.id)} className="bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">🗑️</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* ==================== MÓDULO DE EQUIPOS (GALERÍA DE FOTOS) ==================== */}
      {seccionActiva === 'equipos' && (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-2">🖼️ Galería de Equipos</h3>

        {equipos.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">No hay equipos cargados todavía. Agregalos primero desde la pestaña Clasificación.</div>
        ) : (
          <>
            {/* Selector de equipo */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {equipos.map(eq => (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => setEquipoGaleriaId(eq.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    equipoGaleriaId === eq.id
                      ? 'bg-[#05fcfe] text-gray-900 border-[#05fcfe]'
                      : 'bg-gray-900 text-gray-300 border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <img src={eq.logo || LOGO_PLACEHOLDER} alt={eq.nombre} className="w-6 h-6 rounded-full object-cover bg-gray-950 shrink-0" />
                  <span className="text-sm font-semibold">{eq.nombre}</span>
                </button>
              ))}
            </div>

            {!equipoGaleria ? (
              <div className="text-center py-10 text-gray-500 text-sm">Seleccioná un equipo arriba para ver su galería de fotos.</div>
            ) : (
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <img src={equipoGaleria.logo || LOGO_PLACEHOLDER} alt={equipoGaleria.nombre} className="w-12 h-12 rounded-full object-cover bg-gray-900 border border-gray-800 shrink-0" />
                  <h4 className="text-xl font-bold text-white">{equipoGaleria.nombre}</h4>
                </div>

                {/* Formulario admin: agregar foto */}
                {isAdmin && (
                  <form onSubmit={handleAgregarFoto} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-3">
                    <h5 className="text-sm font-bold text-[#05fcfe]">➕ Agregar Foto a {equipoGaleria.nombre}</h5>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">URL de la Imagen:</label>
                      <input type="url" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} placeholder="https://enlace-de-imagen.jpg" className="w-full p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Descripción (opcional):</label>
                      <input type="text" value={fotoDesc} onChange={(e) => setFotoDesc(e.target.value)} placeholder="Ej: Alejandro García - Encuentro de Naciones" className="w-full p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition-colors cursor-pointer text-sm">
                      Agregar Foto
                    </button>
                  </form>
                )}

                {/* Grid de fotos */}
                {!equipoGaleria.fotos || equipoGaleria.fotos.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">Este equipo todavía no tiene fotos cargadas.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {equipoGaleria.fotos.map(foto => (
                      <div key={foto.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative group">
                        {isAdmin && (
                          <button
                            onClick={() => handleEliminarFoto(equipoGaleria.id, foto.id)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer z-10"
                          >
                            🗑️
                          </button>
                        )}
                        <div className="w-full h-48 bg-gray-950 flex items-center justify-center overflow-hidden">
                          <img src={foto.url} alt={foto.desc || equipoGaleria.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-3 space-y-2">
                          {foto.desc && <p className="text-xs text-gray-300 truncate">{foto.desc}</p>}
                          <button
                            onClick={() => handleDescargarFoto(foto.url, `${equipoGaleria.nombre}-${foto.id}.jpg`)}
                            className="w-full text-center bg-[#05fcfe] hover:bg-cyan-400 text-black font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            ⬇️ Descargar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      )}
    </div>
  );
}