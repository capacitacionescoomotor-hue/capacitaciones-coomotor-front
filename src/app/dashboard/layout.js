'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import Footer from '@/components/dashboard/Footer'
import Inicio from './Inicio/Inicio'
import Cursos from './VistaMaterial/VistaCursos/VistaCursos'
import Modulos from './VistaMaterial/VistaModulos/VistaModulos'
import Lecciones from './VistaMaterial/VistaLecciones/VistaLecciones'
import ContenidoLeccion from './VistaMaterial/VistaLecciones/ContenidoLeccion'
import Usuarios from './Usuarios/Usuarios'
import GestionContenido from './GestionContenido/GestionContenido'
import Reportes from './Reportes/Reportes'
import Historial from './Historial/Historial'

export default function DashboardLayout() {
  const router = useRouter()
  const [activeView, setActiveView] = useState('inicio')
  const [selectedCurso, setSelectedCurso] = useState(null)
  const [selectedModulo, setSelectedModulo] = useState(null)
  const [selectedLeccion, setSelectedLeccion] = useState(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/')
    } else {
      setListo(true)
    }

    const bloquearAtras = () => {
      window.history.pushState(null, '', window.location.href)
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', bloquearAtras)
    return () => window.removeEventListener('popstate', bloquearAtras)
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
              setActiveView('modulos')
            }}
          />
        )
      case 'modulos':
        return (
          <Modulos
            curso={selectedCurso}
            onModuloSelect={(modulo) => {
              setSelectedModulo(modulo)
              setActiveView('lecciones')
            }}
            onBack={() => setActiveView('cursos')}
          />
        )
      case 'lecciones':
        return (
          <Lecciones
            modulo={selectedModulo}
            onLeccionSelect={(leccion) => {
              setSelectedLeccion(leccion)
              setActiveView('contenido')
            }}
            onBack={() => setActiveView('modulos')}
          />
        )
      case 'contenido':
        return (
          <ContenidoLeccion
            leccion={selectedLeccion}
            onBack={() => setActiveView('lecciones')}
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