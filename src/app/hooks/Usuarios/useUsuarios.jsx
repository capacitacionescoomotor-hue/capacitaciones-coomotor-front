import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export function useUsuarios() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/users`)
      if (!res.ok) throw new Error('Error al obtener los usuarios')
      const data = await res.json()
      setUsuarios(data)
    } catch (err) {
      toast.error('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  const crearUsuario = async (nuevoUsuario) => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nuevoUsuario.displayName,
          email: nuevoUsuario.email,
          password: nuevoUsuario.password,
          roleId: Number(nuevoUsuario.rolId),
          imageUrl: nuevoUsuario.foto || '',
          etiqueta: nuevoUsuario.etiqueta || '',
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || 'Error al crear el usuario')
      }

      toast.success('Usuario creado exitosamente')
      fetchUsuarios()
    } catch (err) {
      toast.error(err.message || 'No se pudo crear el usuario')
    }
  }

  const editarUsuario = async (usuario) => {
    try {
      const res = await fetch(`${API_URL}/users/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: usuario.displayName,
          email: usuario.email,
          roleId: Number(usuario.rolId),
          imageUrl: usuario.foto || '',
          etiqueta: usuario.etiqueta || '',
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || 'Error al editar el usuario')
      }

      toast.success('Usuario actualizado correctamente')
      fetchUsuarios()
    } catch (err) {
      toast.error(err.message || 'No se pudo editar el usuario')
    }
  }

  const eliminarUsuario = async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar el usuario')
      toast.success('Usuario eliminado correctamente')
      fetchUsuarios()
    } catch (err) {
      toast.error('No se pudo eliminar el usuario')
    }
  }

  const filtrarPorRol = async (rol) => {
    try {
      setLoading(true)
      if (rol === 'Todos') {
        fetchUsuarios()
        return
      }

      const res = await fetch(`${API_URL}/users`)
      if (!res.ok) throw new Error('Error al filtrar usuarios')
      const data = await res.json()

      const filtrados = data.filter((u) =>
        u.role?.name?.toLowerCase() === rol.toLowerCase()
      )
      setUsuarios(filtrados)
    } catch (err) {
      toast.error('No se pudo filtrar por rol')
    } finally {
      setLoading(false)
    }
  }

  const toggleActivo = async (usuario) => {
    try {
      const res = await fetch(`${API_URL}/users/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !usuario.activo }),
      })
      if (!res.ok) throw new Error('Error al cambiar estado del usuario')
      toast.success(
        `Usuario ${!usuario.activo ? 'activado' : 'desactivado'} correctamente`
      )
      fetchUsuarios()
    } catch {
      toast.error('No se pudo cambiar el estado del usuario')
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  return {
    usuarios,
    loading,
    fetchUsuarios,
    crearUsuario,
    editarUsuario,
    toggleActivo,
    filtrarPorRol,
  }
}
