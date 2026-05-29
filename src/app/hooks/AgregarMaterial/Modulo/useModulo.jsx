import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export function useModulo() {
  const [modulos, setModulos] = useState([])
  const [modulo, setModulo] = useState(null)
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

  const obtenerModulos = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/modulos`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error('Error al obtener módulos')
      const data = await res.json()
      setModulos(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(err.message || 'Error al cargar módulos')
    } finally {
      setLoading(false)
    }
  }

  const obtenerModuloPorId = async (id) => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/modulos/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (handleUnauthorized(res)) return null
      if (!res.ok) throw new Error('Error al obtener módulo')
      const data = await res.json()
      setModulo(data)
      return data
    } catch (err) {
      toast.error(err.message || 'Error al obtener módulo')
      return null
    } finally {
      setLoading(false)
    }
  }

  const crearModulo = async (payload) => {
    try {
      const isFormData = payload instanceof FormData
      const res = await fetch(`${API_URL}/modulos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        body: isFormData ? payload : JSON.stringify(payload),
      })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error('Error al crear módulo')
      toast.success('Módulo creado correctamente')
      await obtenerModulos()
    } catch (err) {
      toast.error(err.message || 'Error al crear módulo')
    }
  }

  const editarModulo = async (id, payload) => {
    try {
      const isFormData = payload instanceof FormData
      const res = await fetch(`${API_URL}/modulos/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        body: isFormData ? payload : JSON.stringify(payload),
      })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error('Error al actualizar módulo')
      toast.success('Módulo actualizado correctamente')
      await obtenerModulos()
    } catch (err) {
      toast.error(err.message || 'Error al actualizar módulo')
    }
  }

  const eliminarModulo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/modulos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (handleUnauthorized(res)) return
      if (!res.ok) throw new Error('Error al eliminar módulo')
      toast.success('Módulo eliminado correctamente')
      await obtenerModulos()
    } catch (err) {
      toast.error(err.message || 'Error al eliminar módulo')
    }
  }

  useEffect(() => { obtenerModulos() }, [])

  return { modulos, modulo, loading, obtenerModulos, obtenerModuloPorId, crearModulo, editarModulo, eliminarModulo }
}
