'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { useLogin } from '@/app/hooks/auth/useLogin'

export default function Header({ activeView, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [usuarioActivo, setUsuarioActivo] = useState(null)
  const { logout, getUserData } = useLogin()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUsuarioActivo(JSON.parse(userData))
  }, [])

  const refrescarUsuario = useCallback(async () => {
    const stored = localStorage.getItem('user')
    const parsed = stored ? JSON.parse(stored) : null
    if (!parsed?.id) return
    const updated = await getUserData(parsed.id)
    if (updated) {
      localStorage.setItem('user', JSON.stringify(updated))
      window.dispatchEvent(new Event('userUpdated'))
      setUsuarioActivo(updated)
    }
  }, [getUserData])

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem('user')
      if (stored) setUsuarioActivo(JSON.parse(stored))
    }
    window.addEventListener('storage', sync)
    window.addEventListener('userUpdated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('userUpdated', sync)
    }
  }, [])

  useEffect(() => {
    refrescarUsuario()
    const interval = setInterval(refrescarUsuario, 30000)
    return () => clearInterval(interval)
  }, [refrescarUsuario])

  const baseMenu = [
    { label: 'Inicio', value: 'inicio' },
    { label: 'Cursos', value: 'cursos' },
    { label: 'Historial', value: 'historial' },
  ]
  const adminMenu = [
    { label: 'Usuarios', value: 'usuarios' },
    { label: 'Agregar Material', value: 'agregar' },
    { label: 'Reportes', value: 'reportes' },
  ]
  const menuItems = usuarioActivo?.role === 'admin' ? [...baseMenu, ...adminMenu] : baseMenu

  const handleNav = (value) => {
    onNavigate(value)
    setMobileOpen(false)
    setMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3">

        {/* Logo */}
        <img src="/Img/coomotor.png" alt="Coomotor" className="h-15 w-auto object-contain" />

        {/* Nav escritorio */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNav(item.value)}
              className={`text-sm pb-0.5 font-medium transition-colors ${
                activeView === item.value
                  ? 'text-[#0266ff] border-b-2 border-[#0266ff]'
                  : 'text-gray-600 hover:text-[#0266ff]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Derecha */}
        <div className="flex items-center gap-3">
          {/* Usuario escritorio */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-xl transition-all"
            >
              {usuarioActivo?.foto ? (
                <img src={usuarioActivo.foto} alt={usuarioActivo.name} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0266ff]/10 flex items-center justify-center text-sm font-bold text-[#0266ff]">
                  {usuarioActivo?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="text-left hidden lg:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">{usuarioActivo?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{usuarioActivo?.role || ''}</p>
              </div>
              <ChevronDown size={15} className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} className="text-red-500" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {mobileOpen ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {/* Info usuario mobile */}
          <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
            {usuarioActivo?.foto ? (
              <img src={usuarioActivo.foto} alt={usuarioActivo.name} className="w-9 h-9 rounded-full border border-gray-200 object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#0266ff]/10 flex items-center justify-center text-sm font-bold text-[#0266ff]">
                {usuarioActivo?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800">{usuarioActivo?.name || 'Usuario'}</p>
              <p className="text-xs text-gray-400 capitalize">{usuarioActivo?.role || ''}</p>
            </div>
          </div>

          {/* Links */}
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNav(item.value)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeView === item.value
                  ? 'bg-[#0266ff]/10 text-[#0266ff]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Logout mobile */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      )}
    </header>
  )
}
