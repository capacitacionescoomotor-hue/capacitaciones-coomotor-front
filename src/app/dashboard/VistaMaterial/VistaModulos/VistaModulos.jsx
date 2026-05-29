'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, FileText, Layers } from 'lucide-react'
import { useModulo } from '@/app/hooks/AgregarMaterial/Modulo/useModulo'

export default function VistaModulos({ curso, onBack, onModuloSelect }) {
  const { obtenerModuloPorId } = useModulo()
  const [seleccionando, setSeleccionando] = useState(null)
  const modulos = curso?.modulos || []

  const handleSelectModulo = async (moduloId) => {
    setSeleccionando(moduloId)
    const data = await obtenerModuloPorId(moduloId)
    setSeleccionando(null)
    if (data) onModuloSelect(data)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#0266ff] hover:text-blue-700 font-medium transition-colors">
          <ArrowLeft size={15} /> Cursos
        </button>
        <span>/</span>
        <span className="text-gray-800 font-semibold truncate max-w-xs">{curso?.titulo}</span>
      </motion.div>

      {/* Header del curso */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
        <p className="text-xs font-semibold text-[#0266ff] uppercase tracking-widest mb-1">Módulos</p>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{curso?.titulo}</h1>
        {curso?.descripcion && <p className="text-gray-400 mt-1.5 text-sm max-w-2xl">{curso.descripcion}</p>}
        <div className="flex items-center gap-4 mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0266ff] bg-blue-50 px-3 py-1 rounded-full">
            <Layers size={12} /> {modulos.length} módulos
          </span>
        </div>
      </motion.div>

      {/* Grid módulos */}
      {modulos.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-gray-400">
          <Layers size={48} className="mx-auto mb-3 opacity-20" />
          <p>Este curso no tiene módulos aún.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {modulos.map((modulo, i) => (
              <motion.div
                key={modulo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -5 }}
                onClick={() => handleSelectModulo(modulo.id)}
                className="group relative bg-white border border-gray-100 hover:border-[#0266ff]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300"
              >
                {/* Número del módulo */}
                <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xs font-extrabold text-[#0266ff] shadow-sm">
                  {i + 1}
                </div>

                {/* Imagen */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  {modulo.imagen
                    ? <img src={modulo.imagen} alt={modulo.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center bg-blue-50"><Layers size={36} className="text-[#0266ff]/30" /></div>
                  }
                  <div className="absolute inset-0 bg-[#0266ff]/0 group-hover:bg-[#0266ff]/8 transition-all duration-300" />
                  {seleccionando === modulo.id && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[#0266ff] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h2 className="font-bold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-[#0266ff] transition-colors line-clamp-1">
                    {modulo.titulo}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                    {modulo.descripcion}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <FileText size={12} /> {modulo.lecciones?.length || 0} lecciones
                    </span>
                    <span className="flex items-center gap-1 text-[#0266ff] text-sm font-semibold group-hover:gap-2 transition-all">
                      Ver <ChevronRight size={15} />
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0266ff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
