import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteField,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../Firebase';
import type { DiaCancha, EstadoFranja, SolicitudReserva } from '../types';

export interface CalendarioCanchaProps {
  isAdmin: boolean;
}

type EstadoVisible = 'disponible' | EstadoFranja;

interface Slot {
  hour: number;
  state: EstadoVisible;
  note?: string;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 a 21:00
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const STATE_LABEL: Record<EstadoVisible, string> = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  juego: 'Día de juego',
  cerrado: 'Cerrado',
};
const STATE_BORDER: Record<EstadoVisible, string> = {
  disponible: 'border-emerald-400',
  reservado: 'border-indigo-400',
  juego: 'border-[#05fcfe]',
  cerrado: 'border-gray-700',
};
const STATE_TEXT: Record<EstadoVisible, string> = {
  disponible: 'text-emerald-400',
  reservado: 'text-indigo-400',
  juego: 'text-[#05fcfe]',
  cerrado: 'text-gray-500',
};
const STATE_DOT: Record<EstadoVisible, string> = {
  disponible: 'bg-emerald-400',
  reservado: 'bg-indigo-400',
  juego: 'bg-[#05fcfe]',
  cerrado: 'bg-gray-600',
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function fmtHour(h: number) {
  return `${pad2(h)}:00`;
}
function dateKey(year: number, monthIdx: number, day: number) {
  return `${year}-${pad2(monthIdx + 1)}-${pad2(day)}`;
}
function daysInMonth(year: number, monthIdx: number) {
  return new Date(year, monthIdx + 1, 0).getDate();
}
function firstWeekday(year: number, monthIdx: number) {
  return new Date(year, monthIdx, 1).getDay();
}
function formatFechaLarga(fecha: string) {
  const [y, m, d] = fecha.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}
function formatFechaCorta(fecha: string) {
  const [, m, d] = fecha.split('-').map(Number);
  return `${d} ${MESES[m - 1].slice(0, 3)}`;
}

function resolveSlots(dia?: DiaCancha): Slot[] {
  return HOURS.map((hour) => {
    const franja = dia?.hours?.[hour];
    return franja ? { hour, state: franja.state, note: franja.note } : { hour, state: 'disponible' as const };
  });
}

function summarize(slots: Slot[]) {
  const counts = { disponible: 0, reservado: 0, juego: 0, cerrado: 0 };
  let gameNote = '';
  slots.forEach((s) => {
    counts[s.state]++;
    if (s.state === 'juego' && s.note) gameNote = `${s.note} · ${fmtHour(s.hour)}`;
  });
  let dominant: EstadoVisible = 'disponible';
  if (counts.juego > 0) dominant = 'juego';
  else if (counts.reservado > 0) dominant = 'reservado';
  else if (counts.cerrado === slots.length) dominant = 'cerrado';

  let tag: string;
  if (dominant === 'juego') tag = gameNote;
  else if (dominant === 'cerrado') tag = 'Cerrado';
  else if (counts.reservado > 0) tag = `${counts.reservado} reservado${counts.reservado > 1 ? 's' : ''}`;
  else tag = `${counts.disponible} libres`;

  return { counts, dominant, tag };
}

function whatsappLink(s: SolicitudReserva) {
  const primerNombre = s.nombre.trim().split(' ')[0];
  const msg = `Hola ${primerNombre}! 🏀 Tu reserva de la cancha en Krack League para el ${formatFechaLarga(s.fecha)} de ${fmtHour(s.hora)} a ${fmtHour(s.hora + 1)} fue aprobada. ¡Te esperamos!`;
  return `https://wa.me/${s.telefono}?text=${encodeURIComponent(msg)}`;
}

export default function CalendarioCancha({ isAdmin }: CalendarioCanchaProps) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [monthIdx, setMonthIdx] = useState(today.getMonth());
  const [dias, setDias] = useState<Record<string, DiaCancha>>({});
  const [solicitudes, setSolicitudes] = useState<SolicitudReserva[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openBookingHour, setOpenBookingHour] = useState<number | null>(null);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [misSolicitudes, setMisSolicitudes] = useState<Set<string>>(new Set());

  // Escuchar el calendario público (disponible / reservado / juego / cerrado)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'calendarioCancha'),
      (snap) => {
        const next: Record<string, DiaCancha> = {};
        snap.forEach((d) => { next[d.id] = d.data() as DiaCancha; });
        setDias(next);
      },
      (error) => console.error('No se pudo leer el calendario de la cancha (revisá las reglas de Firestore):', error)
    );
    return () => unsubscribe();
  }, []);

  // Escuchar las solicitudes pendientes (solo el admin puede leerlas)
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'solicitudes'), where('estado', '==', 'pendiente'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SolicitudReserva));
        lista.sort((a, b) => (a.fecha === b.fecha ? a.hora - b.hora : a.fecha.localeCompare(b.fecha)));
        setSolicitudes(lista);
      },
      (error) => console.error('No se pudieron leer las solicitudes pendientes (revisá el claim isAdmin y las reglas de Firestore):', error)
    );
    return () => unsubscribe();
  }, [isAdmin]);

  const monthCounts = useMemo(() => {
    const counts = { disponible: 0, reservado: 0, juego: 0, cerrado: 0 };
    const total = daysInMonth(year, monthIdx);
    for (let day = 1; day <= total; day++) {
      const { dominant } = summarize(resolveSlots(dias[dateKey(year, monthIdx, day)]));
      counts[dominant]++;
    }
    return counts;
  }, [dias, year, monthIdx]);

  function shiftMonth(delta: number) {
    setSelectedDate(null);
    let m = monthIdx + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonthIdx(m);
    setYear(y);
  }

  function openDay(fecha: string) {
    setSelectedDate(fecha);
    setOpenBookingHour(null);
    setBookingName('');
    setBookingPhone('');
  }

  function closeDay() {
    setSelectedDate(null);
    setOpenBookingHour(null);
  }

  async function setHourState(fecha: string, hora: number, estado: EstadoVisible) {
    try {
      const ref = doc(db, 'calendarioCancha', fecha);
      if (estado === 'disponible') {
        await setDoc(ref, { hours: { [hora]: deleteField() } }, { merge: true });
      } else {
        await setDoc(ref, { hours: { [hora]: { state: estado, note: '' } } }, { merge: true });
      }
    } catch {
      alert('No se pudo guardar el cambio. Verificá tu sesión de admin y las reglas de Firestore.');
    }
  }

  async function setHourNote(fecha: string, hora: number, estado: EstadoFranja, note: string) {
    try {
      await setDoc(doc(db, 'calendarioCancha', fecha), { hours: { [hora]: { state: estado, note } } }, { merge: true });
    } catch {
      alert('No se pudo guardar la nota. Verificá tu sesión de admin y las reglas de Firestore.');
    }
  }

  async function bulkSet(fecha: string, modo: 'abrir' | 'cerrado') {
    try {
      const ref = doc(db, 'calendarioCancha', fecha);
      if (modo === 'abrir') {
        await setDoc(ref, {});
      } else {
        const hours: Record<number, { state: EstadoFranja }> = {};
        HOURS.forEach((h) => { hours[h] = { state: 'cerrado' }; });
        await setDoc(ref, { hours });
      }
    } catch {
      alert('No se pudo guardar el cambio. Verificá tu sesión de admin y las reglas de Firestore.');
    }
  }

  async function aprobarSolicitud(s: SolicitudReserva) {
    try {
      await setDoc(doc(db, 'calendarioCancha', s.fecha), { hours: { [s.hora]: { state: 'reservado', note: s.nombre } } }, { merge: true });
      await updateDoc(doc(db, 'solicitudes', s.id), { estado: 'aprobada' });
      window.open(whatsappLink(s), '_blank');
    } catch {
      alert('No se pudo aprobar la solicitud. Verificá tu sesión de admin y las reglas de Firestore.');
    }
  }

  async function rechazarSolicitud(s: SolicitudReserva) {
    try {
      await updateDoc(doc(db, 'solicitudes', s.id), { estado: 'rechazada' });
    } catch {
      alert('No se pudo rechazar la solicitud. Verificá tu sesión de admin y las reglas de Firestore.');
    }
  }

  async function enviarSolicitud(fecha: string, hora: number) {
    const nombre = bookingName.trim();
    const soloDigitos = bookingPhone.replace(/\D/g, '');
    if (!nombre || soloDigitos.length < 8) {
      alert('Completá tu nombre y un teléfono válido para pedir la reserva.');
      return;
    }
    try {
      await addDoc(collection(db, 'solicitudes'), {
        fecha,
        hora,
        nombre,
        telefono: '549' + soloDigitos,
        estado: 'pendiente',
        creadoEn: serverTimestamp(),
      });
    } catch {
      alert('No se pudo enviar la solicitud. Probá de nuevo en un momento.');
      return;
    }
    setMisSolicitudes((prev) => new Set(prev).add(`${fecha}_${hora}`));
    setOpenBookingHour(null);
    setBookingName('');
    setBookingPhone('');
    alert('¡Solicitud enviada! Te confirmamos por WhatsApp cuando el admin la apruebe. 🏀');
  }

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-[#05fcfe] pb-2 text-center md:text-left">
        <h2 className="text-3xl text-[#05fcfe] font-bold">🏀 Calendario de Cancha</h2>
        <p className="text-sm text-gray-400 mt-1">
          {isAdmin
            ? 'Gestioná horarios, días de juego y aprobá las solicitudes de reserva.'
            : 'Elegí un día para ver los horarios disponibles y pedir tu reserva.'}
        </p>
      </div>

      {isAdmin && solicitudes.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
            📋 Solicitudes pendientes ({solicitudes.length})
          </h3>
          <div className="space-y-2">
            {solicitudes.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 bg-gray-950 border border-gray-800 rounded-lg p-3">
                <span className="text-xs font-bold text-gray-200 min-w-[90px]">
                  {formatFechaCorta(s.fecha)} · {fmtHour(s.hora)}
                </span>
                <span className="text-sm text-white font-semibold">{s.nombre}</span>
                <span className="text-xs text-gray-500">{s.telefono}</span>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => aprobarSolicitud(s)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded cursor-pointer">
                    Aprobar
                  </button>
                  <button onClick={() => rechazarSolicitud(s)} className="bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded cursor-pointer">
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => shiftMonth(-1)} aria-label="Mes anterior" className="w-8 h-8 rounded bg-gray-900 border border-gray-700 text-white hover:border-[#05fcfe] hover:text-[#05fcfe] cursor-pointer">‹</button>
            <div className="text-lg font-bold capitalize min-w-[160px] text-center">{MESES[monthIdx]} {year}</div>
            <button onClick={() => shiftMonth(1)} aria-label="Mes siguiente" className="w-8 h-8 rounded bg-gray-900 border border-gray-700 text-white hover:border-[#05fcfe] hover:text-[#05fcfe] cursor-pointer">›</button>
          </div>
          <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
            <span><b className="text-white">{monthCounts.disponible}</b> libres</span>
            <span><b className="text-white">{monthCounts.reservado}</b> reservados</span>
            <span><b className="text-white">{monthCounts.juego}</b> juegos</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider pb-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday(year, monthIdx) }).map((_, i) => <div key={`pad-${i}`} />)}
          {Array.from({ length: daysInMonth(year, monthIdx) }).map((_, i) => {
            const day = i + 1;
            const fecha = dateKey(year, monthIdx, day);
            const slots = resolveSlots(dias[fecha]);
            const { dominant, tag } = summarize(slots);
            const hasPending = isAdmin && solicitudes.some((s) => s.fecha === fecha);
            const isToday = fecha === todayKey;
            const isSelected = selectedDate === fecha;

            return (
              <button
                key={fecha}
                onClick={() => openDay(fecha)}
                className={`relative text-left min-h-[74px] rounded-lg border p-1.5 flex flex-col justify-between gap-1 bg-gray-900 hover:border-[#05fcfe] hover:-translate-y-0.5 transition-all cursor-pointer ${STATE_BORDER[dominant]} ${isSelected ? 'ring-2 ring-[#05fcfe] -translate-y-0.5' : ''} ${isToday ? 'ring-1 ring-white/70' : ''}`}
              >
                {hasPending && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />}
                <span className="text-xs font-bold text-gray-300 tabular-nums">{day}</span>
                <span className="flex gap-px h-2.5">
                  {slots.map((s) => (
                    <span
                      key={s.hour}
                      title={`${fmtHour(s.hour)} — ${s.note || STATE_LABEL[s.state]}`}
                      className={`flex-1 rounded-[1px] ${STATE_DOT[s.state]} ${s.state === 'cerrado' || s.state === 'disponible' ? 'opacity-60' : 'opacity-95'}`}
                    />
                  ))}
                </span>
                <span className={`text-[9px] font-bold truncate ${STATE_TEXT[dominant]}`}>{tag}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-800 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />Disponible</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />Reservado</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#05fcfe]" />Día de juego</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-600" />Cerrado</span>
          {isAdmin && (
            <span className="flex items-center gap-1.5 md:ml-auto"><span className="w-2 h-2 rounded-full bg-amber-400" />Con solicitud pendiente</span>
          )}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-gray-950 border border-[#05fcfe]/50 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold capitalize">{formatFechaLarga(selectedDate)}</h3>
            <button onClick={closeDay} className="text-gray-500 hover:text-white text-sm font-bold cursor-pointer">Cerrar ✕</button>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => bulkSet(selectedDate, 'abrir')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-bold py-1.5 px-3 rounded-full cursor-pointer">
                Abrir todo el día
              </button>
              <button onClick={() => bulkSet(selectedDate, 'cerrado')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-bold py-1.5 px-3 rounded-full cursor-pointer">
                Cerrar todo el día
              </button>
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto border border-gray-800 rounded-lg divide-y divide-gray-800">
            {resolveSlots(dias[selectedDate]).map((slot) => (
              isAdmin ? (
                <div key={slot.hour} className="flex items-center gap-3 p-2.5 flex-wrap">
                  <span className="text-xs font-bold text-gray-400 tabular-nums w-24">{fmtHour(slot.hour)}–{fmtHour(slot.hour + 1)}</span>
                  <div className="flex gap-1.5">
                    {(['disponible', 'reservado', 'juego', 'cerrado'] as const).map((st) => (
                      <button
                        key={st}
                        title={STATE_LABEL[st]}
                        onClick={() => setHourState(selectedDate, slot.hour, st)}
                        className={`w-7 h-7 rounded-md border flex items-center justify-center cursor-pointer ${slot.state === st ? `${STATE_BORDER[st]} bg-gray-800` : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${STATE_DOT[st]}`} />
                      </button>
                    ))}
                  </div>
                  {(slot.state === 'reservado' || slot.state === 'juego') && (
                    <input
                      type="text"
                      defaultValue={slot.note ?? ''}
                      placeholder={slot.state === 'juego' ? 'Rival, ej. Halcones' : 'Quién reservó'}
                      onBlur={(e) => setHourNote(selectedDate, slot.hour, slot.state as EstadoFranja, e.target.value)}
                      className="flex-1 min-w-[140px] bg-black text-xs rounded border border-gray-700 text-white px-2 py-1.5 focus:outline-none focus:border-[#05fcfe]"
                    />
                  )}
                </div>
              ) : (
                <div key={slot.hour} className="flex items-center gap-3 p-2.5 flex-wrap">
                  <span className="text-xs font-bold text-gray-400 tabular-nums w-24">{fmtHour(slot.hour)}–{fmtHour(slot.hour + 1)}</span>
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${STATE_TEXT[slot.state]}`}>
                    <span className={`w-2 h-2 rounded-full ${STATE_DOT[slot.state]}`} />
                    {STATE_LABEL[slot.state]}
                    {slot.note && <span className="text-gray-500 font-medium">— {slot.note}</span>}
                  </span>

                  {slot.state === 'disponible' && !misSolicitudes.has(`${selectedDate}_${slot.hour}`) && (
                    <button
                      onClick={() => setOpenBookingHour(openBookingHour === slot.hour ? null : slot.hour)}
                      className="ml-auto bg-emerald-600/20 hover:bg-emerald-600 hover:text-black border border-emerald-500 text-emerald-400 text-xs font-bold py-1 px-3 rounded-full cursor-pointer transition-colors"
                    >
                      {openBookingHour === slot.hour ? 'Cancelar' : 'Reservar'}
                    </button>
                  )}
                  {misSolicitudes.has(`${selectedDate}_${slot.hour}`) && (
                    <span className="ml-auto text-[11px] text-amber-400 font-bold">Tu solicitud está pendiente de aprobación</span>
                  )}

                  {openBookingHour === slot.hour && (
                    <div className="w-full flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-800">
                      <input
                        type="text"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="Tu nombre"
                        className="flex-1 min-w-[120px] bg-black text-xs rounded border border-gray-700 text-white px-2 py-1.5 focus:outline-none focus:border-[#05fcfe]"
                      />
                      <div className="flex items-center gap-1 flex-1 min-w-[180px]">
                        <span className="text-xs text-gray-500 bg-black border border-gray-700 rounded px-2 py-1.5">+54 9</span>
                        <input
                          type="tel"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="11 2233 4455"
                          className="flex-1 bg-black text-xs rounded border border-gray-700 text-white px-2 py-1.5 focus:outline-none focus:border-[#05fcfe]"
                        />
                      </div>
                      <button
                        onClick={() => enviarSolicitud(selectedDate, slot.hour)}
                        className="bg-[#05fcfe] hover:bg-[#00c1c3] text-black text-xs font-bold py-1.5 px-4 rounded cursor-pointer"
                      >
                        Enviar solicitud
                      </button>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
