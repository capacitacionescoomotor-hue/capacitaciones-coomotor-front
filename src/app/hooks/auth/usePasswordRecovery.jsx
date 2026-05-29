import { useState } from 'react'
import { toast } from 'react-toastify'

export default function usePasswordRecovery() {
  const [loading, setLoading] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const sendCode = async (email) => {
    setLoading(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const res = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal
      }).catch(err => {
        throw new Error("No se pudo conectar con el servidor")
      })

      clearTimeout(timeout)

      let data = null
      try {
        data = await res.json()
      } catch {
        throw new Error("Respuesta inválida del servidor")
      }

      if (!res.ok) {
        throw new Error(data?.message || 'Error al enviar código')
      }

      toast.success('Código enviado a tu correo')
      return true

    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (email, code) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/users/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Código incorrecto')

      toast.success('Código verificado')
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email, code, newPassword, confirmPassword) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword, confirmPassword })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Error al cambiar contraseña')

      toast.success('Contraseña actualizada correctamente')
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { sendCode, verifyCode, resetPassword, loading }
}