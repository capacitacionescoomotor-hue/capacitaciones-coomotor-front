'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search, ChevronRight, Layers } from 'lucide-react'
import { useCurso } from '@/app/hooks/AgregarMaterial/Curso/useCurso'

export default function VistaCursos({ onCursoSelect }) {
  const { cursos, obtenerCursos, loading, obtenerCursoPorId } = useCurso()
  const [busqueda, setBusqueda] = useState('')
  const [seleccionando, setSeleccionando] = useState(null)

  useEffect(() => { obtenerCursos() }, [])

  const handleSelectCurso = async (cursoId) => {
    setSeleccionando(cursoId)
    const data = await obtenerCursoPorId(cursoId)
    setSeleccionando(null)
    if (data) onCursoSelect(data)
  }

  const filtrados = cursos.filter(c =>
    c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-semibold text-[#0266ff] uppercase tracking-widest mb-1">Catálogo</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Cursos disponibles</h1>
          <p className="text-gray-400 mt-1 text-sm">Elige un curso para comenzar tu aprendizaje.</p>
        </motion.div>
      </div>

      {/* Buscador */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="relative mb-8 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar curso..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-full focus:ring-2 focus:ring-[#0266ff]/25 focus:border-[#0266ff] outline-none transition-all bg-gray-50 focus:bg-white"
        />
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-48 bg-gray-100" />
              <div className="p-5 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p>{busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay cursos disponibles aún.'}</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtrados.map((curso, i) => (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -5 }}
                onClick={() => handleSelectCurso(curso.id)}
                className="group relative bg-white border border-gray-100 hover:border-[#0266ff]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300"
              >
                {/* Imagen */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {curso.imagen
                    ? <img src={curso.imagen} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center bg-blue-50"><BookOpen size={40} className="text-[#0266ff]/30" /></div>
                  }
                  {/* Overlay al hover */}
                  <div className="absolute inset-0 bg-[#0266ff]/0 group-hover:bg-[#0266ff]/10 transition-all duration-300" />
                  {/* Badge módulos */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#0266ff] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    <Layers size={11} />
                    {curso.modulos?.length || 0} módulos
                  </div>
                  {/* Spinner si está seleccionando */}
                  {seleccionando === curso.id && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#0266ff] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h2 className="font-bold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-[#0266ff] transition-colors line-clamp-1">
                    {curso.titulo}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                    {curso.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {curso.modulos?.reduce((a, m) => a + (m.lecciones?.length || 0), 0) || 0} lecciones
                    </span>
                    <span className="flex items-center gap-1 text-[#0266ff] text-sm font-semibold group-hover:gap-2 transition-all">
                      Comenzar <ChevronRight size={15} />
                    </span>
                  </div>
                </div>

                {/* Línea azul inferior al hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0266ff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
