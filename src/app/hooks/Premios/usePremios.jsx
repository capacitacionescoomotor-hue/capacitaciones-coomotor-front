'use client'
import { useState } from 'react'

export function usePremios() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const [premios, setPremios] = useState([])
  const [canjeados, setCanjeados] = useState([])
  const [canjesGlobales, setCanjesGlobales] = useState([])
  const [loading, setLoading] = useState(false)

  const obtenerPremios = async () => {
    setLoading(true)
    const res = await fetch(`${API_URL}/premios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json().catch(() => null)
    const lista = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []

    const hoy = new Date().toISOString().slice(0, 10)
    const filtrados = lista.filter(p => !p.fechaLimite || p.fechaLimite >= hoy)

    setPremios(filtrados)
    setLoading(false)
  }

  const obtenerCanjeados = async (userId) => {
    const res = await fetch(`${API_URL}/premio-usuario/historial/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json().catch(() => null)
    const lista = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []

    const normalizados = lista.map(c => ({
      ...c,
      premioId: c.premioId ?? c.premio?.id ?? null
    }))

    setCanjeados(normalizados)
  }

  const obtenerCanjesGlobales = async () => {
    const res = await fetch(`${API_URL}/premio-usuario`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json().catch(() => null)
    const lista = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []

    const normalizados = lista.map(c => ({
      ...c,
      premioId: c.premioId ?? c.premio?.id ?? null
    }))

    setCanjesGlobales(normalizados)
  }

  const canjearPremio = async (userId, premioId) => {
    const res = await fetch(`${API_URL}/premio-usuario/canjear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: Number(userId),
        premioId: Number(premioId)
      })
    })
    return res.json().catch(() => null)
  }

  const crearPremio = async (premio) => {
    const res = await fetch(`${API_URL}/premios`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: premio.nombre,
        img: premio.img,
        fechaLimite: premio.fechaLimite,
        puntos: Number(premio.puntos),
        cantidad: Number(premio.cantidad)
      })
    })
    return res.json().catch(() => null)
  }

  const actualizarPremio = async (id, premio) => {
    const res = await fetch(`${API_URL}/premios/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: premio.nombre,
        img: premio.img,
        fechaLimite: premio.fechaLimite,
        puntos: Number(premio.puntos),
        cantidad: Number(premio.cantidad)
      })
    })
    return res.json().catch(() => null)
  }

  const eliminarPremio = async (id) => {
    await fetch(`${API_URL}/premios/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  return {
    premios,
    canjeados,
    canjesGlobales,
    loading,
    obtenerPremios,
    obtenerCanjeados,
    obtenerCanjesGlobales,
    canjearPremio,
    crearPremio,
    actualizarPremio,
    eliminarPremio
  }
}