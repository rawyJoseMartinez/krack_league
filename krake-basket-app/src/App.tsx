import { useState, useEffect } from 'react';
import { db } from './Firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

// Conexión de Firebase para el estado real de autenticación
import { auth } from './Firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Importaciones de tus componentes
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Galeria from './Components/Galeria';
import Estadisticas from './Components/Estadisticas';
import QuienesSomos from './Components/QuienesSomos';
import Login from './Components/Login';
import ReproductorFondo from './Components/ReproductorFondo';

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
}

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
  const [homeData, setHomeData] = useState<any>(null);
  const [quienesData, setQuienesData] = useState<any>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [contenido, setContenido] = useState<ArchivoGaleria[]>([]);

  // Estados para estadísticas (Mantienen localStorage temporalmente)
  const [jugadores, setJugadores] = useState<Jugador[]>(() => {
    const saved = localStorage.getItem('krake_jugadores');
    return saved ? JSON.parse(saved) : [];
  });

  const [partidos, setPartidos] = useState<Partido[]>(() => {
    const saved = localStorage.getItem('krake_partidos');
    return saved ? JSON.parse(saved) : [];
  });

  // 1. Escuchar la sección HOME en Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'home', 'principal'), (docSnap) => {
      if (docSnap.exists()) {
        setHomeData(docSnap.data());
      } else {
        setHomeData({
          titulo: "BIENVENIDOS A LA KRACK LEAGUE",
          subtitulo: "El torneo de básquetbol amateur más competitivo.",
          bannerUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200"
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Escuchar la sección QUIÉNES SOMOS en Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'quienes', 'principal'), (docSnap) => {
      if (docSnap.exists()) {
        setQuienesData(docSnap.data());
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

  useEffect(() => {
    localStorage.setItem('krake_jugadores', JSON.stringify(jugadores));
  }, [jugadores]);

  useEffect(() => {
    localStorage.setItem('krake_partidos', JSON.stringify(partidos));
  }, [partidos]);

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
              setJugadores={setJugadores} 
              partidos={partidos} 
              setPartidos={setPartidos} 
              isAdmin={isAdmin} 
            />
          )}
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

      {/* El reproductor ahora se renderiza perfectamente aquí dentro del contenedor principal */}
      <ReproductorFondo />
    </div>
  );
}

export default App;