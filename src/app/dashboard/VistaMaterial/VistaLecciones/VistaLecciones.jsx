'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileText, PlayCircle, ClipboardCheck, ChevronRight } from 'lucide-react'
import { useLeccion } from '@/app/hooks/AgregarMaterial/Leccion/useLeccion'

export default function VistaLecciones({ modulo, onBack, onLeccionSelect }) {
  const { obtenerLeccionPorId } = useLeccion()
  const [seleccionando, setSeleccionando] = useState(null)
  const [leccionesCompletas, setLeccionesCompletas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      if (!modulo?.lecciones?.length) { setCargando(false); return }
      const completas = await Promise.all(
        modulo.lecciones.map(async l => {
          const data = await obtenerLeccionPorId(l.id)
          return data || l
        })
      )
      setLeccionesCompletas(completas)
      setCargando(false)
    }
    cargar()
  }, [modulo])

  const handleSelect = async (leccionId) => {
    setSeleccionando(leccionId)
    const data = await obtenerLeccionPorId(leccionId)
    setSeleccionando(null)
    if (data) onLeccionSelect(data)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#0266ff] hover:text-blue-700 font-medium transition-colors">
          <ArrowLeft size={15} /> Módulos
        </button>
        <span>/</span>
        <span className="text-gray-800 font-semibold truncate max-w-xs">{modulo?.titulo}</span>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
        <p className="text-xs font-semibold text-[#0266ff] uppercase tracking-widest mb-1">Lecciones</p>
        <h1 className="text-3xl font-extrabold text-gray-900">{modulo?.titulo}</h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0266ff] bg-blue-50 px-3 py-1 rounded-full">
            <FileText size={12} /> {leccionesCompletas.length} lecciones
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
            <ClipboardCheck size={12} /> {leccionesCompletas.filter(l => l.quiz).length} con evaluación
          </span>
        </div>
      </motion.div>

      {/* Lista de lecciones */}
      {cargando ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse flex gap-4 p-4 rounded-2xl border border-gray-100">
              <div className="w-24 h-20 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : leccionesCompletas.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-20" />
          <p>No hay lecciones en este módulo.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {leccionesCompletas.map((leccion, i) => {
              const tieneQuiz = !!leccion.quiz
              const tieneVideo = !!leccion.videoUrl
              const estaSeleccionando = seleccionando === leccion.id

              return (
                <motion.div
                  key={leccion.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: 4 }}
                  onClick={() => handleSelect(leccion.id)}
                  className="group flex items-center gap-4 p-4 bg-white border border-gray-100 hover:border-[#0266ff]/30 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  {/* Número */}
                  <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-[#0266ff] flex items-center justify-center text-xs font-extrabold text-[#0266ff] group-hover:text-white transition-all duration-200 flex-shrink-0">
                    {i + 1}
                  </div>

                  {/* Imagen */}
                  <div className="relative w-24 h-18 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {leccion.imagen
                      ? <img src={leccion.imagen} alt={leccion.titulo} className="w-24 h-20 object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-24 h-20 flex items-center justify-center bg-blue-50"><FileText size={22} className="text-[#0266ff]/40" /></div>
                    }
                    {estaSeleccionando && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#0266ff] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0266ff] transition-colors truncate">
                      {leccion.titulo}
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{leccion.descripcion}</p>
                    {/* Badges */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {tieneVideo && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          <PlayCircle size={11} /> Video
                        </span>
                      )}
                      {tieneQuiz ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <ClipboardCheck size={11} /> Evaluación
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          Sin evaluación
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flecha */}
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-[#0266ff] flex-shrink-0 transition-colors" />
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
