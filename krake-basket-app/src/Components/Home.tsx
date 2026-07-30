import React, { useState, useEffect } from 'react';
import { db } from '../Firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { HomeData, HomeBanner } from '../types';

interface HomeProps {
  data: HomeData;
  isAdmin: boolean;
}

const ROTACION_MS = 6000;

export default function Home({ data, isAdmin }: HomeProps) {
  const [editMode, setEditMode] = useState(false);
  const [titulo, setTitulo] = useState(data.titulo);
  const [subtitulo, setSubtitulo] = useState(data.subtitulo);
  const [banners, setBanners] = useState<HomeBanner[]>(data.banners);

  const [nuevoTipo, setNuevoTipo] = useState<'imagen' | 'video'>('imagen');
  const [nuevaUrl, setNuevaUrl] = useState('');

  // Carrusel: pestaña activa en la vista pública
  const [slideActivo, setSlideActivo] = useState(0);

  useEffect(() => {
    if (editMode || data.banners.length <= 1) return;
    const timer = setInterval(() => {
      setSlideActivo(prev => (prev + 1) % data.banners.length);
    }, ROTACION_MS);
    return () => clearInterval(timer);
  }, [editMode, data.banners.length]);

  useEffect(() => {
    if (slideActivo >= data.banners.length) setSlideActivo(0);
  }, [data.banners.length, slideActivo]);

  // Cargar los datos vigentes de Firebase en el formulario recién al abrir la edición,
  // para no pisar lo que el admin está tipeando si llega una actualización en tiempo real.
  const handleToggleEdit = () => {
    if (!editMode) {
      setTitulo(data.titulo);
      setSubtitulo(data.subtitulo);
      setBanners(data.banners);
    }
    setEditMode(!editMode);
  };

  const handleAgregarBanner = () => {
    if (!nuevaUrl.trim()) {
      alert("Por favor ingresa una URL válida.");
      return;
    }
    setBanners([...banners, { id: Date.now(), tipo: nuevoTipo, url: nuevaUrl.trim() }]);
    setNuevaUrl('');
  };

  const handleQuitarBanner = (id: number) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (banners.length === 0) {
      alert("Agrega al menos una imagen o video antes de guardar.");
      return;
    }
    try {
      await setDoc(doc(db, 'home', 'principal'), {
        titulo,
        subtitulo,
        banners
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
            onClick={handleToggleEdit}
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

          <div className="border-t border-gray-700 pt-4 space-y-3">
            <label className="block text-sm font-semibold text-gray-300">Imágenes / Videos del Carrusel:</label>

            {banners.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">Todavía no agregaste ninguna imagen o video.</p>
            ) : (
              <div className="space-y-2">
                {banners.map((b, idx) => (
                  <div key={b.id} className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded p-2">
                    <span className="text-xs text-gray-500 w-5 text-center">{idx + 1}</span>
                    <span className="text-xs font-bold text-[#05fcfe] shrink-0">{b.tipo === 'video' ? '🎥' : '📸'}</span>
                    <span className="text-xs text-gray-300 truncate flex-1">{b.url}</span>
                    <button type="button" onClick={() => handleQuitarBanner(b.id)} className="text-red-500 hover:text-red-400 text-xs font-bold cursor-pointer shrink-0">✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-gray-900/60 border border-gray-800 rounded p-3 space-y-2">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                  <input type="radio" name="nuevoTipoBanner" checked={nuevoTipo === 'imagen'} onChange={() => setNuevoTipo('imagen')} className="accent-[#05fcfe]" />
                  📸 Imagen
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                  <input type="radio" name="nuevoTipoBanner" checked={nuevoTipo === 'video'} onChange={() => setNuevoTipo('video')} className="accent-[#05fcfe]" />
                  🎥 Video corto
                </label>
              </div>
              <div className="flex gap-2">
                <input type="url" value={nuevaUrl} onChange={(e) => setNuevaUrl(e.target.value)} placeholder="https://enlace-del-archivo.jpg" className="flex-1 p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" />
                <button type="button" onClick={handleAgregarBanner} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 rounded cursor-pointer shrink-0">➕ Agregar</button>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#05fcfe] text-black font-bold py-2 px-4 rounded hover:bg-cyan-400 transition-colors cursor-pointer">
            💾 Guardar Cambios en la Nube
          </button>
        </form>
      ) : (
        <div className="relative w-full rounded-2xl h-[60vh] overflow-hidden shadow-2xl border border-gray-800">
          {data.banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === slideActivo ? 'opacity-100' : 'opacity-0'}`}
            >
              {banner.tipo === 'video' ? (
                <video
                  src={banner.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.url})` }}
                />
              )}
              <div className="absolute inset-0 bg-black/60" />
            </div>
          ))}

          {data.banners.length === 0 && <div className="absolute inset-0 bg-gray-900" />}

          <div className="relative z-10 w-full h-full flex items-center justify-center">
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

          {data.banners.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
              {data.banners.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setSlideActivo(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${idx === slideActivo ? 'bg-[#05fcfe]' : 'bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Ir a la imagen ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
