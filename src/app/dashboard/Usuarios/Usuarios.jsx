'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import FiltroUsuarios from './FiltroUsuarios'
import TablaUsuarios from './TablaUsuarios'
import ModalUsuarios from './ModalUsuarios'
import { useUsuarios } from '@/app/hooks/Usuarios/useUsuarios'

export default function Usuarios() {
  const {
    usuarios,
    crearUsuario,
    editarUsuario,
    toggleActivo,
    filtrarPorRol,
    fetchUsuarios,
  } = useUsuarios()

  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('Todos')
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const roles = { 1: 'Admin', 2: 'User' }

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = filtroRol === 'Todos' || roles[u.role?.id] === filtroRol
    const coincideBusqueda =
      u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.etiqueta || '').toLowerCase().includes(busqueda.toLowerCase())
    return coincideRol && coincideBusqueda
  })

  const handleGuardarUsuario = async (usuario) => {
    if (usuario.id) {
      await editarUsuario(usuario)
    } else {
      await crearUsuario(usuario)
    }
    setModalOpen(false)
    setUsuarioEditando(null)
    fetchUsuarios()
  }

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl sm:text-3xl font-bold text-[#0266ff] mb-6 sm:mb-8"
      >
        Gestión de Usuarios
      </motion.h1>

      <FiltroUsuarios
        onBuscar={setBusqueda}
        onFiltrar={(rol) => {
          setFiltroRol(rol)
          filtrarPorRol(rol)
        }}
        onAgregar={() => {
          setUsuarioEditando(null)
          setModalOpen(true)
        }}
      />

      <TablaUsuarios
        usuarios={usuariosFiltrados}
        onEditar={handleEditar}
        onToggleActivo={toggleActivo}
      />

      {modalOpen && (
        <ModalUsuarios
          onClose={() => {
            setModalOpen(false)
            setUsuarioEditando(null)
          }}
          onGuardar={handleGuardarUsuario}
          usuario={usuarioEditando}
        />
      )}
    </div>
  )
}