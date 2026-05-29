'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Layers3, FileText } from 'lucide-react'
import CrearCurso from './Curso/CrearCurso'
import CrearModulo from './Modulo/CrearModulo'
import CrearLeccion from './Leccion/CrearLeccion'
import TablaCursos from './Curso/TablaCursos'
import TablaModulos from './Modulo/TablaModulos'
import TablaLecciones from './Leccion/TablaLecciones'
import CrearQuiz from './Quiz/CrearQuiz'
import TablaQuiz from './Quiz/TablaQuiz'
import { useCurso } from '@/app/hooks/AgregarMaterial/Curso/useCurso'
import { useModulo } from '@/app/hooks/AgregarMaterial/Modulo/useModulo'
import { useLeccion } from '@/app/hooks/AgregarMaterial/Leccion/useLeccion'
import { useQuiz } from '@/app/hooks/AgregarMaterial/Quiz/useQuiz'

export default function AgregarMaterial() {
  const [activeTab, setActiveTab] = useState('curso')
  const { cursos, obtenerCursos, crearCurso, editarCurso, eliminarCurso } = useCurso()
  const { modulos, obtenerModulos, crearModulo, editarModulo, eliminarModulo } = useModulo()
  const { lecciones, obtenerLecciones, crearLeccion, editarLeccion, eliminarLeccion } = useLeccion()
  const { quizzes, obtenerQuizzes, crearQuiz, editarQuiz, eliminarQuiz } = useQuiz()
  const [cursoEditando, setCursoEditando] = useState(null)
  const [moduloEditando, setModuloEditando] = useState(null)
  const [leccionEditando, setLeccionEditando] = useState(null)
  const [quizEditando, setQuizEditando] = useState(null)

  const handleGuardarCurso = async (form) => {
    if (form.id) {
      await editarCurso(form.id, form)
      setCursoEditando(null)
    } else {
      await crearCurso(form)
    }
  }

  const handleGuardarModulo = async (form) => {
    if (form.id) {
      await editarModulo(form.id, form)
      setModuloEditando(null)
    } else {
      await crearModulo(form)
    }
  }

  const handleGuardarLeccion = async (form) => {
    if (form.id) {
      await editarLeccion(form.id, form)
    } else {
      await crearLeccion(form)
    }
    await obtenerLecciones()
    setLeccionEditando(null)
  }

  const handleGuardarQuiz = async (form) => {
    if (form.id) {
      await editarQuiz(form.id, form)
      setQuizEditando(null)
    } else {
      await crearQuiz(form)
    }
    await obtenerQuizzes()
  }

  return (
    <div className="min-h-screen bg-white p-10">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-[#0266ff] mb-8"
      >
        Gestión de Materiales
      </motion.h1>

      <div className="flex space-x-4 border-b border-gray-200 mb-8">
        {[
          { key: 'curso', icon: <BookOpen size={18} />, label: 'Cursos' },
          { key: 'modulo', icon: <Layers3 size={18} />, label: 'Módulos' },
          { key: 'leccion', icon: <FileText size={18} />, label: 'Lecciones' },
          { key: 'quiz', icon: <FileText size={18} />, label: 'Evaluaciones' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === tab.key
              ? 'border-[#0266ff] text-[#0266ff]'
              : 'border-transparent text-gray-500 hover:text-[#0266ff]'
              }`}
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="transition-all">
        {activeTab === 'curso' && (
          <>
            <CrearCurso
              cursos={cursos}
              onGuardar={handleGuardarCurso}
              cursoEditando={cursoEditando}
              onCancelarEdicion={() => setCursoEditando(null)}
            />
            <TablaCursos
              cursos={cursos}
              onEdit={(row) => setCursoEditando(row)}
              onDelete={async (id) => {
                await eliminarCurso(id)
                await obtenerCursos()
                await obtenerModulos()
                await obtenerLecciones()
                await obtenerQuizzes()
              }}
            />
          </>
        )}

        {activeTab === 'modulo' && (
          <>
            <CrearModulo
              cursos={cursos}
              onGuardar={handleGuardarModulo}
              moduloEditando={moduloEditando}
              onCancelarEdicion={() => setModuloEditando(null)}
            />
            <TablaModulos
              modulos={modulos}
              onEdit={(row) => setModuloEditando(row)}
              onDelete={async (id) => {
                await eliminarModulo(id)
                await obtenerModulos()
                await obtenerLecciones()
                await obtenerQuizzes()
              }}
            />
          </>
        )}

        {activeTab === 'leccion' && (
          <>
            <CrearLeccion
              modulos={modulos}
              onGuardar={handleGuardarLeccion}
              leccionEditando={leccionEditando}
              onCancelarEdicion={() => setLeccionEditando(null)}
            />
            <TablaLecciones
              lecciones={lecciones}
              onEdit={(row) => setLeccionEditando(row)}
              onDelete={async (id) => {
                await eliminarLeccion(id)
                await obtenerLecciones()
                await obtenerQuizzes()
              }}
            />
          </>
        )}

        {activeTab === 'quiz' && (
          <>
            <CrearQuiz
              lecciones={lecciones}
              onGuardar={handleGuardarQuiz}
              quizEditando={quizEditando}
              onCancelarEdicion={() => setQuizEditando(null)}
            />
            <TablaQuiz
              quizzes={quizzes}
              onEdit={(row) => setQuizEditando(row)}
              onDelete={async (id) => {
                await eliminarQuiz(id)
                await obtenerQuizzes()
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}