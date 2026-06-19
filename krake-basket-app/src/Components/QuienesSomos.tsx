
import React, { useState, useEffect } from 'react';
import { db } from '../Firebase';
import { doc, setDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

interface Sponsor {
  id: number;
  nombre: string;
  logoUrl: string;
}

interface QuienesSomosProps {
  data: {
    titulo: string;
    descripcion: string;
    fotoUrl: string;
  };
  sponsors: Sponsor[];
  isAdmin: boolean;
}

export default function QuienesSomos({ data, sponsors, isAdmin }: QuienesSomosProps) {
  // Estados para la sección Historia
  const [editMode, setEditMode] = useState(false);
  const [titulo, setTitulo] = useState(data.titulo);
  const [descripcion, setDescripcion] = useState(data.descripcion);
  const [fotoUrl, setFotoUrl] = useState(data.fotoUrl);

  // Estados para el formulario de Sponsors
  const [sponsorNombre, setSponsorNombre] = useState('');
  const [sponsorLogo, setSponsorLogo] = useState('');

  useEffect(() => {
    setTitulo(data.titulo);
    setDescripcion(data.descripcion);
    setFotoUrl(data.fotoUrl);
  }, [data]);

  // Guardar cambios en la Historia
  const handleSaveHistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'quienes', 'principal'), {
        titulo,
        descripcion,
        fotoUrl
      });
      setEditMode(false);
      alert("¡Sección 'Quiénes Somos' actualizada con éxito! 🏀");
    } catch (error) {
      console.error("Error al actualizar Quiénes Somos:", error);
      alert("No se pudieron guardar los cambios.");
    }
  };

  // Agregar nuevo Sponsor a Firebase
  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorNombre.trim() || !sponsorLogo.trim()) {
      alert("Por favor rellena todos los datos del patrocinador.");
      return;
    }

    try {
      await addDoc(collection(db, 'sponsors'), {
        id: Date.now(),
        nombre: sponsorNombre.trim(),
        logoUrl: sponsorLogo.trim()
      });
      alert("¡Sponsor añadido con éxito! 🤝");
      setSponsorNombre('');
      setSponsorLogo('');
    } catch (error) {
      console.error("Error al añadir sponsor:", error);
      alert("No se pudo guardar el sponsor.");
    }
  };

  // Eliminar Sponsor de Firebase
  const handleDeleteSponsor = async (id: number) => {
    if (window.confirm("¿Seguro que deseas remover a este sponsor de la página?")) {
      try {
        const q = query(collection(db, 'sponsors'), where("id", "==", id));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (docRef) => {
          await deleteDoc(docRef.ref);
        });
        alert("Sponsor eliminado.");
      } catch (error) {
        console.error("Error al borrar sponsor:", error);
      }
    }
  };

  return (
    <div className="space-y-12">
      {/* BOTÓN PARA EDITAR HISTORIA */}
      {isAdmin && (
        <div className="flex justify-end">
          <button 
            onClick={() => setEditMode(!editMode)} 
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded transition-all cursor-pointer shadow-md"
          >
            {editMode ? '❌ Cancelar Edición' : '⚙️ Editar Quiénes Somos'}
          </button>
        </div>
      )}

      {/* BLOQUE DE HISTORIA (MODO EDICIÓN O VISTA) */}
      {editMode && isAdmin ? (
        <form onSubmit={handleSaveHistoria} className="bg-gray-800 p-6 rounded-xl border border-sky-500 max-w-2xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-[#05fcfe] text-center">Editar Quiénes Somos</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Título de Sección:</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Descripción / Historia:</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={5} className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">URL de Imagen Lateral:</label>
            <input type="url" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
          </div>
          <button type="submit" className="w-full bg-[#05fcfe] text-black font-bold py-2 px-4 rounded hover:bg-cyan-400 transition-colors cursor-pointer">
            💾 Guardar Cambios en la Nube
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-950 p-6 md:p-12 rounded-2xl border border-gray-800 shadow-xl">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#05fcfe]">{data.titulo}</h2>
            <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
              {data.descripcion}
            </p>
          </div>
          <div className="w-full h-80 rounded-xl overflow-hidden shadow-lg border border-gray-800">
            <img src={data.fotoUrl} alt="Krack League staff" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* SECCIÓN MÓDULO DE SPONSORS / PATROCINADORES */}
      {/* ======================================================= */}
      <div className="space-y-6 pt-6 border-t border-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#05fcfe] inline-block border-b-2 border-[#05fcfe] pb-2">
            🤝 Nuestros Sponsors
          </h2>
          <p className="text-gray-400 text-sm mt-2">Las marcas oficiales que hacen posible la Krack League</p>
        </div>

        {/* PANEL ADMIN: AGREGAR SPONSOR */}
        {isAdmin && (
          <div className="bg-gray-900 p-6 rounded-xl border-2 border-dashed border-sky-500 max-w-xl mx-auto my-6">
            <h3 className="text-lg font-bold text-[#05fcfe] mb-3 text-center">➕ Cargar Nuevo Patrocinador</h3>
            <form onSubmit={handleAddSponsor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre de la Marca:</label>
                <input 
                  type="text" 
                  value={sponsorNombre} 
                  onChange={(e) => setSponsorNombre(e.target.value)} 
                  placeholder="Ej: Gatorade" 
                  className="w-full p-2 text-sm rounded bg-gray-800 border border-gray-700 text-white focus:outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">URL del Logo (Imagen):</label>
                <input 
                  type="url" 
                  value={sponsorLogo} 
                  onChange={(e) => setSponsorLogo(e.target.value)} 
                  placeholder="https://enlace-de-tu-imagen.png" 
                  className="w-full p-2 text-sm rounded bg-gray-800 border border-gray-700 text-white focus:outline-none" 
                  required 
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 rounded cursor-pointer transition-colors">
                Publicar Sponsor
              </button>
            </form>
          </div>
        )}

        {/* REJILLA DE EXHIBICIÓN DE SPONSORS */}
        {sponsors.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            Aún no se han añadido patrocinadores oficiales.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-center items-center">
            {sponsors.map((sp) => (
              <div 
                key={sp.id} 
                className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center relative h-36 group hover:border-[#05fcfe] transition-all shadow-md"
              >
                {isAdmin && (
                  <button 
                    onClick={() => handleDeleteSponsor(sp.id)} 
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-1.5 rounded z-10 cursor-pointer shadow-sm"
                  >
                    🗑️
                  </button>
                )}
                
                <div className="w-full h-20 flex items-center justify-center overflow-hidden">
                  <img 
                    src={sp.logoUrl} 
                    alt={sp.nombre} 
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium text-center truncate w-full">
                  {sp.nombre}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}