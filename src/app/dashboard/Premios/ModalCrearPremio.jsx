'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Image as ImgIcon, Calendar, Tag, Hash } from 'lucide-react'

export default function ModalCrearPremio({ onClose, onGuardar, premio }) {
  const [form, setForm] = useState({
    nombre: '',
    puntos: '',
    cantidad: '',
    fechaLimite: '',
    img: ''
  })

  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (premio) {
      setForm({
        nombre: premio.nombre || '',
        puntos: premio.puntos != null ? String(premio.puntos) : '',
        cantidad: premio.cantidad != null ? String(premio.cantidad) : '',
        fechaLimite: premio.fechaLimite ? String(premio.fechaLimite).slice(0, 10) : '',
        img: premio.img || ''
      })
    }
  }, [premio])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({
      id: premio?.id,
      nombre: form.nombre,
      img: form.img,
      fechaLimite: form.fechaLimite,
      puntos: Number(form.puntos),
      cantidad: Number(form.cantidad)
    })
  }

  const titulo = premio ? 'Editar premio' : 'Crear nuevo premio'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ duration: 0.35 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-8 relative border border-gray-200 max-h-[95vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-[#0266ff] transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold text-[#0266ff] mb-6">{titulo}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del premio
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4">
              <Tag size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ejemplo: Tarjeta regalo"
                className="w-full py-2 bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puntos requeridos
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4">
              <Hash size={18} className="text-gray-400 mr-2" />
              <input
                type="number"
                name="puntos"
                value={form.puntos}
                onChange={handleChange}
                required
                placeholder="Ejemplo: 500"
                className="w-full py-2 bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad disponible
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4">
              <Hash size={18} className="text-gray-400 mr-2" />
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                required
                placeholder="Ejemplo: 10"
                className="w-full py-2 bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha límite
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4">
              <Calendar size={18} className="text-gray-400 mr-2" />
              <input
                type="date"
                name="fechaLimite"
                value={form.fechaLimite}
                onChange={handleChange}
                required
                min={hoy}
                className="w-full py-2 bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen (URL)
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl px-4">
              <ImgIcon size={18} className="text-gray-400 mr-2" />
              <input
                type="url"
                name="img"
                value={form.img}
                onChange={handleChange}
                required
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full py-2 bg-transparent outline-none text-gray-700"
              />
            </div>

            {form.img && (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={form.img}
                alt="Vista previa"
                className="mt-4 w-24 h-24 object-contain rounded-lg border mx-auto"
              />
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#0266ff] text-white hover:bg-blue-700 transition"
            >
              Guardar premio
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}