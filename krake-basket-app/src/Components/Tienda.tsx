import React, { useState, useEffect } from 'react';
import type { Producto, ServicioIndumentaria } from '../types';

export interface TiendaProps {
  productos: Producto[];
  onGuardarProducto: (producto: Producto) => Promise<void>;
  onDeleteProducto: (id: number) => Promise<void>;
  servicios: ServicioIndumentaria[];
  onGuardarServicio: (servicio: ServicioIndumentaria) => Promise<void>;
  onDeleteServicio: (id: number) => Promise<void>;
  isAdmin: boolean;
}

const IMAGEN_PLACEHOLDER = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600';
const TALLES_PRESET = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORES_PRESET: { nombre: string; hex: string }[] = [
  { nombre: 'Negro', hex: '#111827' },
  { nombre: 'Blanco', hex: '#f9fafb' },
  { nombre: 'Gris', hex: '#9ca3af' },
  { nombre: 'Rojo', hex: '#dc2626' },
  { nombre: 'Azul', hex: '#2563eb' },
  { nombre: 'Verde', hex: '#16a34a' },
  { nombre: 'Amarillo', hex: '#eab308' },
  { nombre: 'Naranja', hex: '#ea580c' }
];
const WHATSAPP_NUMERO = '5491159779643';
const ROTACION_SERVICIOS_MS = 5000;

const formatPrecio = (precio: number) => `$${precio.toLocaleString('es-AR')}`;

const toggleEnLista = (lista: string[], valor: string) =>
  lista.includes(valor) ? lista.filter(v => v !== valor) : [...lista, valor];

export default function Tienda({ productos, onGuardarProducto, onDeleteProducto, servicios, onGuardarServicio, onDeleteServicio, isAdmin }: TiendaProps) {
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  // Estados del formulario de alta
  const [pNombre, setPNombre] = useState('');
  const [pDescripcion, setPDescripcion] = useState('');
  const [pCategoria, setPCategoria] = useState('');
  const [pPrecio, setPPrecio] = useState('');
  const [pImagenUrl, setPImagenUrl] = useState('');
  const [pTalles, setPTalles] = useState<string[]>([]);
  const [pColores, setPColores] = useState<string[]>([]);

  // Estados de edición
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Producto | null>(null);

  // Estado del modal de compra
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [talleElegido, setTalleElegido] = useState('');
  const [colorElegido, setColorElegido] = useState('');
  const [cantidad, setCantidad] = useState(1);

  // Estados del banner de Servicios de Indumentaria
  const [slideServicioActivo, setSlideServicioActivo] = useState(0);
  const [sNombre, setSNombre] = useState('');
  const [sDescripcion, setSDescripcion] = useState('');
  const [sImagenUrl, setSImagenUrl] = useState('');
  const [editandoServicioId, setEditandoServicioId] = useState<number | null>(null);
  const [editServicioForm, setEditServicioForm] = useState<ServicioIndumentaria | null>(null);

  useEffect(() => {
    if (servicios.length <= 1) return;
    const timer = setInterval(() => {
      setSlideServicioActivo(prev => (prev + 1) % servicios.length);
    }, ROTACION_SERVICIOS_MS);
    return () => clearInterval(timer);
  }, [servicios.length]);

  useEffect(() => {
    if (slideServicioActivo >= servicios.length) setSlideServicioActivo(0);
  }, [servicios.length, slideServicioActivo]);

  const categorias = ['Todas', ...Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))];
  const productosFiltrados = productos.filter(p => categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro);

  const handleAddProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pNombre.trim() || !pCategoria.trim() || !pPrecio) {
      alert('Por favor completa el nombre, la categoría y el precio del producto.');
      return;
    }

    const nuevoProducto: Producto = {
      id: Date.now(),
      nombre: pNombre.trim(),
      descripcion: pDescripcion.trim(),
      categoria: pCategoria.trim(),
      precio: Number(pPrecio),
      imagenUrl: pImagenUrl.trim() || IMAGEN_PLACEHOLDER,
      talles: pTalles,
      colores: pColores
    };

    try {
      await onGuardarProducto(nuevoProducto);
      setPNombre('');
      setPDescripcion('');
      setPCategoria('');
      setPPrecio('');
      setPImagenUrl('');
      setPTalles([]);
      setPColores([]);
      alert('¡Producto agregado a la tienda! 🛍️');
    } catch (err) {
      console.error('Error al guardar el producto en Firebase:', err);
      alert('No se pudo guardar el producto. Revisa la consola (F12) para ver el error de Firebase.');
    }
  };

  const handleIniciarEdicion = (producto: Producto) => {
    setEditandoId(producto.id);
    setEditForm({ ...producto });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setEditForm(null);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editForm.nombre.trim() || !editForm.categoria.trim()) {
      alert('El nombre y la categoría no pueden estar vacíos.');
      return;
    }

    try {
      await onGuardarProducto(editForm);
      setEditandoId(null);
      setEditForm(null);
    } catch (err) {
      console.error('Error al actualizar el producto en Firebase:', err);
      alert('No se pudo guardar la edición. Revisa la consola (F12) para ver el error de Firebase.');
    }
  };

  const handleEditFormChange = <K extends keyof Producto>(campo: K, valor: Producto[K]) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [campo]: valor });
  };

  const handleDeleteProducto = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto de la tienda?')) return;
    try {
      await onDeleteProducto(id);
      if (editandoId === id) handleCancelarEdicion();
    } catch (err) {
      console.error('Error al eliminar el producto en Firebase:', err);
      alert('No se pudo eliminar el producto. Revisa la consola (F12) para ver el error de Firebase.');
    }
  };

  const handleAddServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sNombre.trim()) {
      alert('Por favor completa el nombre del servicio.');
      return;
    }

    const nuevoServicio: ServicioIndumentaria = {
      id: Date.now(),
      nombre: sNombre.trim(),
      descripcion: sDescripcion.trim(),
      imagenUrl: sImagenUrl.trim() || IMAGEN_PLACEHOLDER
    };

    try {
      await onGuardarServicio(nuevoServicio);
      setSNombre('');
      setSDescripcion('');
      setSImagenUrl('');
    } catch (err) {
      console.error('Error al guardar el servicio en Firebase:', err);
      alert('No se pudo guardar el servicio. Revisa la consola (F12) para ver el error de Firebase.');
    }
  };

  const handleIniciarEdicionServicio = (servicio: ServicioIndumentaria) => {
    setEditandoServicioId(servicio.id);
    setEditServicioForm({ ...servicio });
  };

  const handleCancelarEdicionServicio = () => {
    setEditandoServicioId(null);
    setEditServicioForm(null);
  };

  const handleGuardarEdicionServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editServicioForm || !editServicioForm.nombre.trim()) {
      alert('El nombre del servicio no puede estar vacío.');
      return;
    }

    try {
      await onGuardarServicio(editServicioForm);
      setEditandoServicioId(null);
      setEditServicioForm(null);
    } catch (err) {
      console.error('Error al actualizar el servicio en Firebase:', err);
      alert('No se pudo guardar la edición. Revisa la consola (F12) para ver el error de Firebase.');
    }
  };

  const handleEditServicioFormChange = <K extends keyof ServicioIndumentaria>(campo: K, valor: ServicioIndumentaria[K]) => {
    if (!editServicioForm) return;
    setEditServicioForm({ ...editServicioForm, [campo]: valor });
  };

  const handleDeleteServicio = async (id: number) => {
    if (!window.confirm('¿Eliminar este servicio del banner?')) return;
    try {
      await onDeleteServicio(id);
      if (editandoServicioId === id) handleCancelarEdicionServicio();
    } catch (err) {
      console.error('Error al eliminar el servicio en Firebase:', err);
      alert('No se pudo eliminar el servicio. Revisa la consola (F12) para ver el error de Firebase.');
    }
  };

  const abrirCompra = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setTalleElegido(producto.talles[0] || '');
    setColorElegido(producto.colores[0] || '');
    setCantidad(1);
  };

  const cerrarCompra = () => {
    setProductoSeleccionado(null);
    setTalleElegido('');
    setColorElegido('');
    setCantidad(1);
  };

  const handleConfirmarCompra = async () => {
    if (!productoSeleccionado) return;
    const producto = productoSeleccionado;

    const lineas = [
      'Hola! Quiero comprar este producto:',
      '',
      `🛍️ ${producto.nombre}`,
      `💲 ${formatPrecio(producto.precio)}`,
      `📦 Cantidad: ${cantidad}`
    ];
    if (talleElegido) lineas.push(`📏 Talle: ${talleElegido}`);
    if (colorElegido) lineas.push(`🎨 Color: ${colorElegido}`);
    if (cantidad > 1) lineas.push(`💰 Total: ${formatPrecio(producto.precio * cantidad)}`);
    if (producto.descripcion) lineas.push('', producto.descripcion);

    // Primero intentamos compartir la foto real del producto (menú nativo "Compartir" con WhatsApp como destino).
    // Solo funciona en navegadores/celulares compatibles y si la imagen permite descargarse desde otro dominio (CORS).
    if (producto.imagenUrl && typeof navigator.share === 'function') {
      try {
        const respuesta = await fetch(producto.imagenUrl);
        if (respuesta.ok) {
          const blob = await respuesta.blob();
          const extension = blob.type.split('/')[1] || 'jpg';
          const archivo = new File([blob], `producto.${extension}`, { type: blob.type || 'image/jpeg' });
          if (navigator.canShare?.({ files: [archivo] })) {
            await navigator.share({ files: [archivo], text: lineas.join('\n'), title: producto.nombre });
            cerrarCompra();
            return;
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // El cliente cerró el panel de compartir sin elegir nada: no forzamos WhatsApp.
          return;
        }
        console.warn('No se pudo compartir la foto del producto como archivo, se usa el enlace de WhatsApp con la imagen como link.', err);
      }
    }

    // Alternativa: enlace de WhatsApp con el link de la imagen incluido en el texto (WhatsApp suele previsualizarlo).
    if (producto.imagenUrl) lineas.push('', `🖼️ ${producto.imagenUrl}`);
    const mensaje = encodeURIComponent(lineas.join('\n'));
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensaje}`, '_blank', 'noopener,noreferrer');
    cerrarCompra();
  };

  return (
    <div className="space-y-8">
      {/* TÍTULO DE LA SECCIÓN */}
      <div className="border-b-2 border-[#05fcfe] pb-2 text-center md:text-left">
        <h2 className="text-3xl text-[#05fcfe] font-bold">🛍️ Tienda Krack League</h2>
      </div>

      {/* ==================== BANNER DE SERVICIOS DE INDUMENTARIA ==================== */}
      {servicios.length > 0 && (
        <div className="relative w-full rounded-2xl h-56 md:h-72 overflow-hidden shadow-2xl border border-gray-800">
          {servicios.map((servicio, idx) => (
            <div
              key={servicio.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === slideServicioActivo ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${servicio.imagenUrl || IMAGEN_PLACEHOLDER})` }} />
              <div className="absolute inset-0 bg-black/60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase drop-shadow-lg">{servicio.nombre}</h3>
                {servicio.descripcion && (
                  <p className="text-sm md:text-base text-gray-200 mt-2 max-w-xl drop-shadow-md">{servicio.descripcion}</p>
                )}
              </div>
            </div>
          ))}

          {servicios.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
              {servicios.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSlideServicioActivo(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${idx === slideServicioActivo ? 'bg-[#05fcfe]' : 'bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Ir al servicio ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gestión del Banner de Servicios (Solo Admin) */}
      {isAdmin && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto shadow-xl space-y-4">
          <h4 className="text-xl font-bold text-[#05fcfe] text-center">🎯 Servicios de Indumentaria (Banner)</h4>

          {servicios.length === 0 ? (
            <p className="text-xs text-gray-500 text-center">Todavía no cargaste ningún servicio.</p>
          ) : (
            <div className="space-y-2">
              {servicios.map((servicio) => {
                const enEdicion = editandoServicioId === servicio.id && editServicioForm;

                if (enEdicion && editServicioForm) {
                  return (
                    <form key={servicio.id} onSubmit={handleGuardarEdicionServicio} className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-2">
                      <input type="text" value={editServicioForm.nombre} onChange={(e) => handleEditServicioFormChange('nombre', e.target.value)} placeholder="Nombre del servicio" className="w-full p-1.5 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                      <textarea value={editServicioForm.descripcion} onChange={(e) => handleEditServicioFormChange('descripcion', e.target.value)} placeholder="Descripción breve" rows={2} className="w-full p-1.5 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none resize-none" />
                      <input type="url" value={editServicioForm.imagenUrl} onChange={(e) => handleEditServicioFormChange('imagenUrl', e.target.value)} placeholder="URL de la imagen" className="w-full p-1.5 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 rounded text-xs cursor-pointer">Guardar</button>
                        <button type="button" onClick={handleCancelarEdicionServicio} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 rounded text-xs cursor-pointer">Cancelar</button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div key={servicio.id} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-2">
                    <img src={servicio.imagenUrl || IMAGEN_PLACEHOLDER} alt={servicio.nombre} className="w-12 h-12 rounded object-cover shrink-0 bg-gray-950" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{servicio.nombre}</p>
                      <p className="text-[11px] text-gray-400 truncate">{servicio.descripcion}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleIniciarEdicionServicio(servicio)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">✏️</button>
                      <button onClick={() => handleDeleteServicio(servicio.id)} className="bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={handleAddServicio} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 space-y-2">
            <input type="text" value={sNombre} onChange={(e) => setSNombre(e.target.value)} placeholder="Ej: Estampado personalizado" className="w-full p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
            <textarea value={sDescripcion} onChange={(e) => setSDescripcion(e.target.value)} placeholder="Descripción breve del servicio" rows={2} className="w-full p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none resize-none" />
            <input type="url" value={sImagenUrl} onChange={(e) => setSImagenUrl(e.target.value)} placeholder="https://enlace-de-imagen.jpg" className="w-full p-2 text-sm rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition-colors cursor-pointer text-sm">➕ Agregar Servicio</button>
          </form>
        </div>
      )}

      {/* Formulario Alta de Producto (Solo Admin) */}
      {isAdmin && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-2xl mx-auto shadow-xl">
          <h4 className="text-xl font-bold text-[#05fcfe] mb-4 text-center">➕ Agregar Producto</h4>
          <form onSubmit={handleAddProducto} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nombre del Producto:</label>
                <input type="text" value={pNombre} onChange={(e) => setPNombre(e.target.value)} placeholder="Ej: Camiseta Oficial" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Categoría:</label>
                <input type="text" list="categorias-tienda" value={pCategoria} onChange={(e) => setPCategoria(e.target.value)} placeholder="Ej: Camisetas" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#05fcfe]" required />
                <datalist id="categorias-tienda">
                  {categorias.filter(c => c !== 'Todas').map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Precio:</label>
                <input type="number" min="0" value={pPrecio} onChange={(e) => setPPrecio(e.target.value)} placeholder="Ej: 15000" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">URL de la Imagen:</label>
                <input type="url" value={pImagenUrl} onChange={(e) => setPImagenUrl(e.target.value)} placeholder="https://enlace-de-imagen.jpg" className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Descripción:</label>
              <textarea value={pDescripcion} onChange={(e) => setPDescripcion(e.target.value)} placeholder="Detalles del producto, material, etc." rows={2} className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-white focus:outline-none resize-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Talles disponibles:</label>
              <div className="flex flex-wrap gap-2">
                {TALLES_PRESET.map(talle => (
                  <button
                    key={talle}
                    type="button"
                    onClick={() => setPTalles(toggleEnLista(pTalles, talle))}
                    className={`w-11 h-9 text-xs font-bold rounded-md border transition-colors cursor-pointer ${
                      pTalles.includes(talle)
                        ? 'bg-[#05fcfe] text-gray-900 border-[#05fcfe]'
                        : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {talle}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Colores disponibles:</label>
              <div className="flex flex-wrap gap-2">
                {COLORES_PRESET.map(color => (
                  <button
                    key={color.nombre}
                    type="button"
                    onClick={() => setPColores(toggleEnLista(pColores, color.nombre))}
                    className={`flex items-center gap-1.5 pl-1.5 pr-3 h-9 text-xs font-bold rounded-md border transition-colors cursor-pointer ${
                      pColores.includes(color.nombre)
                        ? 'bg-[#05fcfe]/20 text-white border-[#05fcfe]'
                        : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: color.hex }} />
                    {color.nombre}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded transition-colors cursor-pointer shadow-md">
              Agregar Producto
            </button>
          </form>
        </div>
      )}

      {/* Filtro por Categoría */}
      {productos.length > 0 && (
        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg overflow-x-auto w-fit max-w-full mx-auto">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                categoriaFiltro === cat ? 'bg-[#05fcfe] text-gray-900' : 'text-gray-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Productos */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">No hay productos cargados en la tienda.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => {
            const esModoEdicion = editandoId === producto.id && editForm;

            if (esModoEdicion && editForm) {
              return (
                <form key={producto.id} onSubmit={handleGuardarEdicion} className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2 flex flex-col">
                  <h4 className="text-xs font-bold text-[#05fcfe] uppercase tracking-wider mb-1">✏️ Editar Producto</h4>
                  <input type="text" value={editForm.nombre} onChange={(e) => handleEditFormChange('nombre', e.target.value)} placeholder="Nombre" className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                  <input type="text" value={editForm.categoria} onChange={(e) => handleEditFormChange('categoria', e.target.value)} placeholder="Categoría" className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" required />
                  <input type="number" min="0" value={editForm.precio} onChange={(e) => handleEditFormChange('precio', Number(e.target.value))} placeholder="Precio" className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                  <input type="url" value={editForm.imagenUrl} onChange={(e) => handleEditFormChange('imagenUrl', e.target.value)} placeholder="URL Imagen" className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none" />
                  <textarea value={editForm.descripcion} onChange={(e) => handleEditFormChange('descripcion', e.target.value)} placeholder="Descripción" rows={2} className="w-full p-1 text-xs rounded bg-gray-950 border border-gray-700 text-white focus:outline-none resize-none" />
                  <div className="flex flex-wrap gap-1">
                    {TALLES_PRESET.map(talle => (
                      <button
                        key={talle}
                        type="button"
                        onClick={() => handleEditFormChange('talles', toggleEnLista(editForm.talles, talle))}
                        className={`w-9 h-7 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                          editForm.talles.includes(talle)
                            ? 'bg-[#05fcfe] text-gray-900 border-[#05fcfe]'
                            : 'bg-gray-950 text-gray-300 border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        {talle}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {COLORES_PRESET.map(color => (
                      <button
                        key={color.nombre}
                        type="button"
                        onClick={() => handleEditFormChange('colores', toggleEnLista(editForm.colores, color.nombre))}
                        className={`flex items-center gap-1 pl-1 pr-2 h-7 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                          editForm.colores.includes(color.nombre)
                            ? 'bg-[#05fcfe]/20 text-white border-[#05fcfe]'
                            : 'bg-gray-950 text-gray-300 border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: color.hex }} />
                        {color.nombre}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 rounded text-xs transition-colors cursor-pointer">Guardar</button>
                    <button type="button" onClick={handleCancelarEdicion} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 rounded text-xs transition-colors cursor-pointer">Cancelar</button>
                  </div>
                </form>
              );
            }

            return (
              <div key={producto.id} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden relative flex flex-col shadow-lg group hover:border-gray-700 transition-all">
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button onClick={() => handleIniciarEdicion(producto)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">✏️</button>
                    <button onClick={() => handleDeleteProducto(producto.id)} className="bg-red-600 hover:bg-red-700 text-white text-[10px] py-1 px-2 rounded cursor-pointer">🗑️</button>
                  </div>
                )}

                <div className="w-full h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img src={producto.imagenUrl || IMAGEN_PLACEHOLDER} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>

                <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="bg-gray-900 border border-gray-700 text-[#05fcfe] text-[9px] uppercase font-bold px-2 py-0.5 rounded">
                      {producto.categoria}
                    </span>
                    <h4 className="text-base font-bold text-white mt-2 truncate">{producto.nombre}</h4>
                    {producto.talles.length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-1">Talles: {producto.talles.join(' / ')}</p>
                    )}
                    {producto.colores.length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-1">Colores: {producto.colores.join(' / ')}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-black text-orange-400">{formatPrecio(producto.precio)}</span>
                    <button
                      onClick={() => abrirCompra(producto)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== MODAL DE COMPRA ==================== */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={cerrarCompra}>
          <div className="w-full max-w-sm bg-gray-950 border border-gray-800 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="w-full h-40 bg-gray-900 overflow-hidden">
              <img src={productoSeleccionado.imagenUrl || IMAGEN_PLACEHOLDER} alt={productoSeleccionado.nombre} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-lg font-bold text-white">{productoSeleccionado.nombre}</h4>
                <p className="text-orange-400 font-black text-xl mt-1">{formatPrecio(productoSeleccionado.precio)}</p>
                {cantidad > 1 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Total ({cantidad}): <span className="text-orange-400 font-bold">{formatPrecio(productoSeleccionado.precio * cantidad)}</span>
                  </p>
                )}
                {productoSeleccionado.descripcion && (
                  <p className="text-xs text-gray-400 mt-2">{productoSeleccionado.descripcion}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Cantidad:</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCantidad(c => Math.max(1, c - 1))}
                    className="w-9 h-9 rounded-md bg-gray-900 border border-gray-700 text-white font-bold cursor-pointer hover:border-gray-500 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-white font-bold text-base w-6 text-center">{cantidad}</span>
                  <button
                    type="button"
                    onClick={() => setCantidad(c => c + 1)}
                    className="w-9 h-9 rounded-md bg-gray-900 border border-gray-700 text-white font-bold cursor-pointer hover:border-gray-500 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {productoSeleccionado.talles.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Elegí tu talle:</label>
                  <div className="flex flex-wrap gap-2">
                    {productoSeleccionado.talles.map(talle => (
                      <button
                        key={talle}
                        type="button"
                        onClick={() => setTalleElegido(talle)}
                        className={`w-11 h-9 text-xs font-bold rounded-md border transition-colors cursor-pointer ${
                          talleElegido === talle
                            ? 'bg-[#05fcfe] text-gray-900 border-[#05fcfe]'
                            : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        {talle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {productoSeleccionado.colores.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Elegí tu color:</label>
                  <div className="flex flex-wrap gap-2">
                    {productoSeleccionado.colores.map(nombreColor => {
                      const hex = COLORES_PRESET.find(c => c.nombre === nombreColor)?.hex || '#9ca3af';
                      return (
                        <button
                          key={nombreColor}
                          type="button"
                          onClick={() => setColorElegido(nombreColor)}
                          className={`flex items-center gap-1.5 pl-1.5 pr-3 h-9 text-xs font-bold rounded-md border transition-colors cursor-pointer ${
                            colorElegido === nombreColor
                              ? 'bg-[#05fcfe]/20 text-white border-[#05fcfe]'
                              : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: hex }} />
                          {nombreColor}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={cerrarCompra} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold py-2 rounded-lg cursor-pointer transition-colors text-sm">
                  Cancelar
                </button>
                <button onClick={handleConfirmarCompra} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg cursor-pointer transition-colors text-sm">
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
