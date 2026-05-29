'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ClipboardList, CheckCircle2, AlertCircle, Award, Coins } from 'lucide-react'

export default function DetallesQuiz({ open, onClose, quiz }) {
  if (!open || !quiz) return null

  const preguntas = Array.isArray(quiz.preguntas)
    ? quiz.preguntas
    : quiz.preguntas
    ? [quiz.preguntas]
    : []

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh] border border-gray-200"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.25 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-[#F40009]"
          >
            <X size={22} />
          </button>

          <div className="p-8 text-center border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            <Award size={40} className="mx-auto mb-2 text-[#F40009]" />
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              Evaluación de {quiz.leccion?.titulo || 'Lección'}
            </h2>

            <p className="text-gray-600 text-sm">
              Debes acertar al menos {quiz.minCorrectas} pregunta(s) para aprobar
            </p>

            <p className="mt-3 flex justify-center items-center gap-2 text-[#F40009] font-semibold">
              <Coins size={18} className="text-[#F40009]" />
              {quiz.puntos ?? 0} puntos
            </p>
          </div>

          <div className="p-8 space-y-8">
            {preguntas.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <ClipboardList size={18} className="text-[#F40009]" />
                  {i + 1}. {p.texto}
                </h3>

                <ul className="space-y-2 pl-2">
                  {(p.opciones || []).map((op, j) => {
                    const texto = typeof op === 'string' ? op : op.texto
                    const correcta = typeof op === 'object' ? op.correcta : p.correcta === j

                    return (
                      <li
                        key={j}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                          correcta
                            ? 'bg-green-50 border border-green-400 text-green-700 font-semibold'
                            : 'bg-gray-50 border border-gray-200 text-gray-700'
                        }`}
                      >
                        {correcta ? (
                          <CheckCircle2 size={18} className="text-green-600" />
                        ) : (
                          <AlertCircle size={18} className="text-gray-400" />
                        )}
                        {texto}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
