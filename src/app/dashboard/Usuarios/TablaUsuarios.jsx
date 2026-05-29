'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, XCircle, CheckCircle } from 'lucide-react'

export default function TablaUsuarios({ usuarios, onEditar, onToggleActivo }) {
  const [confirmModal, setConfirmModal] = useState({ open: false, usuario: null })

  const handleConfirm = (usuario) => setConfirmModal({ open: true, usuario })

  const handleConfirmarCambio = () => {
    if (confirmModal.usuario) onToggleActivo(confirmModal.usuario)
    setConfirmModal({ open: false, usuario: null })
  }

  const getInicial = (nombre) => nombre ? nombre.charAt(0).toUpperCase() : '?'

  return (
    <>
      <div className="overflow-x-auto shadow border border-gray-200 rounded-xl">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-[#0266ff] text-white text-left">
            <tr>
              <th className="py-3 px-4">Foto</th>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Correo electrónico</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Etiqueta</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">
                    {u.imageUrl ? (
                      <img
                        src={u.imageUrl}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold border">
                        {getInicial(u.name)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">{u.role?.name}</td>
                  <td className="py-3 px-4">
                    {u.etiqueta
                      ? <span className="inline-block bg-blue-100 text-[#0266ff] text-xs font-semibold px-2.5 py-1 rounded-full">{u.etiqueta}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div
                      onClick={() => handleConfirm(u)}
                      className={`inline-block cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        u.activo
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <button
                      onClick={() => onEditar(u)}
                      className="text-[#0266ff] hover:text-blue-700 transition"
                    >
                      <Pencil size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-6 italic">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {confirmModal.open && (
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
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center relative"
            >
              <div className="flex justify-center mb-4">
                {confirmModal.usuario?.activo ? (
                  <XCircle className="text-red-500" size={48} />
                ) : (
                  <CheckCircle className="text-green-500" size={48} />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {confirmModal.usuario?.activo
                  ? 'Desactivar usuario'
                  : 'Activar usuario'}
              </h2>
              <p className="text-gray-600 mb-6">
                ¿Deseas {confirmModal.usuario?.activo ? 'desactivar' : 'activar'} la cuenta de{' '}
                <span className="font-semibold">{confirmModal.usuario?.name}</span>?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setConfirmModal({ open: false, usuario: null })}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarCambio}
                  className={`px-6 py-2 rounded-lg text-white ${
                    confirmModal.usuario?.activo
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}