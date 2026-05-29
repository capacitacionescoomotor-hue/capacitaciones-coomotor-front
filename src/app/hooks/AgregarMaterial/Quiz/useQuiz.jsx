import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export function useQuiz() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const obtenerQuizzes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/quiz`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setQuizzes(Array.isArray(data) ? data : [])
    } catch {
      toast.error('No se pudieron cargar las evaluaciones')
    } finally {
      setLoading(false)
    }
  }

  const crearQuiz = async (form) => {
    setLoading(true)
    try {
      const payload = {
        leccionId: Number(form.leccionId),
        puntos: Number(form.puntos ?? 0),
        minCorrectas: Number(form.minCorrectas),
        preguntas: Array.isArray(form.preguntas)
          ? form.preguntas.map((p) => ({
              texto: p.texto?.trim(),
              opciones: p.opciones.map((texto, i) => ({
                texto: texto?.trim(),
                correcta: p.correcta === i,
              })),
            }))
          : [],
      }

      const res = await fetch(`${API_URL}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success('Evaluación creada correctamente')
      await obtenerQuizzes()
    } catch {
      toast.error('No se pudo crear la evaluación')
    } finally {
      setLoading(false)
    }
  }

  const editarQuiz = async (id, form) => {
    setLoading(true)
    try {
      const payload = {
        leccionId: Number(form.leccionId),
        puntos: Number(form.puntos ?? 0),
        minCorrectas: Number(form.minCorrectas),
        preguntas: Array.isArray(form.preguntas)
          ? form.preguntas.map((p) => ({
              texto: p.texto?.trim(),
              opciones: p.opciones.map((texto, i) => ({
                texto: texto?.trim(),
                correcta: p.correcta === i,
              })),
            }))
          : [],
      }

      const res = await fetch(`${API_URL}/quiz/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success('Evaluación actualizada correctamente')
      await obtenerQuizzes()
    } catch {
      toast.error('No se pudo actualizar la evaluación')
    } finally {
      setLoading(false)
    }
  }

  const eliminarQuiz = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/quiz/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      toast.info('Evaluación eliminada correctamente')
      await obtenerQuizzes()
    } catch {
      toast.error('No se pudo eliminar la evaluación')
    } finally {
      setLoading(false)
    }
  }

  const enviarRespuestasQuiz = async (quizId, userId, respuestas) => {
    try {
      const payload = {
        userId,
        answers: respuestas.map((r) => ({
          preguntaId: r.preguntaId,
          opcionId: r.opcionId,
        })),
      }

      const res = await fetch(`${API_URL}/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Error al enviar respuestas')

      toast.success(`✅ Respuestas enviadas. ${data.message || 'Puntos asignados correctamente.'}`)
      return data
    } catch {
      toast.error('No se pudieron enviar las respuestas')
      return null
    }
  }

  const obtenerResultadoQuiz = async (quizId, userId) => {
    try {
      const res = await fetch(`${API_URL}/quiz/resultado/${userId}/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  useEffect(() => {
    obtenerQuizzes()
  }, [])

  return {
    quizzes,
    loading,
    obtenerQuizzes,
    crearQuiz,
    editarQuiz,
    eliminarQuiz,
    enviarRespuestasQuiz,
    obtenerResultadoQuiz,
  }
}