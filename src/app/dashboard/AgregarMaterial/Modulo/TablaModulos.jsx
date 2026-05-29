'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import ModalEliminar from '../ModalEliminar'

export default function TablaModulos({ modulos = [], onEdit, onDelete }) {
  const lista = Array.isArray(modulos) ? modulos : []
  const [modalOpen, setModalOpen] = useState(false)
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
      <table className="min-w-full border-collapse">
        <thead className="bg-[#0266ff]/90 text-white">
          <tr>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase">Imagen</th>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase">Título</th>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase">Descripción</th>
            <th className="px-5 py-3 text-left text-sm font-semibold uppercase">Curso asociado</th>
            <th className="px-5 py-3 text-center text-sm font-semibold uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {lista.length > 0 ? (
              lista.map((modulo, index) => (
                <motion.tr
                  key={modulo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-red-50 border-t border-gray-100 transition-all"
                >
                  <td className="px-5 py-4">
                    {modulo.imagen ? (
                      <img
                        src={modulo.imagen}
                        alt={modulo.titulo}
                        className="w-14 h-14 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 text-sm">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-800 font-medium">{modulo.titulo}</td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{modulo.descripcion}</td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{modulo.curso?.titulo || '—'}</td>
                  <td className="px-5 py-4 text-center flex justify-center space-x-3">
                    <button
                      onClick={() => onEdit && onEdit(modulo)}
                      className="p-2 rounded-full hover:bg-red-100 text-[#0266ff]"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setModuloSeleccionado(modulo)
                        setModalOpen(true)
                      }}
                      className="p-2 rounded-full hover:bg-red-100 text-gray-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500 italic">
                  No hay módulos registrados.
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>

      <ModalEliminar
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => onDelete && onDelete(moduloSeleccionado?.id)}
        title={`¿Deseas eliminar el módulo "${moduloSeleccionado?.titulo}"?`}
        message="Al eliminar este módulo, se eliminarán todas las lecciones y evaluaciones relacionadas."
      />
    </div>
  )
}