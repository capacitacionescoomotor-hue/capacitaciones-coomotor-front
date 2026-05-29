'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, FileText, ClipboardList, CheckCircle2,
  XCircle, PlayCircle, BookOpen, ChevronRight, Trophy, RotateCcw, Lock
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useQuiz } from '@/app/hooks/AgregarMaterial/Quiz/useQuiz'

/* ── Barra de progreso de quiz ── */
function BarraProgreso({ actual, total }) {
  const pct = Math.round((actual / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#0266ff] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{actual}/{total}</span>
    </div>
  )
}

/* ── Pantalla de resultado ── */
function PantallaResultado({ resultado, quiz, onVolver }) {
  const pct = Math.round((resultado.correctas / resultado.total) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {resultado.aprobado ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6 border-4 border-green-200"
          >
            <Trophy size={44} className="text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">¡Excelente!</h2>
          <p className="text-gray-500 mb-6 text-base">Aprobaste la evaluación con éxito.</p>
        </>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6 border-4 border-red-100"
          >
            <XCircle size={44} className="text-red-400" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Casi lo logras</h2>
          <p className="text-gray-500 mb-6 text-base">Revisa el contenido y vuelve a intentarlo.</p>
        </>
      )}

      {/* Score circular */}
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke={resultado.aprobado ? '#22c55e' : '#ef4444'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="263.9"
            initial={{ strokeDashoffset: 263.9 }}
            animate={{ strokeDashoffset: 263.9 - (263.9 * pct / 100) }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-gray-900">{pct}%</span>
          <span className="text-xs text-gray-400">{resultado.correctas}/{resultado.total}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={16} /> Volver a la lección
        </button>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════ */
function toEmbedUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    // youtube.com/watch?v=ID  o  youtube.com/shorts/ID
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v') || u.pathname.split('/').pop()
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    // youtu.be/ID
    if (u.hostname === 'youtu.be') {
      const v = u.pathname.slice(1)
      if (v) return `https://www.youtube.com/embed/${v}`
    }
  } catch { /* URL no válida, devolver tal cual */ }
  return url
}

export default function ContenidoLeccion({ leccion, onBack }) {
  const [quiz, setQuiz] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [modo, setModo] = useState('leccion') // 'leccion' | 'quiz' | 'resultado'
  const [resultado, setResultado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [yaCompletado, setYaCompletado] = useState(false)
  const { quizzes, obtenerQuizzes, enviarRespuestasQuiz, obtenerResultadoQuiz } = useQuiz()

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null } catch { return null }
  }, [])
  const userId = user?.id

  useEffect(() => { obtenerQuizzes() }, [])

  useEffect(() => {
    if (leccion && quizzes.length > 0) {
      const q = quizzes.find(q => q.leccion?.id === leccion.id)
      setQuiz(q || null)
      // Resetear estado al cambiar de lección
      setYaCompletado(false)
      setResultado(null)
      setModo('leccion')
      setRespuestas({})
    }
  }, [leccion, quizzes])

  useEffect(() => {
    const verificar = async () => {
      if (quiz && userId) {
        const data = await obtenerResultadoQuiz(quiz.id, userId)
        if (data) {
          setResultado({ aprobado: data.aprobado, correctas: data.correctas, total: quiz.preguntas.length })
          setYaCompletado(true)
          setModo('resultado')
        }
      }
    }
    verificar()
  }, [quiz, userId])

  // Al volver desde la pantalla de resultado, re-verifica si sigue bloqueado o fue desbloqueado
  const handleVolverALeccion = async () => {
    setModo('leccion')
    if (quiz && userId) {
      const data = await obtenerResultadoQuiz(quiz.id, userId)
      if (!data) {
        // Admin desbloqueó la evaluación
        setYaCompletado(false)
        setResultado(null)
        setRespuestas({})
      }
    }
  }

  const preguntasRespondidas = Object.keys(respuestas).length
  const totalPreguntas = quiz?.preguntas?.length || 0
  const todasRespondidas = preguntasRespondidas === totalPreguntas && totalPreguntas > 0

  const handleEnviar = async () => {
    if (!quiz || !userId || !todasRespondidas) {
      toast.error('Responde todas las preguntas antes de enviar.')
      return
    }
    setEnviando(true)
    const respuestasArray = Object.entries(respuestas).map(([preguntaId, opcionIndex]) => {
      const opcionId = quiz.preguntas.find(p => p.id === Number(preguntaId))?.opciones[opcionIndex]?.id
      return { preguntaId: Number(preguntaId), opcionId }
    })
    const data = await enviarRespuestasQuiz(quiz.id, userId, respuestasArray)
    setEnviando(false)
    if (data) {
      setResultado({ aprobado: data.aprobado, correctas: data.correctas, total: quiz.preguntas.length })
      setModo('resultado')
      // Notificar al historial para que se actualice
      window.dispatchEvent(new Event('quizCompletado'))
      if (data.aprobado) toast.success('¡Felicitaciones! Aprobaste la evaluación.')
      else toast.error('No aprobaste esta vez. ¡Sigue intentando!')
    }
  }

  if (!leccion) return (
    <div className="p-6 sm:p-10 text-center text-gray-400">No se encontró contenido.</div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* ── Breadcrumb ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#0266ff] hover:text-blue-700 font-medium transition-colors">
          <ArrowLeft size={15} /> Lecciones
        </button>
        <span>/</span>
        <span className="text-gray-800 font-semibold truncate max-w-xs">{leccion.titulo}</span>
        {modo === 'quiz' && <><span>/</span><span className="text-gray-800 font-semibold">Evaluación</span></>}
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ════════ MODO LECCIÓN ════════ */}
        {modo === 'leccion' && (
          <motion.div key="leccion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-gradient-to-br from-[#0266ff] to-[#0044bb] rounded-2xl p-5 sm:p-8 mb-8 overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
              <div className="relative z-10">
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Lección</p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">{leccion.titulo}</h1>
                {leccion.descripcion && <p className="text-white/70 text-sm max-w-2xl">{leccion.descripcion}</p>}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {leccion.videoUrl && <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/15 px-3 py-1 rounded-full"><PlayCircle size={12} /> Video</span>}
                  {leccion.archivos?.length > 0 && <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/15 px-3 py-1 rounded-full"><FileText size={12} /> {leccion.archivos.length} archivo(s)</span>}
                  {quiz && <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/15 px-3 py-1 rounded-full"><ClipboardList size={12} /> Evaluación incluida</span>}
                </div>
              </div>
            </motion.div>

            {/* Video */}
            {leccion.videoUrl && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <PlayCircle size={18} className="text-[#0266ff]" />
                  <h2 className="font-bold text-gray-800">Video</h2>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video">
                  <iframe className="w-full h-full" src={toEmbedUrl(leccion.videoUrl)} title={leccion.titulo} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </motion.div>
            )}

            {/* Contenido texto */}
            {leccion.contenidoTexto && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-[#0266ff]" />
                  <h2 className="font-bold text-gray-800">Contenido</h2>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{leccion.contenidoTexto}</p>
                </div>
              </motion.div>
            )}

            {/* Archivos */}
            {Array.isArray(leccion.archivos) && leccion.archivos.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-[#0266ff]" />
                  <h2 className="font-bold text-gray-800">Archivos</h2>
                </div>
                <div className="space-y-2">
                  {leccion.archivos.map((archivo, idx) => (
                    <a key={idx} href={archivo} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 hover:border-[#0266ff]/30 rounded-xl hover:shadow-sm transition-all group">
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-red-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#0266ff] transition-colors truncate">
                        {archivo.split('/').pop()}
                      </span>
                      <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-[#0266ff] flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA evaluación */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              {quiz && !yaCompletado && (
                <div className="border border-[#0266ff]/20 bg-blue-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0266ff]/10 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={22} className="text-[#0266ff]" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-bold text-gray-900 text-sm">¿Listo para la evaluación?</p>
                    <p className="text-xs text-gray-500 mt-0.5">{totalPreguntas} preguntas · necesitas {quiz.minCorrectas} correctas para aprobar</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setModo('quiz')}
                    className="bg-[#0266ff] hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-all whitespace-nowrap"
                  >
                    Iniciar evaluación →
                  </motion.button>
                </div>
              )}
              {quiz && yaCompletado && (
                <div className="border border-gray-200 bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Lock size={22} className="text-gray-400" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-bold text-gray-700 text-sm">Evaluación completada</p>
                    <p className="text-xs text-gray-400 mt-0.5">Ya realizaste esta evaluación. Si necesitas repetirla, solicita al administrador que la desbloquee.</p>
                  </div>
                  <button
                    onClick={() => setModo('resultado')}
                    className="border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all whitespace-nowrap"
                  >
                    Ver mi resultado
                  </button>
                </div>
              )}
              {!quiz && (
                <p className="text-center text-sm text-gray-400 py-4">Esta lección no tiene evaluación.</p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ════════ MODO QUIZ ════════ */}
        {modo === 'quiz' && quiz && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>

            {/* Header quiz */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-extrabold text-gray-900">Evaluación</h2>
                <button onClick={() => setModo('leccion')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition-colors">
                  <RotateCcw size={14} /> Volver
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">{leccion.titulo} · {totalPreguntas} preguntas</p>
              <BarraProgreso actual={preguntasRespondidas} total={totalPreguntas} />
            </div>

            {/* Preguntas */}
            <div className="space-y-6 mb-10">
              {quiz.preguntas.map((pregunta, pi) => {
                const respondida = respuestas[pregunta.id] !== undefined
                return (
                  <motion.div
                    key={pregunta.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pi * 0.05 }}
                    className={`border rounded-2xl p-5 transition-all duration-200 ${respondida ? 'border-[#0266ff]/30 bg-blue-50/40' : 'border-gray-100 bg-white'}`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-all ${respondida ? 'bg-[#0266ff] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {respondida ? <CheckCircle2 size={14} /> : pi + 1}
                      </span>
                      <p className="font-semibold text-gray-800 text-sm leading-snug pt-0.5">{pregunta.texto}</p>
                    </div>

                    <div className="space-y-2 ml-10">
                      {pregunta.opciones.map((opcion, oi) => {
                        const texto = typeof opcion === 'string' ? opcion : opcion.texto
                        const seleccionada = respuestas[pregunta.id] === oi
                        return (
                          <motion.label
                            key={oi}
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-150 ${
                              seleccionada
                                ? 'bg-[#0266ff] border-[#0266ff] text-white shadow-sm'
                                : 'bg-white border-gray-100 hover:border-[#0266ff]/30 hover:bg-blue-50/30 text-gray-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${seleccionada ? 'border-white bg-white' : 'border-gray-300'}`}>
                              {seleccionada && <div className="w-2.5 h-2.5 rounded-full bg-[#0266ff]" />}
                            </div>
                            <input type="radio" name={`p-${pregunta.id}`} checked={seleccionada}
                              onChange={() => setRespuestas({ ...respuestas, [pregunta.id]: oi })} className="sr-only" />
                            <span className="text-sm font-medium">{texto}</span>
                          </motion.label>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Botón enviar */}
            <div className="sticky bottom-6">
              <motion.button
                whileHover={{ scale: todasRespondidas ? 1.02 : 1 }}
                whileTap={{ scale: todasRespondidas ? 0.98 : 1 }}
                onClick={handleEnviar}
                disabled={!todasRespondidas || enviando}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg ${
                  todasRespondidas
                    ? 'bg-[#0266ff] hover:bg-blue-700 text-white shadow-blue-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {enviando ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : todasRespondidas ? (
                  'Enviar respuestas →'
                ) : (
                  `Responde ${totalPreguntas - preguntasRespondidas} pregunta(s) más`
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ════════ MODO RESULTADO ════════ */}
        {modo === 'resultado' && resultado && (
          <motion.div key="resultado" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PantallaResultado resultado={resultado} quiz={quiz} onVolver={handleVolverALeccion} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
