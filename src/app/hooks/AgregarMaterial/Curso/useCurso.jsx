import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export function useCurso() {
  const [cursos, setCursos] = useState([])
  const [curso, setCurso] = useState(null)
  const [loading, setLoading] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const handleUnauthorized = (res) => {
    if (res.status === 401 || res.status === 403) {
      toast.error('Sesión expirada. Inicia sesión nuevamente.')
      localStorage.removeItem('token')
      window.location.href = '/'
      return true
    }
    return false
  }

  const obtenerCursos = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/cursos`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error('Error al obtener cursos')
      const data = await res.json()
      setCursos(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(err.message || 'Error al cargar los cursos')
    } finally {
      setLoading(false)
    }
  }

  const obtenerCursoPorId = async (id) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/cursos/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (handleUnauthorized(res)) return null
      if (!res.ok) throw new Error('Error al obtener curso')
      const data = await res.json()
      setCurso(data)
      return data
    } catch (err) {
      toast.error(err.message || 'Error al obtener curso')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Acepta FormData o un objeto plano
  const crearCurso = async (payload) => {
    try {
      const isFormData = payload instanceof FormData
      const res = await fetch(`${API_URL}/cursos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        body: isFormData ? payload : JSON.stringify(payload),
      })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error('Error al crear curso')
      toast.success('Curso creado correctamente')
      await obtenerCursos()
    } catch (err) {
      toast.error(err.message || 'Error al crear el curso')
    }
  }

  const editarCurso = async (id, payload) => {
    try {
      const isFormData = payload instanceof FormData
      const res = await fetch(`${API_URL}/cursos/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        body: isFormData ? payload : JSON.stringify(payload),
      })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error('Error al actualizar curso')
      toast.success('Curso actualizado correctamente')
      await obtenerCursos()
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el curso')
    }
  }

  const eliminarCurso = async (id) => {
    try {
      const res = await fetch(`${API_URL}/cursos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error('Error al eliminar curso')
      toast.success('Curso eliminado correctamente')
      await obtenerCursos()
    } catch (err) {
      toast.error(err.message || 'Error al eliminar el curso')
    }
  }

  useEffect(() => { obtenerCursos() }, [])

  return { cursos, curso, loading, obtenerCursos, obtenerCursoPorId, crearCurso, editarCurso, eliminarCurso }
}
