'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { BookOpen, ArrowRight, Search, ChevronRight } from 'lucide-react'
import { useCurso } from '@/app/hooks/AgregarMaterial/Curso/useCurso'

export default function Inicio({ onNavigate }) {
  const [usuario, setUsuario] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const { cursos, obtenerCursos, loading } = useCurso()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUsuario(JSON.parse(userData))
  }, [])

  useEffect(() => { obtenerCursos() }, [])

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem('user')
      if (stored) setUsuario(JSON.parse(stored))
    }
    window.addEventListener('userUpdated', sync)
    return () => window.removeEventListener('userUpdated', sync)
  }, [])

  const cursosFiltrados = cursos.filter((c) =>
    c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0266ff] to-[#0044bb] overflow-hidden rounded-2xl mb-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-72 sm:h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mb-4">
              <BookOpen size={13} /> Plataforma de aprendizaje
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
              ¡Bienvenido,{' '}
              <span className="text-white/90">{usuario?.name?.split(' ')[0] || 'Usuario'}</span>!
            </h1>
            <p className="text-white/75 text-sm sm:text-base mb-6 leading-relaxed max-w-lg mx-auto md:mx-0">
              Explora los cursos disponibles, aprende a tu ritmo y desarrolla nuevas habilidades.
            </p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('cursos')}
              className="bg-white text-[#0266ff] font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 text-sm sm:text-base">
              Ver todos los cursos <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block flex-shrink-0">
            <Image src="/Img/bienvenida.gif" alt="Bienvenida" width={180} height={180} className="drop-shadow-2xl" />
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="flex gap-6 sm:gap-8 mb-6 px-1">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-[#0266ff]">{cursos.length}</p>
          <p className="text-xs text-gray-500">Cursos disponibles</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div>
          <p className="text-xl sm:text-2xl font-bold text-[#0266ff]">
            {cursos.reduce((acc, c) => acc + (c.modulos?.length || 0), 0)}
          </p>
          <p className="text-xs text-gray-500">Módulos en total</p>
        </div>
      </motion.div>

      {/* Buscador + título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <motion.h2 initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          className="text-xl sm:text-2xl font-bold text-gray-900">
          Cursos disponibles
        </motion.h2>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="relative w-full sm:w-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar curso..."
            className="w-full sm:w-56 pl-9 pr-4 py-2.5 border border-gray-200 rounded-full text-sm text-gray-700 focus:ring-2 focus:ring-[#0266ff]/25 focus:border-[#0266ff] outline-none transition-all" />
        </motion.div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1,2,3].map(i => <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-56" />)}
        </div>
      ) : cursosFiltrados.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">{busqueda ? 'Sin resultados.' : 'No hay cursos aún.'}</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cursosFiltrados.map((curso, i) => (
              <motion.div key={curso.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}
                onClick={() => onNavigate('cursos')}
                className="group bg-white border border-gray-200 hover:border-[#0266ff]/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300">
                <div className="h-40 sm:h-44 overflow-hidden bg-gray-100 relative">
                  {curso.imagen
                    ? <img src={curso.imagen} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center bg-blue-50"><BookOpen size={36} className="text-[#0266ff]/30" /></div>
                  }
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-[#0266ff] text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    {curso.modulos?.length || 0} módulos
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-[#0266ff] transition-colors mb-1 line-clamp-1">{curso.titulo}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">{curso.descripcion || 'Sin descripción'}</p>
                  <div className="flex items-center text-[#0266ff] text-xs sm:text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                    Comenzar <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
