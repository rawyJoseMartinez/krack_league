import React, { useState } from 'react';

interface Jugador {
  id: number;
  nombre: string;
  posicion: string;
  puntos: number;
  asistencias: number;
  rebotes: number;
  foto: string;
}

interface Partido {
  id: number;
  equipoLocal: string;
  puntosLocal: number;
  equipoVisitante: string;
  puntosVisitante: number;
  fecha: string;
}

interface EstadisticasProps {
  jugadores: Jugador[];
  setJugadores: React.Dispatch<React.SetStateAction<Jugador[]>>;
  partidos: Partido[];
  setPartidos: React.Dispatch<React.SetStateAction<Partido[]>>;
  isAdmin: boolean;
}

export default function Estadisticas({ jugadores, setJugadores, partidos, setPartidos, isAdmin }: EstadisticasProps) {
  // Estados para el formulario de Jugadores
  const [jNombre, setJNombre] = useState('');
  const [jPosicion, setJPosicion] = useState('Base');
  const [jPuntos, setJPuntos] = useState(0);
  const [jAsistencias, setJAsistencias] = useState(0);
  const [jRebotes, setJRebotes] = useState(0);
  const [jFoto, setJFoto] = useState('');

  // Estados para el nuevo formulario de Partidos (Dos Equipos)
  const [eqLocal, setEqLocal] = useState('');
  const [ptsLocal, setPtsLocal] = useState('');
  const [eqVisitante, setEqVisitante] = useState('');
  const [ptsVisitante, setPtsVisitante] = useState('');
  const [pFecha, setPFecha] = useState('');

  // Guardar Jugador
  const handleAddJugador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jNombre.trim()) return;

    const nuevoJugador: Jugador = {
      id: Date.now(),
      nombre: jNombre.trim(),
      posicion: jPosicion,
      puntos: Number(jPuntos),
      asistencias: Number(jAsistencias),
      rebotes: Number(jRebotes),
      foto: jFoto.trim() || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=200'
    };

    setJugadores([...jugadores, nuevoJugador]);
    setJNombre('');
    setJPuntos(0);
    setJAsistencias(0);
    setJRebotes(0);
    setJFoto('');
    alert("¡Jugador registrado correctamente! 🏀");
  };

  // Guardar Partido con dos equipos
  const handleAddPartido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqLocal.trim() || !eqVisitante.trim() || !ptsLocal || !ptsVisitante || !pFecha) {
      alert("Por favor completa todos los campos del partido.");
      return;
    }

    const nuevoPartido: Partido = {
      id: Date.now(),
      equipoLocal: eqLocal.trim(),
      puntosLocal: Number(ptsLocal),
      equipoVisitante: eqVisitante.trim(),
      puntosVisitante: Number(ptsVisitante),
      fecha: pFecha
    };

    setPartidos([...partidos, nuevoPartido]);
    setEqLocal('');
    setPtsLocal('');
    setEqVisitante('');
    setPtsVisitante('');
    setPFecha('');
    alert("¡Partido guardado con éxito! 🏁");
  };

  // Eliminar elementos
  const handleDeleteJugador = (id: number) => {
    if (window.confirm("¿Eliminar este jugador?")) {
      setJugadores(jugadores.filter(j => j.id !== id));
    }
  };

  const handleDeletePartido = (id: number) => {
    if (window.confirm("¿Eliminar este registro de partido?")) {
      setPartidos(partidos.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-12">
      {/* TÍTULO DE LA SECCIÓN */}
      <div className="border-b-2 border-[#05fcfe] pb-2 text-center md:text-left">
        <h2 className="text-3xl text-[#05fcfe] font-bold">📊 Estadísticas y Resultados</h2>
      </div>

      {/* ==================== MÓDULO DE PARTIDOS ==================== */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-2">🗓️ Últimos Partidos</h3>

        {/* Formulario Administrador para Registrar Partido */}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-3xl mx-auto shadow-xl">
            <h4 className="text-xl font-bold text-[#05fcfe] mb-4 flex items-center gap-2">🗓️ Registrar Partido</h4>
            <form onSubmit={handleAddPartido} className="space-y-4">
              
              {/* Bloque Equipos */}
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
                </div>
              </div>

              {/* Fecha */}
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

        {/* Listado de partidos guardados */}
        {partidos.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">No hay registros de encuentros disponibles.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partidos.map((partido) => {
              const localGana = partido.puntosLocal > partido.puntosVisitante;
              const empate = partido.puntosLocal === partido.puntosVisitante;

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

                  {/* Visualización del marcador tipo Tablero */}
                  <div className="flex items-center justify-between px-2">
                    {/* Club Local */}
                    <div className="w-5/12 text-center space-y-1">
                      <p className={`text-base font-bold truncate ${localGana && !empate ? 'text-[#05fcfe]' : 'text-gray-400'}`}>
                        {partido.equipoLocal}
                      </p>
                      <span className="text-xs text-gray-500 block">🏠 Local</span>
                    </div>

                    {/* Marcador Central */}
                    <div className="w-2/12 flex items-center justify-center bg-gray-900 py-1.5 px-3 rounded-lg border border-gray-800 text-lg font-black text-white tracking-widest min-w-[70px]">
                      <span className={localGana && !empate ? 'text-orange-400' : 'text-gray-300'}>{partido.puntosLocal}</span>
                      <span className="text-gray-600 mx-1">-</span>
                      <span className={!localGana && !empate ? 'text-orange-400' : 'text-gray-300'}>{partido.puntosVisitante}</span>
                    </div>

                    {/* Club Visitante */}
                    <div className="w-5/12 text-center space-y-1">
                      <p className={`text-base font-bold truncate ${!localGana && !empate ? 'text-[#05fcfe]' : 'text-gray-400'}`}>
                        {partido.equipoVisitante}
                      </p>
                      <span className="text-xs text-gray-500 block">🚀 Visitante</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== MÓDULO DE JUGADORES ==================== */}
      <div className="space-y-6 pt-8 border-t border-gray-800">
        <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-2">🏀 Estadísticas de Jugadores</h3>

        {/* Formulario Administrador para Registrar Jugador */}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto shadow-xl">
            <h4 className="text-xl font-bold text-[#05fcfe] mb-4 text-center">➕ Añadir Perfil de Jugador</h4>
            <form onSubmit={handleAddJugador} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nombre Completo:</label>
                <input type="text" value={jNombre} onChange={(e) => setJNombre(e.target.value)} placeholder="Ej: LeBron James" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" required />
              </div>
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
              <div>
                <label className="block text-xs text-gray-400 mb-1">Asistencias Totales:</label>
                <input type="number" min="0" value={jAsistencias} onChange={(e) => setJAsistencias(Number(e.target.value))} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Rebotes Totales:</label>
                <input type="number" min="0" value={jRebotes} onChange={(e) => setJRebotes(Number(e.target.value))} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Enlace URL de la Foto del Jugador:</label>
                <input type="url" value={jFoto} onChange={(e) => setJFoto(e.target.value)} placeholder="https://enlace-de-imagen.jpg" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
              </div>
              <button type="submit" className="sm:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded cursor-pointer transition-colors mt-2">
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
            {jugadores.map((jugador) => (
              <div key={jugador.id} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden relative flex flex-col shadow-lg group hover:border-gray-700 transition-all">
                {isAdmin && (
                  <button onClick={() => handleDeleteJugador(jugador.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer z-10">
                    🗑️ Remover
                  </button>
                )}

                <div className="w-full h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img src={jugador.foto} alt={jugador.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>

                <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-white tracking-wide truncate">{jugador.nombre}</h4>
                    <span className="inline-block bg-gray-900 border border-gray-700 text-[#05fcfe] text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1">
                      {jugador.posicion}
                    </span>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}