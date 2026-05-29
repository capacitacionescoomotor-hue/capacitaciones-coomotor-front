'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart2, Users, CheckCircle2, XCircle, BookOpen,
  ClipboardList, TrendingUp, Search, RefreshCw,
  ChevronUp, ChevronDown, Award, Percent, Clock, UserCheck, UserX,
  Download, Loader2, LockOpen, AlertTriangle
} from 'lucide-react'
import { useReportes } from '@/app/hooks/Reportes/useReportes'

function BarraH({ valor, max, color = '#0266ff' }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
      <span className="text-xs font-bold text-gray-500 w-8 text-right">{valor}</span>
    </div>
  )
}

function Metrica({ icon, label, value, sub, color = '#0266ff', delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

function BadgeEstado({ aprobado, respondido }) {
  if (!respondido) return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <Clock size={10} /> Sin actividad
    </span>
  )
  return aprobado ? (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
      <CheckCircle2 size={10} /> Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
      <ClipboardList size={10} /> En progreso
    </span>
  )
}

function BadgeResultado({ aprobado }) {
  return aprobado ? (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
      <CheckCircle2 size={11} /> Aprobado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
      <XCircle size={11} /> Reprobado
    </span>
  )
}

export default function Reportes() {
  const { resultados, progresosUsuarios, loading, descargando, stats, fetchTodo, descargarReporte, desbloquearEvaluacion } = useReportes()
  const [confirmDesbloqueo, setConfirmDesbloqueo] = useState(null)
  const [tab, setTab] = useState('estadisticas')

  // Tab resultados
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroCurso, setFiltroCurso] = useState('todos')
  const [ordenCol, setOrdenCol] = useState('fecha')
  const [ordenDir, setOrdenDir] = useState('desc')
  const [pag, setPag] = useState(1)
  const POR_PAG = 12

  // Tab usuarios
  const [busqUsuario, setBusqUsuario] = useState('')
  const [filtroActividad, setFiltroActividad] = useState('todos')
  const [ordenUsuCol, setOrdenUsuCol] = useState('name')
  const [ordenUsuDir, setOrdenUsuDir] = useState('asc')

  const cursosUnicos = [...new Set(resultados.map(r => r.evaluacion.cursoTitulo))]

  const filtrados = resultados
    .filter(r => {
      const txt = busqueda.toLowerCase()
      const coinc = !txt || r.usuario.name.toLowerCase().includes(txt) ||
        r.usuario.email.toLowerCase().includes(txt) ||
        r.evaluacion.cursoTitulo.toLowerCase().includes(txt) ||
        r.evaluacion.leccionTitulo.toLowerCase().includes(txt)
      const estado = filtroEstado === 'todos' || (filtroEstado === 'aprobado' ? r.aprobado : !r.aprobado)
      const curso = filtroCurso === 'todos' || r.evaluacion.cursoTitulo === filtroCurso
      return coinc && estado && curso
    })
    .sort((a, b) => {
      let va, vb
      if (ordenCol === 'fecha') { va = new Date(a.fecha); vb = new Date(b.fecha) }
      else if (ordenCol === 'usuario') { va = a.usuario.name; vb = b.usuario.name }
      else if (ordenCol === 'curso') { va = a.evaluacion.cursoTitulo; vb = b.evaluacion.cursoTitulo }
      else if (ordenCol === 'puntaje') { va = a.correctas / (a.totalPreguntas || 1); vb = b.correctas / (b.totalPreguntas || 1) }
      else { va = a.aprobado; vb = b.aprobado }
      if (va < vb) return ordenDir === 'asc' ? -1 : 1
      if (va > vb) return ordenDir === 'asc' ? 1 : -1
      return 0
    })

  const totalPags = Math.max(1, Math.ceil(filtrados.length / POR_PAG))
  const pagActual = Math.min(pag, totalPags)
  const visibles = filtrados.slice((pagActual - 1) * POR_PAG, pagActual * POR_PAG)

  const toggleOrden = (col) => {
    if (ordenCol === col) setOrdenDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setOrdenCol(col); setOrdenDir('asc') }
    setPag(1)
  }

  // Usuarios filtrados
  const usuariosFiltrados = progresosUsuarios
    .filter(u => {
      const txt = busqUsuario.toLowerCase()
      const coinc = !txt || u.name.toLowerCase().includes(txt) || u.email.toLowerCase().includes(txt)
      const activ = filtroActividad === 'todos' ||
        (filtroActividad === 'activo' && u.respondidos > 0) ||
        (filtroActividad === 'inactivo' && u.respondidos === 0)
      return coinc && activ
    })
    .sort((a, b) => {
      let va = a[ordenUsuCol], vb = b[ordenUsuCol]
      if (va < vb) return ordenUsuDir === 'asc' ? -1 : 1
      if (va > vb) return ordenUsuDir === 'asc' ? 1 : -1
      return 0
    })

  const toggleOrdenUsu = (col) => {
    if (ordenUsuCol === col) setOrdenUsuDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setOrdenUsuCol(col); setOrdenUsuDir('asc') }
  }

  const ThSort = ({ col, label, onToggle, current, dir }) => (
    <th onClick={() => onToggle(col)}
      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-[#0266ff] select-none whitespace-nowrap">
      <span className="flex items-center gap-1">
        {label}
        {current === col
          ? dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
          : <ChevronDown size={12} className="opacity-30" />}
      </span>
    </th>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <p className="text-xs font-semibold text-[#0266ff] uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Reportes y estadísticas</h1>
          <p className="text-gray-400 text-sm mt-1">Seguimiento completo de usuarios y evaluaciones.</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={fetchTodo} disabled={loading}
          className="flex items-center gap-2 border border-gray-200 hover:border-[#0266ff]/40 text-gray-600 hover:text-[#0266ff] text-sm font-semibold px-4 py-2.5 rounded-xl transition-all flex-shrink-0">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Actualizar</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-8 overflow-x-auto">
        {[
          { key: 'estadisticas', label: 'Estadísticas', icon: <BarChart2 size={14} /> },
          { key: 'usuarios', label: `Usuarios (${progresosUsuarios.length})`, icon: <Users size={14} /> },
          { key: 'resultados', label: 'Resultados', icon: <ClipboardList size={14} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t.key ? 'bg-white text-[#0266ff] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══════ ESTADÍSTICAS ══════ */}
        {tab === 'estadisticas' && (
          <motion.div key="stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1,2,3,4].map(i => <div key={i} className="animate-pulse h-24 rounded-2xl bg-gray-100" />)}
              </div>
            ) : !stats ? (
              <div className="text-center py-24 text-gray-400">
                <BarChart2 size={48} className="mx-auto mb-3 opacity-20" />
                <p>No hay datos todavía.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <Metrica delay={0}    icon={<Users size={20} />}         label="Total usuarios"       value={stats.totalUsuarios}          color="#8b5cf6" sub={`${stats.usuariosSinActividad} sin actividad`} />
                  <Metrica delay={0.06} icon={<ClipboardList size={20} />} label="Evaluaciones totales"  value={stats.total}                  color="#0266ff" />
                  <Metrica delay={0.12} icon={<CheckCircle2 size={20} />}  label="Aprobadas"             value={stats.aprobados}              color="#22c55e" sub={`${stats.tasaAprobacion}% del total`} />
                  <Metrica delay={0.18} icon={<XCircle size={20} />}       label="Reprobadas"            value={stats.reprobados}             color="#ef4444" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  <Metrica delay={0.22} icon={<Percent size={20} />}       label="Promedio aciertos"     value={`${stats.promedioCorrectasPct}%`} color="#f59e0b" />
                  <Metrica delay={0.26} icon={<TrendingUp size={20} />}    label="Tasa aprobación"       value={`${stats.tasaAprobacion}%`}   color="#0266ff" />
                  <Metrica delay={0.30} icon={<UserCheck size={20} />}     label="Usuarios activos"      value={stats.usuariosUnicos}         color="#10b981" sub="con al menos 1 eval." />
                  {stats.cursoMasActivo && (
                    <Metrica delay={0.34} icon={<Award size={20} />}       label="Curso más activo"      value={stats.cursoMasActivo[1]}      color="#f43f5e" sub={stats.cursoMasActivo[0]} />
                  )}
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {/* Aprobación por curso */}
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <BookOpen size={18} className="text-[#0266ff]" />
                      <h3 className="font-bold text-gray-900">Aprobación por curso</h3>
                    </div>
                    <div className="space-y-4">
                      {stats.aprobacionPorCurso.length === 0
                        ? <p className="text-sm text-gray-400 text-center py-6">Sin datos</p>
                        : stats.aprobacionPorCurso.map((c, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-800 truncate max-w-[55%]">{c.curso}</p>
                              <div className="flex items-center gap-2 text-xs flex-shrink-0">
                                <span className="text-green-600 font-bold">{c.aprobados}✓</span>
                                <span className="text-red-500">{c.total - c.aprobados}✗</span>
                                <span className="font-extrabold text-[#0266ff] w-9 text-right">{c.tasa}%</span>
                              </div>
                            </div>
                            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-gray-100">
                              <motion.div className="h-full bg-green-400" initial={{ width: 0 }} animate={{ width: `${c.tasa}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                              <motion.div className="h-full bg-red-300" initial={{ width: 0 }} animate={{ width: `${100 - c.tasa}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>

                  {/* Top 5 usuarios */}
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <Users size={18} className="text-[#0266ff]" />
                      <h3 className="font-bold text-gray-900">Top 5 usuarios más activos</h3>
                    </div>
                    <div className="space-y-3">
                      {stats.porUsuario.length === 0
                        ? <p className="text-sm text-gray-400 text-center py-6">Sin datos</p>
                        : stats.porUsuario.map((u, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                              i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-[#0266ff]'
                            }`}>{i + 1}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                              <BarraH valor={u.aprobados} max={u.total} color="#22c55e" />
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="text-xs font-extrabold text-[#0266ff]">{u.tasa}%</p>
                              <p className="text-xs text-gray-400">{u.total} eval.</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                </div>

                {/* Gráfica actividad */}
                {Object.keys(stats.porDia).length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <TrendingUp size={18} className="text-[#0266ff]" />
                      <h3 className="font-bold text-gray-900">Actividad reciente</h3>
                    </div>
                    <div className="flex items-end gap-2 h-20 overflow-x-auto pb-2">
                      {Object.entries(stats.porDia).reverse().map(([dia, v], i) => {
                        const maxVal = Math.max(...Object.values(stats.porDia).map(x => x.total))
                        return (
                          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 group relative">
                            <div className="flex gap-0.5 items-end" style={{ height: 64 }}>
                              <motion.div className="w-4 bg-green-400 rounded-t-sm" initial={{ height: 0 }}
                                animate={{ height: Math.round((v.aprobados / maxVal) * 64) }} transition={{ duration: 0.4, delay: i * 0.03 }} />
                              <motion.div className="w-4 bg-red-300 rounded-t-sm" initial={{ height: 0 }}
                                animate={{ height: Math.round(((v.total - v.aprobados) / maxVal) * 64) }} transition={{ duration: 0.4, delay: i * 0.03 }} />
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{dia}</span>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              {v.total} eval · {v.aprobados} aprob.
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />Aprobadas</span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-red-300 inline-block" />Reprobadas</span>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ══════ USUARIOS ══════ */}
        {tab === 'usuarios' && (
          <motion.div key="usuarios" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={busqUsuario} onChange={e => setBusqUsuario(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0266ff]/25 focus:border-[#0266ff] outline-none w-52 transition-all" />
              </div>
              <select value={filtroActividad} onChange={e => setFiltroActividad(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0266ff]/25 bg-white">
                <option value="todos">Todos</option>
                <option value="activo">Con actividad</option>
                <option value="inactivo">Sin actividad</option>
              </select>
              <span className="ml-auto text-xs text-gray-400 self-center">{usuariosFiltrados.length} usuario(s)</span>
            </div>

            {loading ? (
              <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="animate-pulse h-16 rounded-xl bg-gray-100" />)}</div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-20" />
                <p>No hay usuarios con esos filtros.</p>
              </div>
            ) : (
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <ThSort col="name" label="Usuario" onToggle={toggleOrdenUsu} current={ordenUsuCol} dir={ordenUsuDir} />
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Etiqueta</th>
                        <ThSort col="respondidos" label="Respondidas" onToggle={toggleOrdenUsu} current={ordenUsuCol} dir={ordenUsuDir} />
                        <ThSort col="aprobados" label="Aprobadas" onToggle={toggleOrdenUsu} current={ordenUsuCol} dir={ordenUsuDir} />
                        <ThSort col="pendientes" label="Pendientes" onToggle={toggleOrdenUsu} current={ordenUsuCol} dir={ordenUsuDir} />
                        <ThSort col="tasa" label="Tasa" onToggle={toggleOrdenUsu} current={ordenUsuCol} dir={ordenUsuDir} />
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Última actividad</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Reporte</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {usuariosFiltrados.map((u, i) => (
                        <motion.tr key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${u.activo ? 'bg-[#0266ff]/10 text-[#0266ff]' : 'bg-gray-100 text-gray-400'}`}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{u.name}</p>
                                <p className="text-xs text-gray-400 truncate max-w-[140px]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {u.etiqueta
                              ? <span className="inline-block bg-blue-100 text-[#0266ff] text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{u.etiqueta}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-700">{u.respondidos}<span className="text-xs text-gray-400 font-normal">/{u.totalQuizzes}</span></td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold text-green-600">{u.aprobados}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${u.pendientes > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{u.pendientes}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-extrabold text-[#0266ff]">{u.tasa}%</span>
                              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${u.tasa >= 70 ? 'bg-green-400' : u.tasa >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                                  style={{ width: `${u.tasa}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {u.ultimaActividad
                              ? new Date(u.ultimaActividad).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <BadgeEstado respondido={u.respondidos > 0} aprobado={u.aprobados > 0} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => descargarReporte(u)}
                              disabled={descargando === u.id}
                              title="Descargar reporte detallado"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0266ff] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              {descargando === u.id
                                ? <Loader2 size={13} className="animate-spin" />
                                : <Download size={13} />}
                              {descargando === u.id ? 'Generando...' : 'PDF'}
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════ RESULTADOS ══════ */}
        {tab === 'resultados' && (
          <motion.div key="tabla" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPag(1) }}
                  placeholder="Buscar usuario, curso..."
                  className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0266ff]/25 focus:border-[#0266ff] outline-none w-56 transition-all" />
              </div>
              <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPag(1) }}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0266ff]/25 bg-white">
                <option value="todos">Todos los estados</option>
                <option value="aprobado">Solo aprobados</option>
                <option value="reprobado">Solo reprobados</option>
              </select>
              <select value={filtroCurso} onChange={e => { setFiltroCurso(e.target.value); setPag(1) }}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0266ff]/25 bg-white max-w-[180px]">
                <option value="todos">Todos los cursos</option>
                {cursosUnicos.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="ml-auto text-xs text-gray-400 self-center">{filtrados.length} resultado(s)</span>
            </div>

            {loading ? (
              <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="animate-pulse h-14 rounded-xl bg-gray-100" />)}</div>
            ) : visibles.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
                <p>No hay resultados con esos filtros.</p>
              </div>
            ) : (
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <ThSort col="usuario" label="Usuario" onToggle={toggleOrden} current={ordenCol} dir={ordenDir} />
                        <ThSort col="curso"   label="Curso"   onToggle={toggleOrden} current={ordenCol} dir={ordenDir} />
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Módulo / Lección</th>
                        <ThSort col="puntaje" label="Puntaje" onToggle={toggleOrden} current={ordenCol} dir={ordenDir} />
                        <ThSort col="estado"  label="Estado"  onToggle={toggleOrden} current={ordenCol} dir={ordenDir} />
                        <ThSort col="fecha"   label="Fecha"   onToggle={toggleOrden} current={ordenCol} dir={ordenDir} />
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {visibles.map((r, i) => {
                        const pct = r.totalPreguntas > 0 ? Math.round((r.correctas / r.totalPreguntas) * 100) : 0
                        return (
                          <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#0266ff]/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-extrabold text-[#0266ff]">{r.usuario.name?.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[130px]">{r.usuario.name}</p>
                                  <p className="text-xs text-gray-400 truncate max-w-[130px]">{r.usuario.email}</p>
                                  {r.usuario.etiqueta && (
                                    <span className="inline-block bg-blue-100 text-[#0266ff] text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5">{r.usuario.etiqueta}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><p className="text-sm font-semibold text-gray-800 truncate max-w-[130px]">{r.evaluacion.cursoTitulo}</p></td>
                            <td className="px-4 py-3">
                              <p className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{r.evaluacion.leccionTitulo}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[150px]">{r.evaluacion.moduloTitulo}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-extrabold text-gray-900">{r.correctas}/{r.totalPreguntas}</span>
                              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                                <div className={`h-full rounded-full ${r.aprobado ? 'bg-green-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-400">{pct}%</span>
                            </td>
                            <td className="px-4 py-3"><BadgeResultado aprobado={r.aprobado} /></td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {new Date(r.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => setConfirmDesbloqueo({
                                  userId: r.usuario.id,
                                  quizId: r.evaluacion.id,
                                  userName: r.usuario.name,
                                  evaluacion: r.evaluacion.leccionTitulo,
                                })}
                                title="Desbloquear evaluación para que el usuario pueda repetirla"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all"
                              >
                                <LockOpen size={13} /> Desbloquear
                              </button>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPags > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">
                      {(pagActual - 1) * POR_PAG + 1}–{Math.min(pagActual * POR_PAG, filtrados.length)} de {filtrados.length}
                    </p>
                    <div className="flex gap-1">
                      <button onClick={() => setPag(p => Math.max(1, p - 1))} disabled={pagActual === 1}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#0266ff]/40 hover:text-[#0266ff] transition-all">← Ant</button>
                      {Array.from({ length: Math.min(5, totalPags) }, (_, i) => {
                        const n = Math.max(1, Math.min(pagActual - 2, totalPags - 4)) + i
                        return (
                          <button key={n} onClick={() => setPag(n)}
                            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${n === pagActual ? 'bg-[#0266ff] text-white' : 'hover:bg-blue-50 text-gray-600'}`}>
                            {n}
                          </button>
                        )
                      })}
                      <button onClick={() => setPag(p => Math.min(totalPags, p + 1))} disabled={pagActual === totalPags}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#0266ff]/40 hover:text-[#0266ff] transition-all">Sig →</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal confirmación desbloqueo ── */}
      <AnimatePresence>
        {confirmDesbloqueo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={32} className="text-amber-500" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Desbloquear evaluación</h2>
              <p className="text-gray-500 text-sm mb-1">
                Estás a punto de permitir que <span className="font-bold text-gray-800">{confirmDesbloqueo.userName}</span> vuelva a realizar:
              </p>
              <p className="text-[#0266ff] font-semibold text-sm mb-6">"{confirmDesbloqueo.evaluacion}"</p>
              <p className="text-xs text-gray-400 mb-6">
                El resultado anterior será eliminado y los puntos obtenidos serán descontados si la evaluación fue aprobada.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setConfirmDesbloqueo(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    const { userId, quizId } = confirmDesbloqueo
                    setConfirmDesbloqueo(null)
                    await desbloquearEvaluacion(userId, quizId)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all"
                >
                  Sí, desbloquear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
