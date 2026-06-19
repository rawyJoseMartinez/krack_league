import  { useState } from 'react';

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
    { id: 'quienes', label: 'Quiénes Somos' }
  ];

  const handleNav = (id: string) => {
    setSection(id);
    setIsOpen(false);
  };

  return (
    <nav className="bg-black p-4 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex flex-col justify-between items-center relative">
        
        {/* Barra Superior - Siempre igual para PC y Celular */}
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-black tracking-wider text-[#05fcfe]">🏀 KRACK LEAGUE</h1>
          
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-[#05fcfe] focus:outline-none text-2xl cursor-pointer hover:text-black transition-colors px-2 py-1"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Menú Desplegable - Forzado vertical para todos los tamaños */}
        <div className={`${isOpen ? 'flex' : 'hidden'} flex-col w-full mt-4 space-y-2`}>
          <div className="border-t border-sky-500 pt-3 flex flex-col space-y-2">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-4 py-2 rounded-md font-semibold transition-all text-center cursor-pointer w-full ${
                  currentSection === link.id 
                    ? 'bg-black text-white-500 shadow' 
                    : 'hover:bg-gray-700 text-[#05fcfe]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </nav>
  );
}