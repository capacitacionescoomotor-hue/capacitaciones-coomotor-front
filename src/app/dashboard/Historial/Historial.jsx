'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, XCircle, Clock, BookOpen, ChevronDown,
  ChevronUp, RefreshCw, ClipboardList, Trophy, AlertCircle
} from 'lucide-react'
import { useHistorial } from '@/app/hooks/Historial/useHistorial'

/* ── Círculo de progreso SVG ── */
function CirculoProgreso({ valor, total, color = '#0266ff', size = 64 }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0
  const r = 24
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 60 60" className="-rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <motion.circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-extrabold text-gray-800">{pct}%</span>
      </div>
    </div>
  )
}

/* ── Badge de estado ── */
function EstadoBadge({ respondido, aprobado }) {
  if (!respondido) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      <Clock size={11} /> Pendiente
    </span>
  )
  return aprobado ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
      <CheckCircle2 size={11} /> Aprobado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
      <XCircle size={11} /> Reprobado
    </span>
  )
}

/* ── Tarjeta de un curso ── */
function TarjetaCurso({ grupo, index, onIrCurso }) {
  const [abierto, setAbierto] = useState(true)
  const { evaluaciones, cursoTitulo, cursoImagen, respondidas, aprobadas, pendientes, totalEvaluaciones } = grupo

  const colorProgreso = aprobadas === totalEvaluaciones ? '#22c55e'
    : pendientes === totalEvaluaciones ? '#f59e0b' : '#0266ff'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Header del curso */}
      <div
        className="flex items-center gap-4 p-4 sm:p-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setAbierto(!abierto)}
      >
        {/* Imagen */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {cursoImagen
            ? <img src={cursoImagen} alt={cursoTitulo} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center bg-blue-50">
                <BookOpen size={20} className="text-[#0266ff]/40" />
              </div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{cursoTitulo}</h3>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-400">{totalEvaluaciones} evaluaciones</span>
            {aprobadas > 0 && <span className="text-xs text-green-600 font-semibold">{aprobadas} aprobadas</span>}
            {pendientes > 0 && <span className="text-xs text-amber-600 font-semibold">{pendientes} pendientes</span>}
          </div>
        </div>

        {/* Progreso circular */}
        <CirculoProgreso valor={aprobadas} total={totalEvaluaciones} color={colorProgreso} size={52} />

        {/* Toggle */}
        <div className="text-gray-400 flex-shrink-0">
          {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Lista evaluaciones */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {evaluaciones.map((ev, i) => {
                const pct = ev.totalPreguntas > 0 && ev.correctas !== null
                  ? Math.round((ev.correctas / ev.totalPreguntas) * 100) : null

                return (
                  <div key={ev.quizId}
                    className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 ${!ev.respondido ? 'opacity-70' : ''}`}>

                    {/* Número */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                      ev.aprobado ? 'bg-green-100 text-green-700'
                      : ev.respondido ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                      {ev.aprobado ? <CheckCircle2 size={14} />
                        : ev.respondido ? <XCircle size={14} />
                        : i + 1}
                    </div>

                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{ev.leccionTitulo}</p>
                      <p className="text-xs text-gray-400 truncate">{ev.moduloTitulo}</p>
                    </div>

                    {/* Puntaje */}
                    {ev.respondido && pct !== null && (
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-xs font-extrabold text-gray-800">{ev.correctas}/{ev.totalPreguntas}</p>
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${ev.aprobado ? 'bg-green-400' : 'bg-red-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{pct}%</p>
                      </div>
                    )}

                    {/* Fecha */}
                    {ev.fecha && (
                      <p className="text-xs text-gray-400 flex-shrink-0 hidden md:block whitespace-nowrap">
                        {new Date(ev.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                      </p>
                    )}

                    {/* Badge estado */}
                    <div className="flex-shrink-0">
                      <EstadoBadge respondido={ev.respondido} aprobado={ev.aprobado} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer: ir al curso */}
            {pendientes > 0 && (
              <div className="px-4 sm:px-5 py-3 bg-amber-50/60 border-t border-amber-100">
                <button
                  onClick={() => onIrCurso && onIrCurso()}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 transition-colors"
                >
                  <AlertCircle size={13} />
                  Tienes {pendientes} evaluación{pendientes > 1 ? 'es' : ''} pendiente{pendientes > 1 ? 's' : ''} — Ir a Cursos →
                </button>
              </div>
            )}
            {pendientes === 0 && totalEvaluaciones > 0 && (
              <div className="px-4 sm:px-5 py-3 bg-green-50/60 border-t border-green-100">
                <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                  <Trophy size={13} /> ¡Completaste todas las evaluaciones de este curso!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════ */
export default function Historial({ onNavigate }) {
  const { historial, loading, stats, fetchHistorial } = useHistorial()

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <p className="text-xs font-semibold text-[#0266ff] uppercase tracking-widest mb-1">Mi progreso</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Historial de evaluaciones</h1>
          <p className="text-gray-400 text-sm mt-1">Tus evaluaciones completadas y las que te faltan.</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={fetchHistorial} disabled={loading}
          className="flex items-center gap-2 border border-gray-200 hover:border-[#0266ff]/40 text-gray-600 hover:text-[#0266ff] text-sm font-semibold px-4 py-2.5 rounded-xl transition-all flex-shrink-0">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Actualizar</span>
        </motion.button>
      </div>

      {/* Métricas resumen */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: 'Total evaluaciones', value: stats.total, icon: <ClipboardList size={18} />, color: '#0266ff' },
            { label: 'Respondidas', value: stats.respondidas, icon: <CheckCircle2 size={18} />, color: '#22c55e' },
            { label: 'Pendientes', value: stats.pendientes, icon: <Clock size={18} />, color: '#f59e0b' },
            { label: 'Tasa de aprobación', value: `${stats.tasaAprobacion}%`, icon: <Trophy size={18} />, color: '#8b5cf6' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${m.color}15` }}>
                <span style={{ color: m.color }}>{m.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-none">{m.value}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{m.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-24" />
          ))}
        </div>
      ) : historial.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 text-gray-400">
          <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium text-gray-500">Aún no hay evaluaciones disponibles.</p>
          <p className="text-sm text-gray-400 mt-1">Cuando el admin agregue cursos con evaluaciones aparecerán aquí.</p>
          <button onClick={() => onNavigate && onNavigate('cursos')}
            className="mt-6 bg-[#0266ff] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all">
            Explorar cursos
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {historial.map((grupo, i) => (
            <TarjetaCurso
              key={grupo.cursoId}
              grupo={grupo}
              index={i}
              onIrCurso={() => onNavigate && onNavigate('cursos')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
