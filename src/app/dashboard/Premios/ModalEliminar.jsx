'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, XCircle, Gift } from 'lucide-react'

export default function ModalEliminar({
  open,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger'
}) {
  const renderIcon = () => {
    if (variant === 'confirm') {
      return <Gift className="text-[#0266ff]" size={48} />
    }
    if (variant === 'info') {
      return <XCircle className="text-[#0266ff]" size={48} />
    }
    return <Trash2 className="text-[#0266ff]" size={48} />
  }

  const renderConfirmIcon = () => {
    if (variant === 'confirm') {
      return <Gift size={18} className="mr-2" />
    }
    if (variant === 'info') {
      return <XCircle size={18} className="mr-2" />
    }
    return <Trash2 size={18} className="mr-2" />
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-md text-center"
          >
            <div className="flex flex-col items-center space-y-4">
              {renderIcon()}
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed px-4">
                {message}
              </p>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={onClose}
                  className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition-all"
                >
                  <XCircle size={18} className="mr-2" /> {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className="flex items-center bg-[#0266ff] hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all"
                >
                  {renderConfirmIcon()} {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}