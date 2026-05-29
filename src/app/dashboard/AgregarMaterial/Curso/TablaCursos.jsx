'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import ModalEliminar from '../ModalEliminar'

export default function TablaCursos({ cursos = [], onEdit, onDelete }) {
  const lista = Array.isArray(cursos) ? cursos : []
  const [modalOpen, setModalOpen] = useState(false)
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
      <table className="min-w-full border-collapse">
        <thead className="bg-[#0266ff]/90 text-white">
          <tr>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide">Imagen</th>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide">Título</th>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide">Descripción</th>
            <th className="px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {lista.length > 0 ? (
              lista.map((curso, index) => (
                <motion.tr
                  key={curso.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-red-50 border-t border-gray-100 transition-all"
                >
                  <td className="px-5 py-4">
                    {curso.imagen ? (
                      <img src={curso.imagen} alt={curso.titulo} className="w-14 h-14 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 text-sm">N/A</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-800 font-medium">{curso.titulo}</td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{curso.descripcion}</td>
                  <td className="px-5 py-4 text-center flex justify-center space-x-3">
                    <button
                      onClick={() => onEdit && onEdit(curso)}
                      className="p-2 rounded-full hover:bg-red-100 text-[#0266ff] transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setCursoSeleccionado(curso)
                        setModalOpen(true)
                      }}
                      className="p-2 rounded-full hover:bg-red-100 text-gray-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500 italic">
                  No hay cursos registrados.
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>

      <ModalEliminar
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => onDelete && onDelete(cursoSeleccionado?.id)}
        title={`¿Deseas eliminar el curso "${cursoSeleccionado?.titulo}"?`}
        message="Al eliminar este curso, también se eliminarán todos los módulos, lecciones y evaluaciones asociadas a él."
      />
    </div>
  )
}