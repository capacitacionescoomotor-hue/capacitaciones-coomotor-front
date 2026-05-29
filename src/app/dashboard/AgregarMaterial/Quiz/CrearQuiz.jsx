'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, RotateCcw, Trash2, FileQuestion, ClipboardList, Star } from 'lucide-react'

export default function CrearQuiz({ lecciones = [], onGuardar, quizEditando, onCancelarEdicion }) {
  const [form, setForm] = useState({
    leccionId: '',
    puntos: 0,
    minCorrectas: 1,
    preguntas: [{ texto: '', opciones: ['', ''], correcta: 0 }]
  })
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    if (quizEditando) {
      const preguntas = Array.isArray(quizEditando.preguntas)
        ? quizEditando.preguntas
        : quizEditando.preguntas
        ? [quizEditando.preguntas]
        : []
      setForm({
        leccionId: quizEditando.leccion?.id || '',
        puntos: quizEditando.puntos ?? 0,
        minCorrectas: quizEditando.minCorrectas || 1,
        preguntas: preguntas.map((p) => ({
          texto: p.texto,
          opciones: p.opciones?.map((o) => (typeof o === 'string' ? o : o.texto)) || ['', ''],
          correcta: Array.isArray(p.opciones)
            ? p.opciones.findIndex((o) => o.correcta)
            : 0
        }))
      })
      setEditando(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setEditando(false)
      setForm({
        leccionId: '',
        puntos: 0,
        minCorrectas: 1,
        preguntas: [{ texto: '', opciones: ['', ''], correcta: 0 }]
      })
    }
  }, [quizEditando])

  const agregarPregunta = () =>
    setForm({
      ...form,
      preguntas: [...form.preguntas, { texto: '', opciones: ['', ''], correcta: 0 }]
    })

  const eliminarPregunta = (index) =>
    setForm({
      ...form,
      preguntas: form.preguntas.filter((_, i) => i !== index)
    })

  const agregarOpcion = (index) => {
    const nuevas = [...form.preguntas]
    nuevas[index].opciones.push('')
    setForm({ ...form, preguntas: nuevas })
  }

  const eliminarOpcion = (indexPregunta, indexOpcion) => {
    const nuevas = [...form.preguntas]
    if (nuevas[indexPregunta].opciones.length <= 2) return
    nuevas[indexPregunta].opciones = nuevas[indexPregunta].opciones.filter((_, i) => i !== indexOpcion)
    if (nuevas[indexPregunta].correcta === indexOpcion) nuevas[indexPregunta].correcta = 0
    if (nuevas[indexPregunta].correcta > indexOpcion) nuevas[indexPregunta].correcta--
    setForm({ ...form, preguntas: nuevas })
  }

  const actualizarPregunta = (index, campo, valor) => {
    const nuevas = [...form.preguntas]
    nuevas[index][campo] = valor
    setForm({ ...form, preguntas: nuevas })
  }

  const actualizarOpcion = (index, iOpcion, valor) => {
    const nuevas = [...form.preguntas]
    nuevas[index].opciones[iOpcion] = valor
    setForm({ ...form, preguntas: nuevas })
  }

  const guardarQuiz = async () => {
    if (!form.leccionId || form.preguntas.length === 0) return alert('Selecciona una lección y crea al menos una pregunta.')
    if (editando) {
      await onGuardar({ ...form, id: quizEditando.id })
      setEditando(false)
      onCancelarEdicion()
    } else {
      await onGuardar(form)
    }
    setForm({
      leccionId: '',
      puntos: 0,
      minCorrectas: 1,
      preguntas: [{ texto: '', opciones: ['', ''], correcta: 0 }]
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {editando ? 'Editar evaluación' : 'Crear nueva evaluación'}
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#F40009] mb-4 flex items-center gap-2">
          <FileQuestion size={20} /> Datos del cuestionario
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lección asociada *</label>
            <select
              value={form.leccionId}
              onChange={(e) => setForm({ ...form, leccionId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 bg-white"
            >
              <option value="">Selecciona una lección</option>
              {lecciones.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Star size={16} className="text-[#F40009]" /> Puntos por aprobar
            </label>
            <input
              type="number"
              min={0}
              value={form.puntos}
              onChange={(e) => setForm({ ...form, puntos: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Respuestas mínimas para aprobar</label>
            <input
              type="number"
              min={1}
              value={form.minCorrectas}
              onChange={(e) => setForm({ ...form, minCorrectas: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#F40009] mb-4 flex items-center gap-2">
          <ClipboardList size={20} /> Preguntas del quiz
        </h3>

        {form.preguntas.map((p, index) => (
          <div key={index} className="border border-gray-200 p-4 rounded-lg mb-6 bg-gray-50 relative shadow-sm">
            <button onClick={() => eliminarPregunta(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>

            <label className="block text-sm font-semibold text-gray-700 mb-2">Pregunta {index + 1}</label>
            <input
              type="text"
              value={p.texto}
              onChange={(e) => actualizarPregunta(index, 'texto', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 mb-3"
              placeholder="Escribe la pregunta..."
            />

            {p.opciones.map((op, iOpcion) => (
              <div key={iOpcion} className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  name={`correcta-${index}`}
                  checked={p.correcta === iOpcion}
                  onChange={() => actualizarPregunta(index, 'correcta', iOpcion)}
                  className="text-[#F40009]"
                />
                <input
                  type="text"
                  value={op}
                  onChange={(e) => actualizarOpcion(index, iOpcion, e.target.value)}
                  placeholder={`Opción ${iOpcion + 1}`}
                  className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                />
                <button
                  onClick={() => eliminarOpcion(index, iOpcion)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button onClick={() => agregarOpcion(index)} className="text-[#F40009] text-sm font-medium mt-1">
              + Agregar opción
            </button>
          </div>
        ))}

        <button onClick={agregarPregunta} className="flex items-center text-[#F40009] font-medium mt-3">
          <Plus size={18} className="mr-1" /> Agregar pregunta
        </button>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        {editando && (
          <button
            onClick={onCancelarEdicion}
            className="flex items-center border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100"
          >
            <RotateCcw size={18} className="mr-2" /> Cancelar
          </button>
        )}

        <button
          onClick={guardarQuiz}
          className="flex items-center bg-[#F40009] text-white px-6 py-2 rounded-lg hover:bg-red-700 mb-5"
        >
          <Save size={18} className="mr-2" /> {editando ? 'Guardar cambios' : 'Guardar evaluación'}
        </button>
      </div>
    </motion.div>
  )
}
