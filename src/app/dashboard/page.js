'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import Footer from '@/components/dashboard/Footer'
import Inicio from './Inicio/Inicio'
import Cursos from './VistaMaterial/VistaCursos/VistaCursos'
import VistaContenidoCurso from './VistaMaterial/VistaContenidoCurso/VistaContenidoCurso'
import Usuarios from './Usuarios/Usuarios'
import GestionContenido from './GestionContenido/GestionContenido'
import Reportes from './Reportes/Reportes'
import Historial from './Historial/Historial'

export default function DashboardPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState('inicio')
  const [selectedCurso, setSelectedCurso] = useState(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    // Verificar sesión
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/')
      return
    }
    setListo(true)

    // Cada vez que el usuario presiona atrás, volver a /dashboard
    const handlePopState = () => {
      router.replace('/dashboard')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [router])

  const renderView = () => {
    switch (activeView) {
      case 'inicio':
        return <Inicio onNavigate={setActiveView} />
      case 'cursos':
        return (
          <Cursos
            onCursoSelect={(curso) => {
              setSelectedCurso(curso)
              setActiveView('curso-viewer')
            }}
          />
        )
      case 'curso-viewer':
        return (
          <VistaContenidoCurso
            curso={selectedCurso}
            onBack={() => setActiveView('cursos')}
          />
        )
      case 'usuarios':
        return <Usuarios />
      case 'agregar':
        return <GestionContenido />
      case 'reportes':
        return <Reportes />
      case 'historial':
        return <Historial onNavigate={setActiveView} />
      default:
        return <Inicio onNavigate={setActiveView} />
    }
  }

  if (!listo) return null

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Header activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-grow p-4 sm:p-8 bg-white transition-all duration-500">
        {renderView()}
      </main>
      <Footer />
    </div>
  )
}
