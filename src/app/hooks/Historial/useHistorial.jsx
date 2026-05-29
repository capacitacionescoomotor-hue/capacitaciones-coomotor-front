import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'

export function useHistorial() {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return { Authorization: `Bearer ${token}` }
  }

  const fetchHistorial = useCallback(async () => {
    try {
      setLoading(true)
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const user = stored ? JSON.parse(stored) : null
      if (!user?.id) return

      const res = await fetch(`${API_URL}/quiz/historial/${user.id}`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Error al obtener historial')
      const data = await res.json()
      setHistorial(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(err.message || 'No se pudo cargar el historial')
    } finally {
      setLoading(false)
    }
  }, [API_URL])

  useEffect(() => { fetchHistorial() }, [fetchHistorial])

  // Auto-refrescar cuando el usuario completa un quiz
  useEffect(() => {
    window.addEventListener('quizCompletado', fetchHistorial)
    return () => window.removeEventListener('quizCompletado', fetchHistorial)
  }, [fetchHistorial])

  // Estadísticas globales del usuario
  const stats = (() => {
    if (!historial.length) return null
    const todasEval = historial.flatMap(g => g.evaluaciones)
    const total = todasEval.length
    const respondidas = todasEval.filter(e => e.respondido).length
    const aprobadas = todasEval.filter(e => e.aprobado).length
    const pendientes = total - respondidas
    const tasaAprobacion = respondidas > 0 ? Math.round((aprobadas / respondidas) * 100) : 0
    return { total, respondidas, aprobadas, pendientes, tasaAprobacion }
  })()

  return { historial, loading, stats, fetchHistorial }
}
