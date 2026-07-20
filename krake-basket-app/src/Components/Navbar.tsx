import { useState } from 'react';
// IMPORTANTE: Importamos tu imagen desde la carpeta de assets
import logoKrack from '../assets/krack.png'; 

interface NavbarProps {
  setSection: (section: string) => void;
  currentSection: string;
}

export default function Navbar({ setSection, currentSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { id: 'home', label: 'Inicio' },
    { id: 'Multimedia', label: 'Multimedia' },
    { id: 'estadisticas', label: 'Estadísticas' },
    { id: 'cancha', label: 'Reservar Cancha' },
    { id: 'quienes', label: 'Quiénes Somos' }
  ];

  const handleNav = (id: string) => {
    setSection(id);
    setIsOpen(false);

    const targetElement = document.getElementById(id.toLowerCase());
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav 
      className="bg-black p-4 sticky top-0 z-50 shadow-lg"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Añadimos "relative" aquí para que el menú flotante se posicione respecto a la barra */}
      <div className="container mx-auto flex justify-between items-center relative">
        
        {/* Nombre de la liga modificado para incluir el logo del casco */}
        <h1 className="text-2xl font-black tracking-wider text-[#05fcfe] flex items-center gap-3">
          <img 
            src={logoKrack} 
            alt="Logo Krack League" 
            className="w-8 h-8 max-h-8 object-contain rounded-md border border-[#05fcfe]/20" 
          />
          KRACK LEAGUE
        </h1>
        
        {/* Botón Hamburguesa */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-[#05fcfe] focus:outline-none text-2xl cursor-pointer hover:text-white transition-colors px-2 py-1"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        {/* Menú Desplegable Flotante a un lado */}
        <div 
          className={`${isOpen ? 'flex' : 'hidden'} flex-col absolute top-full right-0 mt-2 w-56 bg-gray-950 border border-sky-500/40 rounded-xl shadow-2xl p-4 space-y-2`}
        >
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`px-4 py-2 rounded-md font-semibold transition-all text-center cursor-pointer w-full ${
                currentSection === link.id 
                  ? 'bg-black text-white-500 shadow border border-[#05fcfe]/30' 
                  : 'hover:bg-gray-800 text-[#05fcfe]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

      </div>
    </nav>
  );
}