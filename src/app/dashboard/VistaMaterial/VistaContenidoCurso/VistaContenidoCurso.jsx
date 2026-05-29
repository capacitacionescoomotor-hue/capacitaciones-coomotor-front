'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ChevronDown, ChevronRight,
  BookOpen, Layers, Menu, X, PlayCircle, ClipboardCheck, FileText
} from 'lucide-react'
import { useLeccion } from '@/app/hooks/AgregarMaterial/Leccion/useLeccion'
import ContenidoLeccion from '../VistaLecciones/ContenidoLeccion'

/* ── Pantalla de bienvenida cuando no hay lección activa ── */
function BienvenidaCurso({ curso, totalLecciones, onSelectFirst }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-[#0266ff]/8 flex items-center justify-center mb-6">
        {curso?.imagen
          ? <img src={curso.imagen} alt={curso.titulo} className="w-20 h-20 rounded-2xl object-cover" />
          : <BookOpen size={36} className="text-[#0266ff]/40" />
        }
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{curso?.titulo}</h2>
      {curso?.descripcion && (
        <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">{curso.descripcion}</p>
      )}
      <div className="flex items-center gap-4 mb-8 text-sm text-gray-400">
        <span className="flex items-center gap-1.5 bg-blue-50 text-[#0266ff] font-semibold px-3 py-1.5 rounded-full">
          <Layers size={14} /> {curso?.modulos?.length || 0} módulos
        </span>
        <span className="flex items-center gap-1.5 bg-gray-50 text-gray-500 font-semibold px-3 py-1.5 rounded-full">
          <FileText size={14} /> {totalLecciones} lecciones
        </span>
      </div>
      <button
        onClick={onSelectFirst}
        className="bg-[#0266ff] hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-sm transition-all hover:shadow-md"
      >
        Comenzar primer lección →
      </button>
    </div>
  )
}

export default function VistaContenidoCurso({ curso, onBack }) {
  const { obtenerLeccionPorId } = useLeccion()

  const [modulosAbiertos, setModulosAbiertos] = useState({})
  const [leccionActiva, setLeccionActiva] = useState(null)
  const [leccionCargando, setLeccionCargando] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer

  const modulos = curso?.modulos || []
  const totalLecciones = modulos.reduce((a, m) => a + (m.lecciones?.length || 0), 0)

  // Abrir primer módulo y cargar primera lección al montar
  useEffect(() => {
    if (modulos.length > 0) {
      setModulosAbiertos({ [modulos[0].id]: true })
      const primeraLeccion = modulos[0]?.lecciones?.[0]
      if (primeraLeccion) cargarLeccion(primeraLeccion.id)
    }
  }, [curso?.id])

  const cargarLeccion = useCallback(async (leccionId) => {
    if (leccionCargando === leccionId) return
    setLeccionCargando(leccionId)
    const data = await obtenerLeccionPorId(leccionId)
    setLeccionCargando(null)
    if (data) {
      setLeccionActiva(data)
      setSidebarOpen(false) // cerrar drawer en móvil al seleccionar
    }
  }, [leccionCargando])

  const toggleModulo = (moduloId) => {
    setModulosAbiertos(prev => ({ ...prev, [moduloId]: !prev[moduloId] }))
  }

  const handlePrimeraLeccion = () => {
    const primeraLeccion = modulos[0]?.lecciones?.[0]
    if (primeraLeccion) cargarLeccion(primeraLeccion.id)
  }

  /* ── Sidebar content (reutilizado en desktop y drawer móvil) ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Cabecera del sidebar */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        <p className="text-xs font-bold text-[#0266ff] uppercase tracking-widest mb-0.5">Contenido del curso</p>
        <h2 className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2">{curso?.titulo}</h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{modulos.length} módulos</span>
          <span>·</span>
          <span>{totalLecciones} lecciones</span>
        </div>
      </div>

      {/* Acordeón de módulos */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {modulos.map((modulo, mi) => {
          const isOpen = !!modulosAbiertos[modulo.id]
          const lecciones = modulo.lecciones || []
          const tieneActiva = lecciones.some(l => l.id === leccionActiva?.id)

          return (
            <div key={modulo.id} className="mb-1">
              {/* Cabecera del módulo */}
              <button
                onClick={() => toggleModulo(modulo.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group ${
                  tieneActiva ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-colors ${
                  tieneActiva ? 'bg-[#0266ff] text-white' : 'bg-[#0266ff]/10 text-[#0266ff]'
                }`}>
                  {mi + 1}
                </span>
                <span className={`flex-1 text-xs font-bold truncate transition-colors ${
                  tieneActiva ? 'text-[#0266ff]' : 'text-gray-700 group-hover:text-[#0266ff]'
                }`}>
                  {modulo.titulo}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0 mr-0.5">{lecciones.length}</span>
                {isOpen
                  ? <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
                  : <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                }
              </button>

              {/* Lecciones del módulo */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5 pb-1.5 pt-0.5">
                      {lecciones.map((leccion, li) => {
                        const isActive = leccionActiva?.id === leccion.id
                        const isLoading = leccionCargando === leccion.id

                        return (
                          <button
                            key={leccion.id}
                            onClick={() => cargarLeccion(leccion.id)}
                            disabled={isLoading}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                              isActive
                                ? 'bg-[#0266ff] shadow-sm'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {isLoading
                                ? <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                                : li + 1
                              }
                            </span>
                            <span className={`text-xs font-medium flex-1 truncate leading-snug ${
                              isActive ? 'text-white' : 'text-gray-700'
                            }`}>
                              {leccion.titulo}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {modulos.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Layers size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs">Sin módulos aún.</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#0266ff] hover:text-blue-700 font-semibold transition-colors"
        >
          <ArrowLeft size={15} /> Cursos
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-semibold truncate max-w-xs">{curso?.titulo}</span>
        {leccionActiva && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 truncate max-w-[160px] hidden sm:inline">{leccionActiva.titulo}</span>
          </>
        )}
      </div>

      {/* ── Layout principal ── */}
      <div className="flex flex-1 gap-6 min-h-[calc(100vh-160px)] relative">

        {/* ── SIDEBAR DESKTOP (≥ lg) ── */}
        <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <SidebarContent />
        </aside>

        {/* ── DRAWER MÓVIL (< lg) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/40 z-40"
              />
              {/* Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                  <span className="font-bold text-gray-800 text-sm">Contenido del curso</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <SidebarContent />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── ÁREA DE CONTENIDO ── */}
        <main className="flex-1 min-w-0">
          {/* Botón ver lecciones en móvil */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 mb-5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#0266ff]/40 hover:text-[#0266ff] transition-all"
          >
            <Menu size={16} />
            Ver lecciones del curso
            {leccionActiva && (
              <span className="ml-auto text-xs text-gray-400 truncate max-w-[120px]">{leccionActiva.titulo}</span>
            )}
          </button>

          <AnimatePresence mode="wait">
            {leccionActiva ? (
              <motion.div
                key={leccionActiva.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ContenidoLeccion
                  leccion={leccionActiva}
                  onBack={() => setLeccionActiva(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="bienvenida"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BienvenidaCurso
                  curso={curso}
                  totalLecciones={totalLecciones}
                  onSelectFirst={handlePrimeraLeccion}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
