'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import ModalEliminar from '../ModalEliminar'
import DetallesQuiz from './DetallesQuiz'

export default function TablaQuiz({ quizzes = [], onEdit, onDelete }) {
  const lista = Array.isArray(quizzes) ? quizzes : []
  const [modalOpen, setModalOpen] = useState(false)
  const [quizSeleccionado, setQuizSeleccionado] = useState(null)
  const [detalleOpen, setDetalleOpen] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#F40009] text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Lección</th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">Preguntas</th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">Mínimo para aprobar</th>
              <th className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            <AnimatePresence>
              {lista.length > 0 ? (
                lista.map((quiz, i) => (
                  <motion.tr
                    key={quiz.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="hover:bg-red-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-800 font-medium whitespace-nowrap">
                      {quiz.leccion?.titulo || '—'}
                    </td>

                    <td className="px-6 py-4 text-center text-gray-700">
                      {Array.isArray(quiz.preguntas)
                        ? quiz.preguntas.length
                        : quiz.preguntas
                        ? 1
                        : 0}
                    </td>

                    <td className="px-6 py-4 text-center text-gray-700">
                      {quiz.minCorrectas}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setQuizSeleccionado(quiz)
                            setDetalleOpen(true)
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => onEdit && onEdit(quiz)}
                          className="p-2 rounded-full hover:bg-gray-100 text-[#F40009]"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => {
                            setQuizSeleccionado(quiz)
                            setModalOpen(true)
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500 italic text-sm">
                    No hay evaluaciones creadas.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <ModalEliminar
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => onDelete && onDelete(quizSeleccionado?.id)}
        title={`¿Eliminar evaluación de "${quizSeleccionado?.leccion?.titulo}"?`}
        message="Esta acción eliminará permanentemente esta evaluación."
      />

      <DetallesQuiz
        open={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        quiz={quizSeleccionado}
      />
    </div>
  )
}
