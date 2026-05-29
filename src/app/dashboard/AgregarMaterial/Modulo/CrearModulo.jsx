'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, RotateCcw, Layers } from 'lucide-react'

export default function CrearModulo({ cursos = [], onGuardar, onEdit, onDelete, moduloEditando, onCancelarEdicion }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', imagen: '', cursoId: '' })
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    if (moduloEditando) {
      setForm({
        titulo: moduloEditando.titulo || '',
        descripcion: moduloEditando.descripcion || '',
        imagen: moduloEditando.imagen || '',
        cursoId: moduloEditando.curso?.id || '',
      })
      setEditando(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setEditando(false)
      setForm({ titulo: '', descripcion: '', imagen: '', cursoId: '' })
    }
  }, [moduloEditando])

  const limpiarFormulario = () => {
    setForm({ titulo: '', descripcion: '', imagen: '', cursoId: '' })
    setEditando(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editando) {
      onGuardar({ ...form, id: moduloEditando.id })
    } else {
      onGuardar(form)
    }

    limpiarFormulario()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {editando ? 'Editar módulo' : 'Crear nuevo módulo'}
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#0266ff] mb-4 flex items-center gap-2">
          <Layers size={22} className="text-[#0266ff]" />
          Datos del módulo
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-[#0266ff]">*</span>
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ejemplo: Comunicación efectiva"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-[#0266ff] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso asociado <span className="text-[#0266ff]">*</span>
              </label>
              <select
                value={form.cursoId}
                onChange={(e) => setForm({ ...form, cursoId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-[#0266ff] outline-none"
              >
                <option value="">Seleccionar curso</option>
                {Array.isArray(cursos) &&
                  cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-[#0266ff]">*</span>
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={3}
                placeholder="Breve descripción del módulo..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-[#0266ff] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen de la tarjeta <span className="text-[#0266ff]">*</span>
              </label>
              <input
                type="text"
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-[#0266ff] outline-none"
              />
              {form.imagen && (
                <img src={form.imagen} alt="Preview" className="mt-2 rounded-lg w-full h-32 object-cover border" />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            {editando && (
              <button
                type="button"
                onClick={() => {
                  limpiarFormulario()
                  onCancelarEdicion()
                }}
                className="flex items-center border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <RotateCcw size={18} className="mr-2" /> Cancelar
              </button>
            )}

            <button
              type="submit"
              className="flex items-center bg-[#0266ff] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              {editando ? (
                <>
                  <Save size={18} className="mr-2" /> Guardar cambios
                </>
              ) : (
                <>
                  <Plus size={18} className="mr-2" /> Agregar módulo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}