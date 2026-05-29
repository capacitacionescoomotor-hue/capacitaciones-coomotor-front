import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { generarReportePDF } from '@/app/utils/reportePDF'

export function useReportes() {
  const [resultados, setResultados] = useState([])
  const [progresosUsuarios, setProgresosUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [descargando, setDescargando] = useState(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return { Authorization: `Bearer ${token}` }
  }

  const fetchTodo = async () => {
    try {
      setLoading(true)
      const [resResultados, resProgresos] = await Promise.all([
        fetch(`${API_URL}/quiz/resultados/todos`, { headers: getHeaders() }),
        fetch(`${API_URL}/quiz/usuarios/progreso`, { headers: getHeaders() }),
      ])
      if (!resResultados.ok) throw new Error('Error al obtener resultados')
      if (!resProgresos.ok) throw new Error('Error al obtener progreso de usuarios')

      const [dataResultados, dataProgresos] = await Promise.all([
        resResultados.json(),
        resProgresos.json(),
      ])

      setResultados(Array.isArray(dataResultados) ? dataResultados : [])
      setProgresosUsuarios(Array.isArray(dataProgresos) ? dataProgresos : [])
    } catch (err) {
      toast.error(err.message || 'No se pudieron cargar los reportes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTodo() }, [])

  // Escuchar cuando un usuario completa un quiz
  useEffect(() => {
    window.addEventListener('quizCompletado', fetchTodo)
    return () => window.removeEventListener('quizCompletado', fetchTodo)
  }, [])

  const stats = (() => {
    if (!resultados.length && !progresosUsuarios.length) return null

    const total = resultados.length
    const aprobados = resultados.filter(r => r.aprobado).length
    const reprobados = total - aprobados
    const tasaAprobacion = total > 0 ? Math.round((aprobados / total) * 100) : 0
    const promedioCorrectasPct = total > 0 ? Math.round(
      resultados.reduce((acc, r) => acc + (r.totalPreguntas > 0 ? (r.correctas / r.totalPreguntas) * 100 : 0), 0) / total
    ) : 0
    const usuariosUnicos = [...new Set(resultados.map(r => r.usuario.id))].length
    const totalUsuarios = progresosUsuarios.length
    const usuariosSinActividad = progresosUsuarios.filter(u => u.respondidos === 0).length

    const porCurso = resultados.reduce((acc, r) => {
      const k = r.evaluacion.cursoTitulo
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})
    const cursoMasActivo = Object.entries(porCurso).sort((a, b) => b[1] - a[1])[0]

    const aprobacionPorCurso = Object.entries(
      resultados.reduce((acc, r) => {
        const k = r.evaluacion.cursoTitulo
        if (!acc[k]) acc[k] = { total: 0, aprobados: 0 }
        acc[k].total++
        if (r.aprobado) acc[k].aprobados++
        return acc
      }, {})
    ).map(([curso, v]) => ({
      curso, total: v.total, aprobados: v.aprobados,
      tasa: Math.round((v.aprobados / v.total) * 100),
    })).sort((a, b) => b.total - a.total)

    const porDia = resultados.slice(0, 30).reduce((acc, r) => {
      const d = new Date(r.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
      if (!acc[d]) acc[d] = { total: 0, aprobados: 0 }
      acc[d].total++
      if (r.aprobado) acc[d].aprobados++
      return acc
    }, {})

    const porUsuario = Object.entries(
      resultados.reduce((acc, r) => {
        const k = r.usuario.id
        if (!acc[k]) acc[k] = { name: r.usuario.name, email: r.usuario.email, total: 0, aprobados: 0 }
        acc[k].total++
        if (r.aprobado) acc[k].aprobados++
        return acc
      }, {})
    ).map(([, v]) => ({ ...v, tasa: Math.round((v.aprobados / v.total) * 100) }))
      .sort((a, b) => b.total - a.total).slice(0, 5)

    return {
      total, aprobados, reprobados, tasaAprobacion,
      promedioCorrectasPct, usuariosUnicos,
      totalUsuarios, usuariosSinActividad,
      cursoMasActivo, aprobacionPorCurso, porDia, porUsuario,
    }
  })()

  const desbloquearEvaluacion = async (userId, quizId) => {
    try {
      const res = await fetch(`${API_URL}/quiz/resultado/${userId}/${quizId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Error al desbloquear la evaluación')
      }
      toast.success('Evaluación desbloqueada. El usuario puede volver a intentarla.')
      await fetchTodo()
    } catch (err) {
      toast.error(err.message || 'No se pudo desbloquear la evaluación')
    }
  }

  const descargarReporte = async (usuarioProgreso) => {
    try {
      setDescargando(usuarioProgreso.id)
      const res = await fetch(`${API_URL}/quiz/historial/${usuarioProgreso.id}`, { headers: getHeaders() })
      if (!res.ok) throw new Error('No se pudo obtener el historial del usuario')
      const historial = await res.json()
      await generarReportePDF(usuarioProgreso, historial, usuarioProgreso)
    } catch (err) {
      toast.error(err.message || 'Error al generar el reporte')
    } finally {
      setDescargando(null)
    }
  }

  return { resultados, progresosUsuarios, loading, descargando, stats, fetchTodo, descargarReporte, desbloquearEvaluacion }
}
