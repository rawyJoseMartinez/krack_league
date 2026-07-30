import { useState, useEffect } from 'react';
import { db } from './Firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// Conexión de Firebase para el estado real de autenticación
import { auth } from './Firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Importaciones de tus componentes
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Galeria from './Components/Galeria';
import Estadisticas from './Components/Estadisticas';
import Tienda from './Components/Tienda';
import QuienesSomos from './Components/QuienesSomos';
import CalendarioCancha from './Components/CalendarioCancha';
import Login from './Components/Login';
import ReproductorFondo from './Components/ReproductorFondo';
import type { ArchivoGaleria, Sponsor, Jugador, Partido, Equipo, Boxscore, HomeData, QuienesData, Producto, ServicioIndumentaria } from './types';

function App() {
  const [currentSection, setCurrentSection] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Escuchar estado del Administrador
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsub();
  }, []);

  // Estados dinámicos de Firebase
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [quienesData, setQuienesData] = useState<QuienesData | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [contenido, setContenido] = useState<ArchivoGaleria[]>([]);

  // NUEVOS: Estados conectados a Firebase en tiempo real
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [boxscores, setBoxscores] = useState<Boxscore[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<ServicioIndumentaria[]>([]);

  // 1. Escuchar la sección HOME en Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'home', 'principal'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Migración: los documentos viejos guardaban un único "bannerUrl" en vez de "banners"
        const banners = Array.isArray(data.banners)
          ? data.banners
          : data.bannerUrl
            ? [{ id: 1, tipo: 'imagen', url: data.bannerUrl }]
            : [];
        setHomeData({
          titulo: data.titulo || '',
          subtitulo: data.subtitulo || '',
          banners
        } as HomeData);
      } else {
        setHomeData({
          titulo: "BIENVENIDOS A LA KRACK LEAGUE",
          subtitulo: "El torneo de básquetbol amateur más competitivo.",
          banners: [{ id: 1, tipo: 'imagen', url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200" }]
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Escuchar la sección QUIÉNES SOMOS en Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'quienes', 'principal'), (docSnap) => {
      if (docSnap.exists()) {
        setQuienesData(docSnap.data() as QuienesData);
      } else {
        setQuienesData({
          titulo: "Nuestra Historia",
          descripcion: "Krack League nació con la pasión de llevar el básquetbol amateur al siguiente nivel, ofreciendo estadísticas profesionales y una experiencia única para cada jugador.",
          fotoUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?q=80&w=1200"
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Escuchar la colección de SPONSORS de Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'sponsors'), (snapshot) => {
      const datosSponsors = snapshot.docs.map(doc => ({
        id: doc.data().id,
        nombre: doc.data().nombre,
        logoUrl: doc.data().logoUrl
      })) as Sponsor[];
      setSponsors(datosSponsors);
    });
    return () => unsubscribe();
  }, []);

  // 4. Escuchar la galería
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'galeria'), (snapshot) => {
      const datosGaleria = snapshot.docs.map(doc => ({
        id: doc.data().id,
        tipo: doc.data().tipo,
        url: doc.data().url,
        desc: doc.data().desc
      })) as ArchivoGaleria[];
      setContenido(datosGaleria);
    });
    return () => unsubscribe();
  }, []);

  // 5. NUEVO: Escuchar la colección de JUGADORES en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'jugadores'), (snapshot) => {
      const datosJugadores = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: Number(docSnap.id), // Usamos el ID del documento de Firebase
          nombre: data.nombre || '',
          posicion: data.posicion || 'Base',
          equipo: data.equipo || 'Krack League',
          puntos: Number(data.puntos || 0),
          asistencias: Number(data.asistencias || 0),
          rebotes: Number(data.rebotes || 0),
          foto: data.foto || ''
        };
      }) as Jugador[];
      setJugadores(datosJugadores);
    });
    return () => unsubscribe();
  }, []);

  // 6. NUEVO: Escuchar la colección de PARTIDOS en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'partidos'), (snapshot) => {
      const datosPartidos = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: Number(docSnap.id),
          equipoLocal: data.equipoLocal || '',
          puntosLocal: Number(data.puntosLocal || 0),
          equipoVisitante: data.equipoVisitante || '',
          puntosVisitante: Number(data.puntosVisitante || 0),
          fecha: data.fecha || '',
          logoLocal: data.logoLocal || '',
          logoVisitante: data.logoVisitante || ''
        };
      }) as Partido[];
      setPartidos(datosPartidos);
    });
    return () => unsubscribe();
  }, []);

  // 7. NUEVO: Escuchar la colección de EQUIPOS (clasificación) en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'equipos'), (snapshot) => {
      const datosEquipos = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: Number(docSnap.id),
          nombre: data.nombre || '',
          logo: data.logo || '',
          conferencia: data.conferencia || 'Este',
          victorias: Number(data.victorias || 0),
          derrotas: Number(data.derrotas || 0),
          pct: data.pct || '',
          gb: data.gb || '',
          conf: data.conf || '',
          div: data.div || '',
          racha: data.racha || ''
        };
      }) as Equipo[];
      setEquipos(datosEquipos);
    });
    return () => unsubscribe();
  }, []);

  // 8. NUEVO: Escuchar la colección de BOXSCORES (estadísticas por partido) en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'boxscores'), (snapshot) => {
      const datosBoxscores = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: Number(docSnap.id),
          partidoId: Number(data.partidoId ?? docSnap.id),
          jugadores: data.jugadores || []
        };
      }) as Boxscore[];
      setBoxscores(datosBoxscores);
    });
    return () => unsubscribe();
  }, []);

  // 9. NUEVO: Escuchar la colección de PRODUCTOS (tienda) en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'productos'), (snapshot) => {
      const datosProductos = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: Number(docSnap.id),
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          categoria: data.categoria || '',
          precio: Number(data.precio || 0),
          imagenUrl: data.imagenUrl || '',
          talles: Array.isArray(data.talles) ? data.talles : []
        };
      }) as Producto[];
      setProductos(datosProductos);
    });
    return () => unsubscribe();
  }, []);

  // 10. NUEVO: Escuchar la colección de SERVICIOS DE INDUMENTARIA (banner de la Tienda) en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'serviciosTienda'), (snapshot) => {
      const datosServicios = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: Number(docSnap.id),
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          imagenUrl: data.imagenUrl || ''
        };
      }) as ServicioIndumentaria[];
      setServicios(datosServicios);
    });
    return () => unsubscribe();
  }, []);

  // Funciones puente para que Estadisticas.tsx guarde en Firebase en lugar de setear el estado local
  const handleSetJugadoresInFirebase = async (nuevosJugadoresOrFn: Jugador[] | ((prev: Jugador[]) => Jugador[])) => {
    // Resolver si viene como función funcional (prev => ...) o array directo
    const resolvedJugadores = typeof nuevosJugadoresOrFn === 'function' ? nuevosJugadoresOrFn(jugadores) : nuevosJugadoresOrFn;
    
    // Si la lista está vacía (por ejemplo, al borrar el último jugador)
    if (resolvedJugadores.length === 0 && jugadores.length === 1) {
      // Nota: Para borrar registros individuales de manera óptima lo ideal es usar deleteDoc directamente en Estadisticas.tsx,
      // pero esto sirve como puente directo para mantener la compatibilidad con tu setJugadores actual.
    }
    
    // Guardar/actualizar de manera interactiva el cambio en Firebase mapeando los ids como strings de documentos
    for (const j of resolvedJugadores) {
      await setDoc(doc(db, 'jugadores', String(j.id)), j);
    }
  };

  const handleSetPartidosInFirebase = async (nuevosPartidosOrFn: Partido[] | ((prev: Partido[]) => Partido[])) => {
    const resolvedPartidos = typeof nuevosPartidosOrFn === 'function' ? nuevosPartidosOrFn(partidos) : nuevosPartidosOrFn;
    for (const p of resolvedPartidos) {
      await setDoc(doc(db, 'partidos', String(p.id)), p);
    }
  };

  const handleSetEquiposInFirebase = async (nuevosEquiposOrFn: Equipo[] | ((prev: Equipo[]) => Equipo[])) => {
    const resolvedEquipos = typeof nuevosEquiposOrFn === 'function' ? nuevosEquiposOrFn(equipos) : nuevosEquiposOrFn;
    for (const eq of resolvedEquipos) {
      await setDoc(doc(db, 'equipos', String(eq.id)), eq);
    }
  };

  const handleDeleteEquipoInFirebase = async (id: number) => {
    await deleteDoc(doc(db, 'equipos', String(id)));
  };

  const handleGuardarBoxscoreInFirebase = async (boxscore: Boxscore) => {
    await setDoc(doc(db, 'boxscores', String(boxscore.id)), boxscore);
  };

  const handleDeleteBoxscoreInFirebase = async (id: number) => {
    await deleteDoc(doc(db, 'boxscores', String(id)));
  };

  const handleGuardarProductoInFirebase = async (producto: Producto) => {
    await setDoc(doc(db, 'productos', String(producto.id)), producto);
  };

  const handleDeleteProductoInFirebase = async (id: number) => {
    await deleteDoc(doc(db, 'productos', String(id)));
  };

  const handleGuardarServicioInFirebase = async (servicio: ServicioIndumentaria) => {
    await setDoc(doc(db, 'serviciosTienda', String(servicio.id)), servicio);
  };

  const handleDeleteServicioInFirebase = async (id: number) => {
    await deleteDoc(doc(db, 'serviciosTienda', String(id)));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col justify-between">
      <div className="w-full">
        <Navbar setSection={setCurrentSection} currentSection={currentSection} />
        <main className="container mx-auto px-4 py-8">
          {currentSection === 'home' && homeData && <Home data={homeData} isAdmin={isAdmin} />}
          {currentSection === 'Multimedia' && <Galeria data={contenido} isAdmin={isAdmin} />}

          {currentSection === 'estadisticas' && (
            <Estadisticas
              jugadores={jugadores}
              // Pasamos funciones controladas que apunten a los datos en vez de alterar el estado local instantáneamente
              setJugadores={handleSetJugadoresInFirebase}
              partidos={partidos}
              setPartidos={handleSetPartidosInFirebase}
              equipos={equipos}
              setEquipos={handleSetEquiposInFirebase}
              onDeleteEquipo={handleDeleteEquipoInFirebase}
              boxscores={boxscores}
              onGuardarBoxscore={handleGuardarBoxscoreInFirebase}
              onDeleteBoxscore={handleDeleteBoxscoreInFirebase}
              isAdmin={isAdmin}
            />
          )}

          {currentSection === 'tienda' && (
            <Tienda
              productos={productos}
              onGuardarProducto={handleGuardarProductoInFirebase}
              onDeleteProducto={handleDeleteProductoInFirebase}
              servicios={servicios}
              onGuardarServicio={handleGuardarServicioInFirebase}
              onDeleteServicio={handleDeleteServicioInFirebase}
              isAdmin={isAdmin}
            />
          )}

          {currentSection === 'cancha' && <CalendarioCancha isAdmin={isAdmin} />}

          {currentSection === 'quienes' && quienesData && (
            <QuienesSomos data={quienesData} sponsors={sponsors} isAdmin={isAdmin} />
          )}
        </main>
      </div>
      
      <footer className="w-full bg-gray-950 border-t border-[#05fcfe] mt-12 py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-[#05fcfe]">🏆 KRACK LEAGUE</h3>
            <p className="text-sm text-gray-400 mt-1">El epicentro del básquetbol amateur.</p>
            <p className="text-xs text-gray-500 mt-4">&copy; 2026 Krack League. Todos los derechos reservados.</p>
            <div className="pt-3">
              <Login isAdmin={isAdmin} />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col items-center md:items-end text-center md:text-right max-w-sm">
            <h4 className="text-sm font-semibold text-gray-200">¿Necesitas más información?</h4>
            <p className="text-xs text-gray-400 mt-1 mb-3">Ponte en contacto con la administración para inscripciones o dudas.</p>
            <a 
              href="https://wa.me/5491159779643?text=Hola!%20Me%20gustaría%20obtener%20más%20información%20sobre%20la%20Krack%20League%20🏀" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-2 px-4 rounded-lg shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <span>Escríbenos por WhatsApp</span>
            </a>
          </div>
        </div>
      </footer>

      <ReproductorFondo />
    </div>
  );
}

export default App;