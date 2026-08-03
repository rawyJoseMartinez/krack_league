import React, { useState } from 'react';
import { db } from '../Firebase';
import { collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import type { ArchivoGaleria } from '../types';
import logoKrack from '../assets/krack.png';

interface GaleriaProps {
  data: ArchivoGaleria[];
  avatarUrl: string;
  onGuardarAvatarUrl: (avatarUrl: string) => Promise<void>;
  isAdmin: boolean;
}

export default function Galeria({ data, avatarUrl, onGuardarAvatarUrl, isAdmin }: GaleriaProps) {
  const [newDesc, setNewDesc] = useState('');
  const [newTipo, setNewTipo] = useState<'foto' | 'video'>('foto');
  const [inputUrl, setInputUrl] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todas' | 'fotos' | 'videos'>('todas');
  const [activeItem, setActiveItem] = useState<ArchivoGaleria | null>(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  const handleGuardarAvatar = async () => {
    if (!avatarUrlInput.trim()) {
      alert("Pegá una URL de imagen antes de guardar.");
      return;
    }
    try {
      await onGuardarAvatarUrl(avatarUrlInput.trim());
      setAvatarUrlInput('');
      alert("¡Foto de perfil de Krack Estudio actualizada! 📸");
    } catch (error) {
      console.error("Error al actualizar el avatar de Krack Estudio:", error);
      alert("No se pudo guardar la imagen.");
    }
  };

  // Función robusta para extraer el ID de YouTube en CUALQUIER formato (watch, youtu.be, shorts o embed)
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !newDesc.trim()) {
      alert("Completá la URL y la descripción.");
      return;
    }

    try {
      let finalUrl = inputUrl.trim();
      if (newTipo === 'video') {
        const videoId = getYouTubeId(finalUrl);
        if (!videoId) {
          alert("No se pudo detectar un ID de video de YouTube válido.");
          return;
        }
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      const nuevoElemento = {
        id: Date.now(),
        tipo: newTipo,
        url: finalUrl,
        desc: newDesc.trim()
      };

      await addDoc(collection(db, 'galeria'), nuevoElemento);
      alert("¡Contenido publicado en Krack Estudio! 🚀");
      setNewDesc('');
      setInputUrl('');
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      alert("Hubo un problema al guardar. Intentá de nuevo.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Eliminar este contenido de Krack Estudio?")) {
      try {
        const q = query(collection(db, 'galeria'), where("id", "==", id));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docRef) => {
          await deleteDoc(docRef.ref);
        });
      } catch (error) {
        console.error("Error removing from Firebase:", error);
        alert("No se pudo eliminar el contenido.");
      }
    }
  };

  const datosFiltrados = data.filter(item => {
    if (filtroActivo === 'fotos') return item.tipo === 'foto';
    if (filtroActivo === 'videos') return item.tipo === 'video';
    return true;
  });

  const totalFotos = data.filter(i => i.tipo === 'foto').length;
  const totalReels = data.filter(i => i.tipo === 'video').length;

  return (
    <div className="space-y-6">
      {/* ==================== CABECERA ESTILO PERFIL ==================== */}
      <div className="flex items-center gap-4 sm:gap-6 pb-6 border-b border-gray-800">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#05fcfe] shrink-0 bg-black flex items-center justify-center">
          <img src={avatarUrl || logoKrack} alt="Krack Estudio" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">Krack Estudio</h2>
          <p className="text-sm text-gray-400 mt-0.5">Fotos y reels de la Krack League</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span><span className="font-bold text-white">{data.length}</span> publicaciones</span>
            <span><span className="font-bold text-white">{totalFotos}</span> fotos</span>
            <span><span className="font-bold text-white">{totalReels}</span> reels</span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex flex-col sm:flex-row gap-2 max-w-lg -mt-2 pb-2">
          <input
            type="url"
            value={avatarUrlInput}
            onChange={(e) => setAvatarUrlInput(e.target.value)}
            placeholder="URL de la foto de perfil de Krack Estudio"
            className="flex-1 p-2 text-xs rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]"
          />
          <button onClick={handleGuardarAvatar} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded cursor-pointer shrink-0">
            💾 Guardar Foto de Perfil
          </button>
        </div>
      )}

      {/* ==================== BARRA DE PESTAÑAS (ESTILO IG) ==================== */}
      <div className="flex justify-center gap-10 sm:gap-16 border-b border-gray-800">
        {([
          { id: 'todas', label: 'TODO', icon: '▦' },
          { id: 'fotos', label: 'FOTOS', icon: '🖼' },
          { id: 'videos', label: 'REELS', icon: '▶' }
        ] as { id: 'todas' | 'fotos' | 'videos'; label: string; icon: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setFiltroActivo(tab.id)}
            className={`flex items-center gap-1.5 pb-3 pt-1 text-xs font-bold tracking-widest border-t-2 -mt-px transition-colors cursor-pointer ${
              filtroActivo === tab.id ? 'border-[#05fcfe] text-[#05fcfe]' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== PANEL ADMIN: SUBIR CONTENIDO ==================== */}
      {isAdmin && (
        <div className="bg-gray-950 p-6 rounded-xl border-2 border-dashed border-sky-500 max-w-xl mx-auto my-6">
          <h3 className="text-xl font-bold text-[#05fcfe] mb-4 text-center">➕ Publicar en Krack Estudio</h3>
          <form onSubmit={handleAddMedia} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#05fcfe] mb-1">Tipo de contenido:</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-[#05fcfe] cursor-pointer">
                  <input type="radio" name="tipoMedia" checked={newTipo === 'foto'} onChange={() => setNewTipo('foto')} className="accent-orange-500" />
                  <span>📸 Foto</span>
                </label>
                <label className="flex items-center space-x-2 text-[#05fcfe] cursor-pointer">
                  <input type="radio" name="tipoMedia" checked={newTipo === 'video'} onChange={() => setNewTipo('video')} className="accent-orange-500" />
                  <span>▶ Reel</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#05fcfe] mb-1">URL del archivo:</label>
              <input type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="https://ejemplo.com/imagen.jpg" className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#05fcfe] mb-1">Descripción:</label>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Ej: Mejor jugada de la jornada" className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-orange-500" required />
            </div>
            <button type="submit" className="w-full bg-black hover:bg-gray-800 text-[#05fcfe] font-bold py-2 px-4 rounded transition-colors cursor-pointer border border-gray-700">Publicar</button>
          </form>
        </div>
      )}

      {/* ==================== GRILLA ESTILO INSTAGRAM ==================== */}
      {datosFiltrados.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Todavía no hay contenido en esta pestaña.</div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
          {datosFiltrados.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="relative aspect-square bg-black overflow-hidden cursor-pointer group"
            >
              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-700 text-white text-[10px] font-bold py-1 px-1.5 rounded shadow-md z-20 cursor-pointer"
                >
                  🗑️
                </button>
              )}

              {item.tipo === 'video' ? (
                <>
                  {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                    <img src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg`} alt={item.desc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" preload="metadata" />
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
                  {/* Insignia estilo "Reel" de Instagram */}
                  <span className="absolute top-1.5 left-1.5 text-white text-base drop-shadow-lg">▶</span>
                </>
              ) : (
                <img src={item.url} alt={item.desc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ==================== VISOR AMPLIADO ==================== */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setActiveItem(null)}>
          <button className="absolute top-4 right-4 bg-gray-900 text-white hover:text-[#05fcfe] font-bold text-xl p-3 rounded-full transition-colors cursor-pointer" onClick={() => setActiveItem(null)}>✕</button>
          <div className="w-full max-w-4xl max-h-[85vh] flex flex-col items-center bg-gray-900 rounded-xl overflow-hidden border border-gray-700 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {activeItem.tipo === 'foto' ? (
              <img src={activeItem.url} alt={activeItem.desc} className="max-w-full max-h-[75vh] object-contain rounded" />
            ) : (
              activeItem.url.includes('youtube.com') || activeItem.url.includes('youtu.be') ? (
                <iframe src={activeItem.url} title={activeItem.desc} className="w-full aspect-video max-h-[75vh] rounded" allowFullScreen />
              ) : (
                <video src={activeItem.url} controls autoPlay className="max-w-full max-h-[75vh] object-contain rounded" />
              )
            )}
            <div className="w-full text-center py-2 bg-gray-900">
              <p className="text-base font-bold text-[#05fcfe]">{activeItem.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
