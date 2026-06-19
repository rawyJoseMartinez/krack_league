import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../Firebase';

interface LoginProps {
  isAdmin: boolean;
}

export default function Login({ isAdmin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false); // Controla si el formulario está a la vista

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('¡Sesión iniciada como Administrador! 🏆');
      setIsOpen(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      alert('Error al iniciar sesión: Verifica tu correo o contraseña.');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('¿Quieres cerrar la sesión de Administrador?')) {
      await signOut(auth);
      alert('Sesión cerrada.');
    }
  };

  // Si ya eres Admin, mostramos un botón para cerrar sesión directamente
  if (isAdmin) {
    return (
      <button 
        onClick={handleLogout}
        className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
      >
        🔒 Cerrar Sesión Admin
      </button>
    );
  }

  return (
    <div className="text-center md:text-right">
      {!isOpen ? (
        /* Un botón sutil e inocente en el footer que solo tú sabes para qué sirve */
        <button 
          onClick={() => setIsOpen(true)}
          className="text-xs text-gray-600 hover:text-[#05fcfe] transition-colors cursor-pointer"
        >
          Panel de Control
        </button>
      ) : (
        /* Formulario flotante de login */
        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 p-4 rounded-xl mt-2 max-w-xs mx-auto md:ml-auto space-y-3 text-left">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-[#05fcfe] tracking-wide">INGRESO ADMIN</h4>
            <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
          </div>
          <input 
            type="email" 
            placeholder="Correo" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-1.5 bg-black text-xs rounded border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]"
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-1.5 bg-black text-xs rounded border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]"
            required
          />
          <button 
            type="submit"
            className="w-full bg-[#05fcfe] hover:bg-[#00c1c3] text-black font-bold text-xs py-1.5 rounded transition-colors cursor-pointer"
          >
            Entrar
          </button>
        </form>
      )}
    </div>
  );
}