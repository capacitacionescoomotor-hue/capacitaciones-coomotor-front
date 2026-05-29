'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Plus, Trash2, Gift, Pencil } from 'lucide-react'
import { toast } from 'react-toastify'
import { usePremios } from '@/app/hooks/Premios/usePremios'
import { useLogin } from '@/app/hooks/auth/useLogin'
import ModalEliminar from './ModalEliminar'
import ModalCrearPremio from './ModalCrearPremio'
import ModalTerminos from './ModalTerminos'

export default function Premios() {
  const [vista, setVista] = useState('disponibles')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTerminosOpen, setModalTerminosOpen] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [premioEditando, setPremioEditando] = useState(null)
  const [confirmState, setConfirmState] = useState({ open: false, type: null, premio: null })

  const { getUserData } = useLogin()
  const {
    premios,
    canjeados,
    canjesGlobales,
    obtenerPremios,
    obtenerCanjeados,
    obtenerCanjesGlobales,
    canjearPremio,
    crearPremio,
    actualizarPremio,
    eliminarPremio
  } = usePremios()

  const cargarUsuario = async () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const obj = stored ? JSON.parse(stored) : null
    if (!obj?.id) return
    const data = await getUserData(obj.id)
    if (data) setUsuario(data)
  }

  useEffect(() => {
    cargarUsuario()
  }, [])

  useEffect(() => {
    if (usuario?.id) {
      obtenerPremios()
      obtenerCanjeados(usuario.id)
      if (usuario.role === 'admin') obtenerCanjesGlobales()
    }
  }, [usuario])

  const handleCanjear = async (premio) => {
    if (!usuario?.id) return
    if (usuario.role === 'admin') {
      toast.error('No puedes canjear premios porque eres administrador.')
      return
    }
    const yaCanjeado = canjeados.some((c) => c.premioId === premio.id)
    if (yaCanjeado) {
      toast.warn('Ya has canjeado este premio y no puedes volver a canjearlo.')
      return
    }
    const res = await canjearPremio(usuario.id, premio.id)
    if (res && res.id) {
      toast.success('Premio canjeado con éxito')
      await Promise.all([
        obtenerPremios(),
        obtenerCanjeados(usuario.id),
        usuario.role === 'admin' ? obtenerCanjesGlobales() : Promise.resolve(),
        cargarUsuario()
      ])
    } else {
      toast.error('Hubo un error al canjear el premio.')
    }
  }

  const handleEliminar = async (premio) => {
    await eliminarPremio(premio.id)
    toast.success('Premio eliminado correctamente')
    obtenerPremios()
    if (usuario?.role === 'admin') obtenerCanjesGlobales()
  }

  const formatFecha = (fecha) => {
    if (!fecha) return '-'
    const d = new Date(fecha)
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const formatFechaHora = (fecha) => {
    if (!fecha) return '-'
    const d = new Date(fecha)
    return d.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const renderPremios = (listaRaw, permitirCanje) => {
    const lista = Array.isArray(listaRaw) ? listaRaw : []

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
        {lista.map((premio) => (
          <motion.div
            key={premio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(0,0,0,0.12)' }}
            className="bg-white rounded-2xl shadow-md border border-red-100 p-6 flex flex-col justify-between"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-full h-44 rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-50 mb-4">
                <img src={premio.img} alt={premio.nombre} className="w-full h-full object-cover" />
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-1">{premio.nombre}</h3>

              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins size={18} className="text-[#0266ff]" />
                <span className="text-[#0266ff] font-semibold">{premio.puntos} puntos</span>
              </div>

              <div className="mt-2 w-full space-y-1 text-sm text-gray-700">
                <p className="flex justify-between">
                  <span className="text-gray-500">Cantidad disponible:</span>
                  <span className="font-semibold">{premio.cantidad}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Fecha límite:</span>
                  <span className="font-semibold">{formatFecha(premio.fechaLimite)}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              {usuario?.role === 'admin' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPremioEditando(premio)
                      setModalOpen(true)
                    }}
                    className="px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-1 text-sm"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmState({ open: true, type: 'eliminar', premio })}
                    className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1 text-sm"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              )}

              {permitirCanje && usuario?.role !== 'admin' && (
                <motion.button
                  onClick={() => setConfirmState({ open: true, type: 'canjear', premio })}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="ml-auto px-5 py-2 rounded-full bg-[#0266ff] text-white text-sm font-semibold shadow hover:bg-blue-700"
                >
                  Canjear
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}

        {lista.length === 0 && (
          <div className="col-span-full text-center py-16 bg-red-50 rounded-2xl mt-4">
            <p className="text-[#0266ff] text-lg font-medium">
              {permitirCanje ? 'No hay premios disponibles.' : 'No tienes premios canjeados.'}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderMisCanjes = () => {
    const lista = Array.isArray(canjeados) ? canjeados : []

    if (lista.length === 0) {
      return (
        <div className="mt-8 col-span-full text-center py-16 bg-red-50 rounded-2xl">
          <p className="text-[#0266ff] text-lg font-medium">No tienes premios canjeados.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
        {lista.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(0,0,0,0.12)' }}
            className="bg-white rounded-2xl shadow-md border border-red-100 p-6 flex flex-col justify-between"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-full h-44 rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-50 mb-4">
                <img src={c.premio?.img} alt={c.premio?.nombre} className="w-full h-full object-cover" />
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-2">{c.premio?.nombre}</h3>

              <div className="mt-2 w-full space-y-2 text-sm text-gray-700">
                <p className="flex justify-between">
                  <span className="text-gray-500">Puntos utilizados:</span>
                  <span className="font-semibold text-[#0266ff]">{c.premio?.puntos} puntos</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Fecha de canje:</span>
                  <span className="font-semibold">{formatFechaHora(c.fechaCanje)}</span>
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const renderHistorialGlobal = () => {
    const lista = Array.isArray(canjesGlobales) ? canjesGlobales : []

    return (
      <div className="mt-8 overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#0266ff] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Imagen</th>
              <th className="px-4 py-3 text-left">Premio</th>
              <th className="px-4 py-3 text-left">Puntos</th>
              <th className="px-4 py-3 text-left">Fecha de canje</th>
            </tr>
          </thead>
          <tbody>
            {lista.length > 0 ? (
              lista.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{c.user?.name || 'Usuario'}</td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                      {c.premio?.img && (
                        <img src={c.premio.img} alt={c.premio?.nombre} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.premio?.nombre || 'Premio'}</td>
                  <td className="px-4 py-3">{c.premio?.puntos ?? '-'}</td>
                  <td className="px-4 py-3">{formatFechaHora(c.fechaCanje)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500 italic">
                  Aún no hay canjes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fff5f5] p-4 sm:p-8 lg:p-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-[#0266ff] flex justify-center items-center gap-3">
          Premios <Gift size={32} className="text-[#0266ff]" />
        </h1>

        {usuario && (
          <p className="text-gray-700 mt-1 flex justify-center items-center gap-2">
            Tus puntos:
            <span className="text-[#0266ff] font-bold">{usuario.points}</span>
            <Coins size={20} className="text-[#0266ff]" />
          </p>
        )}

        <button
          onClick={() => setModalTerminosOpen(true)}
          className="text-sm text-gray-600 underline hover:text-[#0266ff] mt-3"
        >
          Ver términos y condiciones de la tienda
        </button>
      </motion.div>

      {usuario?.role === 'admin' && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              setPremioEditando(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-2 bg-[#0266ff] text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Crear premio
          </button>
        </div>
      )}

      <div className="flex justify-center flex-wrap gap-3 mb-6">
        <button
          onClick={() => setVista('disponibles')}
          className={`px-6 py-2 rounded-full text-sm font-semibold ${vista === 'disponibles' ? 'bg-[#0266ff] text-white' : 'border border-[#0266ff] text-[#0266ff]'}`}
        >
          Premios disponibles
        </button>

        {usuario?.role !== 'admin' && (
          <button
            onClick={() => setVista('misCanjes')}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${vista === 'misCanjes'
                ? 'bg-[#0266ff] text-white'
                : 'border border-[#0266ff] text-[#0266ff]'
              }`}
          >
            Mis canjes
          </button>
        )}

        {usuario?.role === 'admin' && (
          <button
            onClick={() => setVista('historialGlobal')}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${vista === 'historialGlobal' ? 'bg-[#0266ff] text-white' : 'border border-[#0266ff] text-[#0266ff]'}`}
          >
            Historial global
          </button>
        )}
      </div>

      {vista === 'disponibles' &&
        renderPremios(
          premios
            .filter((p) => {
              const hoy = new Date()
              hoy.setHours(0, 0, 0, 0)
              const fechaPremio = new Date(p.fechaLimite)
              fechaPremio.setHours(0, 0, 0, 0)
              return fechaPremio >= hoy
            })
            .filter((p) => !canjeados.some((c) => c.premioId === p.id)),
          true
        )}

      {vista === 'misCanjes' && usuario?.role !== 'admin' && renderMisCanjes()}

      {vista === 'historialGlobal' && usuario?.role === 'admin' && renderHistorialGlobal()}

      {modalOpen && (
        <ModalCrearPremio
          onClose={() => setModalOpen(false)}
          premio={premioEditando}
          onGuardar={async (data) => {
            if (data.id) await actualizarPremio(data.id, data)
            else await crearPremio(data)
            setModalOpen(false)
            obtenerPremios()
            if (usuario?.role === 'admin') obtenerCanjesGlobales()
          }}
        />
      )}

      {modalTerminosOpen && (
        <ModalTerminos
          open={modalTerminosOpen}
          onClose={() => setModalTerminosOpen(false)}
        />
      )}

      {confirmState.open && confirmState.premio && (
        <ModalEliminar
          open={confirmState.open}
          onClose={() => setConfirmState({ open: false, type: null, premio: null })}
          onConfirm={async () => {
            if (confirmState.type === 'canjear') await handleCanjear(confirmState.premio)
            else if (confirmState.type === 'eliminar') await handleEliminar(confirmState.premio)
          }}
          title={confirmState.type === 'canjear' ? '¿Canjear este premio?' : '¿Eliminar este premio?'}
          message={
            confirmState.type === 'canjear'
              ? `Vas a canjear el premio "${confirmState.premio.nombre}". Se descontarán ${confirmState.premio.puntos} puntos de tu saldo.`
              : `Vas a eliminar el premio "${confirmState.premio.nombre}". Esta acción no se puede deshacer.`
          }
          confirmLabel={confirmState.type === 'canjear' ? 'Canjear' : 'Eliminar'}
          cancelLabel="Cancelar"
          variant={confirmState.type === 'canjear' ? 'confirm' : 'danger'}
        />
      )}
    </div>
  )
}