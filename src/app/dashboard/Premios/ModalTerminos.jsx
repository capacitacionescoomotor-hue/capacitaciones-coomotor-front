'use client'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function ModalTerminos({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white max-w-xl w-full p-7 rounded-2xl shadow-xl relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold text-[#0266ff] mb-4">Términos y Condiciones de la Tienda</h2>

        <div className="space-y-4 text-gray-700 text-sm max-h-[60vh] overflow-y-auto">
          <p>Los premios ofrecidos en esta tienda están sujetos a disponibilidad hasta agotar existencias o hasta la fecha límite indicada en cada artículo.</p>
          <p>La empresa se reserva el derecho de modificar, suspender o retirar premios sin previo aviso cuando exista agotamiento de inventario o razones operativas.</p>
          <p>Los puntos utilizados para canjear premios no tienen valor monetario y no pueden ser reembolsados, transferidos o intercambiados por dinero.</p>
          <p>Después de canjear un premio, no se aceptan cambios, devoluciones o cancelaciones.</p>
          <p>Está prohibida la reventa de los premios obtenidos en esta plataforma.</p>
          <p>Al realizar un canje, el usuario acepta estos términos y certifica que la información es correcta.</p>
          <p>La empresa no se hace responsable por demoras de entrega ocasionadas por terceros o eventos fuera de nuestro control.</p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-[#0266ff] px-6 py-2 text-white rounded-xl hover:bg-blue-700"
          >
            Aceptar
          </button>
        </div>
      </motion.div>
    </div>
  )
}