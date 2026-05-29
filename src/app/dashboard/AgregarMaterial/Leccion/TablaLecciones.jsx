'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, Eye } from 'lucide-react'
import ModalEliminar from '../ModalEliminar'
import DetallesLeccion from './DetallesLeccion'

export default function TablaLecciones({ lecciones = [], onEdit, onDelete }) {
  const lista = Array.isArray(lecciones) ? lecciones : []
  const [modalOpen, setModalOpen] = useState(false)
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null)
  const [detalleOpen, setDetalleOpen] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
      <table className="min-w-full border-collapse">
        <thead className="bg-[#0266ff]/90 text-white">
          <tr>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide">Imagen</th>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide">Título</th>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide">Módulo</th>
            <th className="px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {lista.length > 0 ? (
              lista.map((leccion, index) => (
                <motion.tr
                  key={leccion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-red-50 border-t border-gray-100 transition-all"
                >
                  <td className="px-5 py-4">
                    {leccion.imagen ? (
                      <img
                        src={leccion.imagen}
                        alt={leccion.titulo}
                        className="w-14 h-14 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 text-sm">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-800 font-medium">{leccion.titulo}</td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{leccion.modulo?.titulo || '—'}</td>
                  <td className="px-5 py-4 text-center flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        setLeccionSeleccionada(leccion)
                        setDetalleOpen(true)
                      }}
                      className="p-2 rounded-full hover:bg-red-100 text-blue-600 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(leccion)}
                      className="p-2 rounded-full hover:bg-red-100 text-[#F40009] transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setLeccionSeleccionada(leccion)
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
                  No hay lecciones registradas.
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>

      <ModalEliminar
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => onDelete && onDelete(leccionSeleccionada?.id)}
        title={`¿Deseas eliminar la lección "${leccionSeleccionada?.titulo}"?`}
        message="Al eliminar esta lección, tambien se eliminará la evaluacion relacionada."
      />

      <DetallesLeccion
        open={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        leccion={leccionSeleccionada}
      />
    </div>
  )
}