import React, { useState, useEffect } from 'react';
import type { Jugador, Partido, Equipo, Conferencia, Boxscore, JugadorBoxscore, StatsPeriodo, PeriodoJuego } from '../types';

export interface EstadisticasProps {
  jugadores: Jugador[];
  setJugadores: React.Dispatch<React.SetStateAction<Jugador[]>>;
  partidos: Partido[];
  setPartidos: React.Dispatch<React.SetStateAction<Partido[]>>;
  equipos: Equipo[];
  setEquipos: (nuevosEquiposOrFn: Equipo[] | ((prev: Equipo[]) => Equipo[])) => Promise<void>;
  onDeleteEquipo: (id: number) => Promise<void>;
  boxscores: Boxscore[];
  onGuardarBoxscore: (boxscore: Boxscore) => Promise<void>;
  onDeleteBoxscore: (id: number) => Promise<void>;
  isAdmin: boolean;
}

const LOGO_PLACEHOLDER = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=100';

type SeccionEstadisticas = 'clasificacion' | 'partidos' | 'jugadores';
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

export default function Estadisticas({ jugadores, setJugadores, partidos, setPartidos, equipos, setEquipos, onDeleteEquipo, boxscores, onGuardarBoxscore, onDeleteBoxscore, isAdmin }: EstadisticasProps) {
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

  // Estados para el Boxscore
  const [boxscoreAbierto, setBoxscoreAbierto] = useState<number | null>(null);
  const [periodoActivo, setPeriodoActivo] = useState<TabPeriodo>('ALL');
  const [boxscoreEdit, setBoxscoreEdit] = useState<JugadorBoxscore[] | null>(null);
  const [bxJugadorId, setBxJugadorId] = useState('');
  const [bxLado, setBxLado] = useState<'local' | 'visitante'>('local');

  // Sincroniza la copia editable del boxscore cada vez que se abre uno o cambian los datos de Firebase
  useEffect(() => {
    if (boxscoreAbierto === null) {
      setBoxscoreEdit(null);
      return;
    }
    const bx = boxscores.find(b => b.partidoId === boxscoreAbierto);
    setBoxscoreEdit(bx ? bx.jugadores.map(j => ({ ...j, periodos: { ...j.periodos } })) : []);
  }, [boxscoreAbierto, boxscores]);

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

  // Guardar Partido
  const handleAddPartido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqLocal.trim() || !eqVisitante.trim() || !ptsLocal || !ptsVisitante || !pFecha) {
      alert("Por favor completa todos los campos obligatorios del partido.");
      return;
    }

    const nuevoPartido: Partido = {
      id: Date.now(),
      equipoLocal: eqLocal.trim(),
      puntosLocal: Number(ptsLocal),
      equipoVisitante: eqVisitante.trim(),
      puntosVisitante: Number(ptsVisitante),
      fecha: pFecha,
      logoLocal: logoLocal.trim() || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=100',
      logoVisitante: logoVisitante.trim() || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=100'
    };

    setPartidos([...partidos, nuevoPartido]);
    setEqLocal('');
    setPtsLocal('');
    setLogoLocal('');
    setEqVisitante('');
    setPtsVisitante('');
    setLogoVisitante('');
    setPFecha('');
    alert("¡Partido guardado con éxito! 🏁");
  };

  const handleDeleteJugador = (id: number) => {
    if (window.confirm("¿Eliminar este jugador?")) {
      setJugadores(jugadores.filter(j => j.id !== id));
      if (editandoId === id) handleCancelarEdicion();
    }
  };

  const handleDeletePartido = (id: number) => {
    if (window.confirm("¿Eliminar este registro de partido?")) {
      setPartidos(partidos.filter(p => p.id !== id));
    }
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
          { id: 'jugadores', label: '🏀 Jugadores' }
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
            <h4 className="text-xl font-bold text-[#05fcfe] mb-4 flex items-center gap-2">🗓️ Registrar Partido</h4>
            <form onSubmit={handleAddPartido} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local */}
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-3">
                  <h5 className="text-sm font-bold text-orange-400">🏠 EQUIPO LOCAL</h5>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre del Equipo:</label>
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

              <div>
                <label className="block text-xs text-gray-400 mb-1">Fecha del encuentro:</label>
                <input type="text" value={pFecha} onChange={(e) => setPFecha(e.target.value)} placeholder="Ej: 18 Jun 2026" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded transition-colors cursor-pointer shadow-md">
                Guardar Partido
              </button>
            </form>
          </div>
        )}

        {/* Listado de partidos */}
        {partidos.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">No hay registros de encuentros disponibles.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partidos.map((partido) => {
              const localGana = partido.puntosLocal > partido.puntosVisitante;
              const empate = partido.puntosLocal === partido.puntosVisitante;
              const imgLocal = partido.logoLocal || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=100';
              const imgVisitante = partido.logoVisitante || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=100';

              return (
                <div key={partido.id} className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex flex-col justify-between relative shadow-lg group hover:border-gray-700 transition-all">
                  {isAdmin && (
                    <button onClick={() => handleDeletePartido(partido.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer z-10">
                      🗑️ Borrar
                    </button>
                  )}
                  
                  <div className="text-center text-[11px] text-gray-500 font-semibold mb-3 uppercase tracking-wider">
                    📅 {partido.fecha}
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="w-5/12 flex items-center justify-end space-x-3 min-w-0">
                      <p className={`text-base font-bold truncate text-right ${localGana && !empate ? 'text-[#05fcfe]' : 'text-gray-400'}`}>
                        {partido.equipoLocal}
                      </p>
                      <img src={imgLocal} alt={partido.equipoLocal} className="w-9 h-9 rounded-full object-cover border border-gray-800 shrink-0 bg-gray-900" />
                    </div>

                    <div className="w-2/12 flex items-center justify-center bg-gray-900 py-1.5 px-3 rounded-lg border border-gray-800 text-lg font-black text-white tracking-widest min-w-[70px] mx-2">
                      <span className={localGana && !empate ? 'text-orange-400' : 'text-gray-300'}>{partido.puntosLocal}</span>
                      <span className="text-gray-600 mx-1">-</span>
                      <span className={!localGana && !empate ? 'text-orange-400' : 'text-gray-300'}>{partido.puntosVisitante}</span>
                    </div>

                    <div className="w-5/12 flex items-center justify-start space-x-3 min-w-0">
                      <img src={imgVisitante} alt={partido.equipoVisitante} className="w-9 h-9 rounded-full object-cover border border-gray-800 shrink-0 bg-gray-900" />
                      <p className={`text-base font-bold truncate text-left ${!localGana && !empate ? 'text-[#05fcfe]' : 'text-gray-400'}`}>
                        {partido.equipoVisitante}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between px-2 mt-2 text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
                    <span className="w-5/12 text-right pr-12">🏠 Local</span>
                    <span className="w-2/12"></span>
                    <span className="w-5/12 text-left pl-12">🚀 Visitante</span>
                  </div>

                  <button
                    onClick={() => handleToggleBoxscore(partido.id)}
                    className={`mt-3 w-full text-xs font-bold py-1.5 rounded transition-colors cursor-pointer ${
                      boxscoreAbierto === partido.id ? 'bg-[#05fcfe] text-gray-900' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                    }`}
                  >
                    📊 Boxscore
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== PANEL DE BOXSCORE ==================== */}
        {boxscorePartido && boxscoreEdit && (
          <div className="bg-gray-950 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
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

        {/* Grid de Jugadores */}
        {jugadores.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">No hay jugadores cargados en la plantilla.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {jugadores.map((jugador) => {
              const esModoEdicion = editandoId === jugador.id && editForm;

              return (
                <div key={jugador.id} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden relative flex flex-col shadow-lg group hover:border-gray-700 transition-all">
                  
                  {/* Botones de acción arriba a la derecha (Solo Admin) */}
                  {isAdmin && !esModoEdicion && (
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <button onClick={() => handleIniciarEdicion(jugador)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleDeleteJugador(jugador.id)} className="bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">
                        🗑️
                      </button>
                    </div>
                  )}

                  {/* VISTA EN MODO EDICIÓN */}
                  {esModoEdicion ? (
                    <form onSubmit={handleGuardarEdicion} className="p-4 space-y-3 flex-grow flex flex-col justify-between bg-gray-900">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-[#05fcfe] uppercase tracking-wider mb-2">✏️ Editar Tarjeta</h4>
                        
                        <div>
                          <label className="text-[10px] text-gray-400 block">Nombre:</label>
                          <input type="text" value={editForm.nombre} onChange={(e) => handleEditFormChange('nombre', e.target.value)} className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 block">Equipo:</label>
                          <input type="text" value={editForm.equipo} onChange={(e) => handleEditFormChange('equipo', e.target.value)} className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 block">Posición:</label>
                          <select value={editForm.posicion} onChange={(e) => handleEditFormChange('posicion', e.target.value)} className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none">
                            <option value="Base">Base (PG)</option>
                            <option value="Escolta">Escolta (SG)</option>
                            <option value="Alero">Alero (SF)</option>
                            <option value="Ala-Pívot">Ala-Pívot (PF)</option>
                            <option value="Pívot">Pívot (C)</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-1">
                          <div>
                            <label className="text-[10px] text-gray-400 block text-center">PTS:</label>
                            <input type="number" min="0" value={editForm.puntos} onChange={(e) => handleEditFormChange('puntos', Number(e.target.value))} className="w-full p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block text-center">AST:</label>
                            <input type="number" min="0" value={editForm.asistencias} onChange={(e) => handleEditFormChange('asistencias', Number(e.target.value))} className="w-full p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block text-center">REB:</label>
                            <input type="number" min="0" value={editForm.rebotes} onChange={(e) => handleEditFormChange('rebotes', Number(e.target.value))} className="w-full p-1 text-xs text-center rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 block">URL Foto:</label>
                          <input type="url" value={editForm.foto} onChange={(e) => handleEditFormChange('foto', e.target.value)} className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 rounded text-xs transition-colors cursor-pointer">
                          Guardar
                        </button>
                        <button type="button" onClick={handleCancelarEdicion} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 rounded text-xs transition-colors cursor-pointer">
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* VISTA NORMAL DE LA TARJETA */
                    <>
                      <div className="w-full h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                        <img src={jugador.foto} alt={jugador.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>

                      <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-white tracking-wide truncate">{jugador.nombre}</h4>
                          
                          <div className="flex justify-center items-center gap-1.5 mt-1">
                            <span className="bg-orange-950/40 border border-orange-800 text-orange-400 text-[9px] uppercase font-bold px-2 py-0.5 rounded truncate max-w-[120px]">
                              🛡️ {jugador.equipo}
                            </span>
                            <span className="bg-gray-900 border border-gray-700 text-[#05fcfe] text-[9px] uppercase font-bold px-2 py-0.5 rounded">
                              {jugador.posicion}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-gray-900/60 p-2 rounded-lg border border-gray-800/80 text-center text-xs">
                          <div>
                            <p className="text-gray-500 font-medium text-[10px] uppercase">PTS</p>
                            <p className="text-sm font-bold text-orange-400 mt-0.5">{jugador.puntos}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium text-[10px] uppercase">AST</p>
                            <p className="text-sm font-bold text-sky-400 mt-0.5">{jugador.asistencias}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium text-[10px] uppercase">REB</p>
                            <p className="text-sm font-bold text-emerald-400 mt-0.5">{jugador.rebotes}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
    </div>
  );
}