import { useState, useRef, useEffect } from 'react';

export default function ReproductorFondo() {
  const [reproduciendo, setReproduciendo] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Configuraciones iniciales al cargar la aplicación
  useEffect(() => {
    if (audioRef.current) {
      // Definimos un volumen inicial moderado (0.3 = 30%) para no saturar al usuario
      audioRef.current.volume = 0.3;
    }
  }, []);

  const toggleMusica = () => {
    if (!audioRef.current) return;

    if (reproduciendo) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.log(
          "La reproducción automática está protegida por el navegador hasta recibir interacción del usuario:",
          error
        );
      });
    }
    setReproduciendo(!reproduciendo);
  };

  return (
    <>
      {/* Elemento de audio nativo de HTML5 oculto */}
      <audio 
        ref={audioRef} 
        src="/musica.mp3" // Cambia esto por el nombre exacto de tu archivo en la carpeta /public
        loop 
      />

      {/* BOTÓN FLOTANTE OPTIMIZADO PARA MÓVILES (Fijo en pantalla) */}
      <button
        onClick={toggleMusica}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-110 active:scale-95 border-2 border-[#05fcfe] cursor-pointer"
        title={reproduciendo ? "Pausar Música" : "Reproducir Música"}
        aria-label="Control de audio de fondo"
      >
        {reproduciendo ? (
          // Icono dinámico vibrando levemente cuando suena música
          <span className="text-2xl animate-pulse select-none">🔊</span>
        ) : (
          // Icono estático de música pausada
          <span className="text-2xl opacity-70 select-none">🔈</span>
        )}
      </button>
    </>
  );
}