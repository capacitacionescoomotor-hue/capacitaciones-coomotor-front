import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export function useLeccion() {
  const [lecciones, setLecciones] = useState([])
  const [leccion, setLeccion] = useState(null)
  const [loading, setLoading] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const obtenerLecciones = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/leccion`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Error al obtener lecciones')
      const data = await res.json()
      setLecciones(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(err.message || 'Error al cargar lecciones')
    } finally {
      setLoading(false)
    }
  }

  const obtenerLeccionPorId = async (id) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/leccion/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Error al obtener lección')
      const data = await res.json()
      setLeccion(data)
      return data
    } catch (err) {
      toast.error(err.message || 'Error al obtener lección')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Acepta FormData directamente (con archivos) o un objeto plano
  const crearLeccion = async (payload) => {
    try {
      const isFormData = payload instanceof FormData
      const res = await fetch(`${API_URL}/leccion`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        body: isFormData ? payload : JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al crear lección')
      toast.success('Lección creada correctamente')
      await obtenerLecciones()
    } catch (err) {
      toast.error(err.message || 'Error al crear lección')
    }
  }

  const editarLeccion = async (id, payload) => {
    try {
      const isFormData = payload instanceof FormData
      const res = await fetch(`${API_URL}/leccion/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        body: isFormData ? payload : JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al actualizar lección')
      toast.success('Lección actualizada correctamente')
      await obtenerLecciones()
    } catch (err) {
      toast.error(err.message || 'Error al actualizar lección')
    }
  }

  const eliminarLeccion = async (id) => {
    try {
      const res = await fetch(`${API_URL}/leccion/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Error al eliminar lección')
      toast.success('Lección eliminada correctamente')
      await obtenerLecciones()
    } catch (err) {
      toast.error(err.message || 'Error al eliminar lección')
    }
  }

  useEffect(() => { obtenerLecciones() }, [])

  return { lecciones, leccion, loading, obtenerLecciones, obtenerLeccionPorId, crearLeccion, editarLeccion, eliminarLeccion }
}
