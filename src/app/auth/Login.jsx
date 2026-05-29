'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, Eye, EyeOff, Mail, ShieldCheck, CheckCircle, XCircle } from 'lucide-react'
import { useLogin } from '@/app/hooks/auth/useLogin'
import usePasswordRecovery from '@/app/hooks/auth/usePasswordRecovery'

export default function Login() {
  const { login, loading: loginLoading } = useLogin()
  const { sendCode, verifyCode, resetPassword, loading: recoveryLoading } = usePasswordRecovery()

  const [view, setView] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const loading = loginLoading || recoveryLoading

  const requirements = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    symbol: /[^A-Za-z0-9]/.test(newPassword),
  }
  const strengthScore = Object.values(requirements).filter(Boolean).length
  const strengthColors = { 0: '#cbd5e1', 1: '#93c5fd', 2: '#60a5fa', 3: '#3b82f6', 4: '#22c55e' }
  const strengthLabels = { 0: 'Muy débil', 1: 'Débil', 2: 'Media', 3: 'Buena', 4: 'Fuerte' }

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result) window.location.href = '/dashboard'
  }
  const handleSendCode = async (e) => {
    e.preventDefault()
    const ok = await sendCode(email)
    if (ok) setView('verify')
  }
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    const ok = await verifyCode(email, resetCode)
    if (ok) setView('reset')
  }
  const handleResetPassword = async (e) => {
    e.preventDefault()
    const ok = await resetPassword(email, resetCode, newPassword, confirmPassword)
    if (ok) { setResetCode(''); setNewPassword(''); setConfirmPassword(''); setView('login') }
  }

  const variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  }

  const titles = {
    login: { title: 'Bienvenido de nuevo', sub: 'Ingresa tus credenciales para continuar' },
    forgot: { title: 'Recuperar contraseña', sub: 'Te enviaremos un código a tu correo' },
    verify: { title: 'Verifica tu correo', sub: `Código enviado a ${email}` },
    reset: { title: 'Nueva contraseña', sub: 'Elige una contraseña segura' },
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-end overflow-hidden">

      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Img/login.jpeg"
          alt="Coomotor"
          className="w-full h-full object-cover"
        />
        {/* Overlay degradado de izquierda a derecha */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Texto hero lado izquierdo */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center px-10 md:px-16 z-10 max-w-xl hidden md:flex">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
            Plataforma de<br />Formación
          </h1>
          <p className="text-white/80 text-lg leading-relaxed drop-shadow">
            Desarrolla tus habilidades profesionales<br />con el Grupo Coomotor.
          </p>
        </motion.div>
      </div>

      {/* Panel formulario derecho */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4 sm:mx-6 md:mr-12 lg:mr-20"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">

          {/* Franja superior azul */}
          <div className="bg-gradient-to-r from-[#0044bb] to-[#0266ff] px-8 py-6">
            <img src="/Img/logo-coomotor.png" alt="Coomotor" className="h-8 object-contain mb-3 md:hidden" />
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-white font-bold text-xl">{titles[view].title}</p>
                <p className="text-white/70 text-sm mt-0.5">{titles[view].sub}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div key={view} variants={variants} initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.25 }}>

                {/* ── LOGIN ── */}
                {view === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="Correo electrónico" required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0266ff] focus:ring-2 focus:ring-[#0266ff]/20 transition-all" />
                      </div>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="Contraseña" required
                          className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0266ff] focus:ring-2 focus:ring-[#0266ff]/20 transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0266ff] transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-[#0044bb] to-[#0266ff] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-60">
                      {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                      {!loading && <ArrowRight size={16} />}
                    </motion.button>
                  </form>
                )}

                {/* ── FORGOT ── */}
                {view === 'forgot' && (
                  <form onSubmit={handleSendCode} className="space-y-5">
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Correo electrónico" required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0266ff] focus:ring-2 focus:ring-[#0266ff]/20 transition-all" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-[#0044bb] to-[#0266ff] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60">
                      {loading ? 'Enviando...' : 'Enviar código'} {!loading && <ArrowRight size={16} />}
                    </motion.button>
                    <button type="button" onClick={() => setView('login')}
                      className="w-full text-xs text-gray-400 hover:text-[#0266ff] transition-colors text-center">
                      ← Volver al inicio de sesión
                    </button>
                  </form>
                )}

                {/* ── VERIFY ── */}
                {view === 'verify' && (
                  <form onSubmit={handleVerifyCode} className="space-y-5">
                    <div className="relative">
                      <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" maxLength={6} value={resetCode} onChange={e => setResetCode(e.target.value)}
                        placeholder="Código de 6 dígitos" required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0266ff] focus:ring-2 focus:ring-[#0266ff]/20 tracking-widest transition-all" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-[#0044bb] to-[#0266ff] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60">
                      {loading ? 'Verificando...' : 'Verificar código'} {!loading && <ArrowRight size={16} />}
                    </motion.button>
                    <button type="button" onClick={() => setView('forgot')}
                      className="w-full text-xs text-gray-400 hover:text-[#0266ff] transition-colors text-center">
                      ← Reenviar código
                    </button>
                  </form>
                )}

                {/* ── RESET ── */}
                {view === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="Nueva contraseña" required
                        className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0266ff] focus:ring-2 focus:ring-[#0266ff]/20 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0266ff]">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Barra fortaleza */}
                    {newPassword && (
                      <div>
                        <div className="flex gap-1 mb-1.5">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                              style={{ backgroundColor: i <= strengthScore ? strengthColors[strengthScore] : '#e2e8f0' }} />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: strengthColors[strengthScore] }}>
                          {strengthLabels[strengthScore]}
                        </p>
                        <div className="grid grid-cols-2 gap-0.5 mt-2">
                          {[
                            { label: 'Mín. 8 caracteres', ok: requirements.length },
                            { label: 'Una mayúscula', ok: requirements.uppercase },
                            { label: 'Un número', ok: requirements.number },
                            { label: 'Un símbolo', ok: requirements.symbol },
                          ].map((r, i) => (
                            <div key={i} className="flex items-center gap-1">
                              {r.ok ? <CheckCircle size={11} className="text-green-500" /> : <XCircle size={11} className="text-gray-300" />}
                              <span className={`text-xs ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>{r.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar contraseña" required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0266ff] focus:ring-2 focus:ring-[#0266ff]/20 transition-all" />
                    </div>

                    {confirmPassword && (
                      <div className="flex items-center gap-1.5">
                        {confirmPassword === newPassword
                          ? <><CheckCircle size={13} className="text-green-500" /><span className="text-xs text-green-600">Las contraseñas coinciden</span></>
                          : <><XCircle size={13} className="text-gray-300" /><span className="text-xs text-gray-400">No coinciden aún</span></>}
                      </div>
                    )}

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-[#0044bb] to-[#0266ff] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60">
                      {loading ? 'Guardando...' : 'Cambiar contraseña'} {!loading && <ArrowRight size={16} />}
                    </motion.button>
                    <button type="button" onClick={() => setView('login')}
                      className="w-full text-xs text-gray-400 hover:text-[#0266ff] transition-colors text-center">
                      ← Volver al inicio de sesión
                    </button>
                  </form>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer del panel */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Grupo Coomotor · Todos los derechos reservados</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
