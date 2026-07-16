import React, { useState } from 'react';
import { db } from '../Firebase';
import { collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import type { ArchivoGaleria } from '../types';

interface GaleriaProps {
  data: ArchivoGaleria[];
  isAdmin: boolean;
}

export default function Galeria({ data, isAdmin }: GaleriaProps) {
  const [newDesc, setNewDesc] = useState('');
  const [newTipo, setNewTipo] = useState<'foto' | 'video'>('foto');
  const [inputUrl, setInputUrl] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todas' | 'fotos' | 'videos'>('todas');
  const [activeItem, setActiveItem] = useState<ArchivoGaleria | null>(null);

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
      alert("Please provide a valid URL and description.");
      return;
    }

    try {
      let finalUrl = inputUrl.trim();
      if (newTipo === 'video') {
        const videoId = getYouTubeId(finalUrl);
        if (!videoId) {
          alert("Could not extract a valid YouTube video ID.");
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
      alert("Media successfully added to the cloud! 🚀");
      setNewDesc('');
      setInputUrl('');
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      alert("There was a problem saving the information. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to remove this media item from the internet?")) {
      try {
        const q = query(collection(db, 'galeria'), where("id", "==", id));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docRef) => {
          await deleteDoc(docRef.ref);
        });
        alert("Element removed successfully.");
      } catch (error) {
        console.error("Error removing from Firebase:", error);
        alert("Could not remove the element from the database.");
      }
    }
  };

  const datosFiltrados = data.filter(item => {
    if (filtroActivo === 'fotos') return item.tipo === 'foto';
    if (filtroActivo === 'videos') return item.tipo === 'video';
    return true; 
  });

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-[#05fcfe] pb-2 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl text-[#05fcfe] font-bold">🎬 Multimedia - Krake Basket App</h2>
        <div className="flex bg-gray-900 border border-gray-700 rounded-lg p-1 space-x-1">
          <button onClick={() => setFiltroActivo('todas')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors cursor-pointer ${filtroActivo === 'todas' ? 'bg-[#05fcfe] text-black' : 'text-gray-400 hover:text-white'}`}>📋 All</button>
          <button onClick={() => setFiltroActivo('fotos')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors cursor-pointer ${filtroActivo === 'fotos' ? 'bg-[#05fcfe] text-black' : 'text-gray-400 hover:text-white'}`}>📸 Photos</button>
          <button onClick={() => setFiltroActivo('videos')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors cursor-pointer ${filtroActivo === 'videos' ? 'bg-[#05fcfe] text-black' : 'text-gray-400 hover:text-white'}`}>🎥 Videos</button>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-black p-6 rounded-xl border-2 border-dashed border-sky-500 max-w-xl mx-auto my-6 block">
          <h3 className="text-xl font-bold text-[#05fcfe] mb-4 text-center">➕ Upload Multimedia via URL</h3>
          <form onSubmit={handleAddMedia} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#05fcfe] mb-1">Content type:</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-[#05fcfe] cursor-pointer">
                  <input type="radio" name="tipoMedia" checked={newTipo === 'foto'} onChange={() => setNewTipo('foto')} className="accent-orange-500" />
                  <span>Image / Photo</span>
                </label>
                <label className="flex items-center space-x-2 text-[#05fcfe] cursor-pointer">
                  <input type="radio" name="tipoMedia" checked={newTipo === 'video'} onChange={() => setNewTipo('video')} className="accent-orange-500" />
                  <span>Video / Reel</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#05fcfe] mb-1">File URL:</label>
              <input type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#05fcfe] mb-1">Description / Title:</label>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="E.g., Match Highlight" className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-orange-500" required />
            </div>
            <button type="submit" className="w-full bg-black hover:bg-gray-700 text-[#05fcfe] font-bold py-2 px-4 rounded transition-colors cursor-pointer">Publish Multimedia Content</button>
          </form>
        </div>
      )}

      {datosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No items to display in this section.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {datosFiltrados.map(item => (
            <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 relative flex flex-col justify-between">
              {isAdmin && (
                <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded shadow-md z-20 cursor-pointer">🗑️ Delete</button>
              )}
              <div onClick={() => setActiveItem(item)} className="w-full h-64 bg-black flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                {item.tipo === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-gray-950">
                    <span className="absolute text-4xl z-10 text-[#05fcfe] bg-black/50 p-3 rounded-full">▶</span>
                    {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                      <img src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg`} alt={item.desc} className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-contain opacity-60" preload="metadata" />
                    )}
                  </div>
                ) : (
                  <img src={item.url} alt={item.desc} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4 bg-gray-800">
                <p className="text-gray-300 text-center font-medium">{item.tipo === 'video' ? '🎥 ' : '📸 '}{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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