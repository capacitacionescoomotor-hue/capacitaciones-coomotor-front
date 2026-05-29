import { useState, useCallback } from 'react'
import { toast } from 'react-toastify'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        let message = errorData?.message || 'Error al iniciar sesión'
        if (message.includes('Invalid credentials'))
          message = 'Correo o contraseña incorrectos'
        throw new Error(message)
      }

      const data = await res.json()

      const userData = {
        id: data.user.id,
        name: data.user.name,
        role: data.user.role,
        foto: data.user.imageUrl || '',
        points: data.user.points ?? 0,
        activo: data.user.activo
      }

      // Guardar en localStorage Y en cookie para que el middleware lo lea
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      document.cookie = `token=${data.access_token}; path=/; max-age=3600; SameSite=Lax`

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'))
      }
      toast.success('Inicio de sesión exitoso')
      return data
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getUserData = useCallback(
    async (userId) => {
      try {
        const token = localStorage.getItem('token')
        if (!token || !userId) return null

        const res = await fetch(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error('Error al obtener datos del usuario')

        const data = await res.json()

        const updatedUser = {
          id: data.id,
          name: data.name,
          role: data.role?.name || data.role,
          foto: data.imageUrl || '',
          points: data.points ?? 0,
          activo: data.activo
        }

        localStorage.setItem('user', JSON.stringify(updatedUser))
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('userUpdated'))
        }
        return updatedUser
      } catch {
        return null
      }
    },
    [API_URL]
  )

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {
    } finally {
      // Limpiar localStorage y cookie
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      document.cookie = 'token=; path=/; max-age=0'
      toast.info('Sesión cerrada correctamente')
      window.location.href = '/'
    }
  }

  return { login, logout, getUserData, loading }
}
