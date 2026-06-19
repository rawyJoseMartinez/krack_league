
import React, { useState, useEffect } from 'react';
import { db } from '../Firebase';
import { doc, setDoc } from 'firebase/firestore';

interface HomeProps {
  data: {
    titulo: string;
    subtitulo: string;
    bannerUrl: string;
  };
  isAdmin: boolean;
}

export default function Home({ data, isAdmin }: HomeProps) {
  const [editMode, setEditMode] = useState(false);
  const [titulo, setTitulo] = useState(data.titulo);
  const [subtitulo, setSubtitulo] = useState(data.subtitulo);
  const [bannerUrl, setBannerUrl] = useState(data.bannerUrl);

  // Sincronizar el formulario si los datos de Firebase cambian
  useEffect(() => {
    setTitulo(data.titulo);
    setSubtitulo(data.subtitulo);
    setBannerUrl(data.bannerUrl);
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'home', 'principal'), {
        titulo,
        subtitulo,
        bannerUrl
      });
      setEditMode(false);
      alert("¡Inicio actualizado con éxito! 🏀");
    } catch (error) {
      console.error("Error al actualizar Inicio:", error);
      alert("No se pudieron guardar los cambios.");
    }
  };

  return (
    <div className="space-y-8">
      {isAdmin && (
        <div className="flex justify-end">
          <button 
            onClick={() => setEditMode(!editMode)} 
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded transition-all cursor-pointer shadow-md"
          >
            {editMode ? '❌ Cancelar Edición' : '⚙️ Editar Sección Inicio'}
          </button>
        </div>
      )}

      {editMode && isAdmin ? (
        <form onSubmit={handleSave} className="bg-gray-800 p-6 rounded-xl border border-sky-500 max-w-2xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-[#05fcfe] text-center">Editar Portada</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Título Principal:</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Subtítulo:</label>
            <textarea value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} rows={3} className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">URL de Imagen de Fondo (Banner):</label>
            <input type="url" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
          </div>
          <button type="submit" className="w-full bg-[#05fcfe] text-black font-bold py-2 px-4 rounded hover:bg-cyan-400 transition-colors cursor-pointer">
            💾 Guardar Cambios en la Nube
          </button>
        </form>
      ) : (
        <div 
          className="relative w-full rounded-2xl h-[60vh] flex items-center justify-center overflow-hidden bg-cover bg-center shadow-2xl border border-gray-800"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${data.bannerUrl})` }}
        >
          <div className="text-center px-4 max-w-3xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-extrawide text-white uppercase drop-shadow-lg">
              {data.titulo.split(' ').map((word, idx) => 
                word.toLowerCase().includes('krack') || word.toLowerCase().includes('league') 
                ? <span key={idx} className="text-[#05fcfe]">{word} </span> 
                : word + ' '
              )}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium drop-shadow-md max-w-2xl mx-auto">
              {data.subtitulo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}