import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export function useProgreso() {
  const [cursos, setCursos] = useState([])
  const [modulos, setModulos] = useState([])
  const [lecciones, setLecciones] = useState([])
  const [loading, setLoading] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const obtenerProgresos = async () => {
    try {
      setLoading(true)
      const [resCursos, resModulos, resLecciones] = await Promise.all([
        fetch(`${API_URL}/cursos/me/progreso`, { headers }),
        fetch(`${API_URL}/modulos/me/progreso`, { headers }),
        fetch(`${API_URL}/leccion/me/progreso`, { headers }),
      ])

      if (!resCursos.ok || !resModulos.ok || !resLecciones.ok) {
        throw new Error('Error al obtener progreso del usuario')
      }

      const [dataCursos, dataModulos, dataLecciones] = await Promise.all([
        resCursos.json(),
        resModulos.json(),
        resLecciones.json(),
      ])

      setCursos(Array.isArray(dataCursos) ? dataCursos : [])
      setModulos(Array.isArray(dataModulos) ? dataModulos : [])
      setLecciones(Array.isArray(dataLecciones) ? dataLecciones : [])
    } catch (err) {
      toast.error(err.message || 'Error al cargar el progreso')
    } finally {
      setLoading(false)
    }
  }

  const actualizarProgreso = async (tipo, id, progress) => {
    try {
      let endpoint = ''
      if (tipo === 'curso') endpoint = `${API_URL}/cursos/${id}/progreso`
      else if (tipo === 'modulo') endpoint = `${API_URL}/modulos/${id}/progreso`
      else if (tipo === 'leccion') endpoint = `${API_URL}/leccion/${id}/progreso`
      else throw new Error('Tipo de progreso no válido')

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ progress }),
      })

      if (!res.ok) {
        const e = await res.json().catch(() => null)
        throw new Error(e?.message || 'Error al actualizar progreso')
      }

      const data = await res.json()
      await obtenerProgresos()

      if (data.awardedPoints > 0) {
        toast.success(`🎉 ¡Has ganado ${data.awardedPoints} puntos!`)
      } else if (progress === 100) {
        toast.success('✅ ¡Progreso completado!')
      }

      return data
    } catch (err) {
      toast.error(err.message || 'Error al actualizar progreso')
      return null
    }
  }

  useEffect(() => {
    if (token) obtenerProgresos()
  }, [token])

  return {
    cursos,
    modulos,
    lecciones,
    loading,
    obtenerProgresos,
    actualizarProgreso,
  }
}