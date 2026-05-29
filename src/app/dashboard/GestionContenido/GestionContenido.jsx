'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Layers, FileText, ClipboardList, Plus, Pencil, Trash2,
  ChevronRight, Save, X, Upload, Check, AlertCircle, Image as ImageIcon,
  Video, FileUp, Loader2, Link
} from 'lucide-react'
import { useCurso } from '@/app/hooks/AgregarMaterial/Curso/useCurso'
import { useModulo } from '@/app/hooks/AgregarMaterial/Modulo/useModulo'
import { useLeccion } from '@/app/hooks/AgregarMaterial/Leccion/useLeccion'
import { useQuiz } from '@/app/hooks/AgregarMaterial/Quiz/useQuiz'
import { toast } from 'react-toastify'

/* ─── UI helpers ─── */
function Campo({ label, children, required, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}{required && <span className="text-[#0266ff] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:ring-2 focus:ring-[#0266ff]/30 focus:border-[#0266ff] outline-none bg-white transition-all"

function InputText(props) { return <input {...props} className={inputCls} /> }
function Textarea(props) { return <textarea {...props} className={`${inputCls} resize-none`} /> }
function Selec({ children, ...props }) {
  return <select {...props} className={inputCls}>{children}</select>
}

function Btn({ children, variant = 'primary', size = 'md', loading, ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary: 'bg-[#0266ff] hover:bg-blue-700 text-white shadow-sm',
    ghost: 'border border-gray-200 hover:bg-gray-50 text-gray-700',
    danger: 'border border-red-200 hover:bg-red-50 text-red-600',
  }
  return (
    <button {...props} disabled={loading || props.disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${props.className || ''}`}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

/* ─── Selector de imagen: PC o URL ─── */
function SelectorImagen({ file, url, onFile, onUrl }) {
  const ref = useRef()
  const [modo, setModo] = useState('pc') // 'pc' | 'url'
  const preview = file ? URL.createObjectURL(file) : (modo === 'url' ? url : null)

  return (
    <div className="space-y-2">
      {/* Tabs PC / URL */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setModo('pc')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${modo === 'pc' ? 'bg-[#0266ff] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          <Upload size={12} /> Subir archivo
        </button>
        <button type="button" onClick={() => { setModo('url'); onFile(null) }}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${modo === 'url' ? 'bg-[#0266ff] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          <Link size={12} /> Pegar URL
        </button>
      </div>

      {/* Modo PC */}
      {modo === 'pc' && (
        <div>
          <div
            onClick={() => ref.current?.click()}
            className={`relative cursor-pointer border-2 border-dashed rounded-2xl overflow-hidden transition-all
              ${file ? 'h-40 border-[#0266ff]/40' : 'h-28 border-gray-200 hover:border-[#0266ff]/50 hover:bg-gray-50'}`}
          >
            {file ? (
              <>
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-white text-xs font-semibold">Cambiar imagen</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                <ImageIcon size={24} className="opacity-40" />
                <p className="text-xs text-center px-4">Arrastra o <span className="text-[#0266ff] font-semibold">selecciona</span> una imagen</p>
              </div>
            )}
          </div>
          {file && (
            <button type="button" onClick={() => onFile(null)}
              className="mt-1 text-xs text-red-500 hover:underline">Quitar imagen</button>
          )}
          <input ref={ref} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) onFile(f) }} />
        </div>
      )}

      {/* Modo URL */}
      {modo === 'url' && (
        <div className="space-y-2">
          <InputText
            value={url}
            onChange={e => onUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {url && (
            <img src={url} onError={e => e.target.style.display='none'}
              className="rounded-xl h-28 w-full object-cover border border-gray-200" />
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Selector de video: PC o URL ─── */
function SelectorVideo({ file, url, onFile, onUrl }) {
  const ref = useRef()
  const [modo, setModo] = useState('url')

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button type="button" onClick={() => setModo('pc')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${modo === 'pc' ? 'bg-[#0266ff] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          <Upload size={12} /> Subir video
        </button>
        <button type="button" onClick={() => { setModo('url'); onFile(null) }}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${modo === 'url' ? 'bg-[#0266ff] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          <Link size={12} /> URL embed
        </button>
      </div>

      {modo === 'pc' && (
        <div>
          {file ? (
            <div className="relative border border-gray-200 rounded-2xl overflow-hidden bg-black">
              <video src={URL.createObjectURL(file)} controls className="w-full max-h-44 object-contain" />
              <button type="button" onClick={() => onFile(null)}
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow text-gray-500 hover:text-red-500">
                <X size={12} />
              </button>
            </div>
          ) : (
            <div onClick={() => ref.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#0266ff]/50 rounded-2xl h-24 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 transition-all">
              <Video size={22} className="opacity-40" />
              <p className="text-xs text-center px-4">Arrastra o <span className="text-[#0266ff] font-semibold">selecciona</span> un video</p>
              <p className="text-xs text-gray-300">MP4, MOV, WEBM</p>
            </div>
          )}
          <input ref={ref} type="file" accept="video/*" className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) onFile(f) }} />
        </div>
      )}

      {modo === 'url' && (
        <div className="space-y-2">
          <InputText value={url} onChange={e => onUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/..." />
          {url && (
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
              <iframe src={url} className="w-full h-full" allowFullScreen />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Selector de PDFs ─── */
function SelectorPDFs({ archivos, onArchivos }) {
  const ref = useRef()
  return (
    <div className="space-y-2">
      <div onClick={() => ref.current?.click()}
        className="cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#0266ff]/50 rounded-2xl p-4 flex flex-col items-center gap-2 text-gray-400 hover:bg-gray-50 transition-all">
        <FileUp size={20} className="opacity-40" />
        <p className="text-xs text-center">Arrastra PDFs o <span className="text-[#0266ff] font-semibold">haz clic</span></p>
      </div>
      <input ref={ref} type="file" multiple accept="application/pdf" className="hidden"
        onChange={e => {
          const nuevos = Array.from(e.target.files).filter(f => f.type === 'application/pdf')
          onArchivos([...archivos, ...nuevos])
        }} />
      {archivos.length > 0 && (
        <div className="space-y-1">
          {archivos.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 text-xs">
              <FileText size={12} className="text-red-500 flex-shrink-0" />
              <span className="flex-1 truncate text-gray-700">{f.name}</span>
              <span className="text-gray-400">{(f.size / 1024).toFixed(0)}KB</span>
              <button type="button" onClick={() => onArchivos(archivos.filter((_, j) => j !== i))}
                className="text-gray-300 hover:text-red-500"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionCard({ icon, title, color = '#0266ff', children, badge }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
        style={{ borderLeftColor: color, borderLeftWidth: 4 }}>
        <span style={{ color }}>{icon}</span>
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
        {badge != null && <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0266ff]">{badge}</span>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function ModalConfirm({ open, title, message, onConfirm, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <Trash2 size={40} className="mx-auto text-red-500 mb-4" />
        <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="danger" onClick={() => { onConfirm(); onClose() }}>Eliminar</Btn>
        </div>
      </motion.div>
    </div>
  )
}

/* ══ PANEL CURSOS ══ */
function PanelCursos({ cursos, onCrear, onEditar, onEliminar, loading }) {
  const emptyForm = { titulo: '', descripcion: '', imagenFile: null, imagenUrl: '' }
  const [form, setForm] = useState(emptyForm)
  const [editando, setEditando] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const abrirNuevo = () => { setForm(emptyForm); setEditando(null); setShowForm(true) }
  const abrirEditar = (c) => {
    setForm({ titulo: c.titulo, descripcion: c.descripcion || '', imagenFile: null, imagenUrl: c.imagen || '' })
    setEditando(c); setShowForm(true)
  }
  const cerrar = () => { setShowForm(false); setEditando(null); setForm(emptyForm) }

  const guardar = async () => {
    if (!form.titulo.trim()) return toast.error('El título es obligatorio')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('titulo', form.titulo)
      fd.append('descripcion', form.descripcion)
      if (form.imagenFile) {
        fd.append('imagen', form.imagenFile)
      } else if (form.imagenUrl) {
        fd.append('imagen', form.imagenUrl)
      }
      if (editando) await onEditar(editando.id, fd)
      else await onCrear(fd)
      cerrar()
    } finally { setSaving(false) }
  }

  return (
    <SectionCard icon={<BookOpen size={20} />} title="Cursos" badge={cursos.length}>
      <div className="flex justify-end mb-4">
        <Btn onClick={abrirNuevo}><Plus size={16} />Nuevo curso</Btn>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-[#0266ff] text-sm">{editando ? 'Editar curso' : 'Nuevo curso'}</p>
                <button onClick={cerrar} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Título" required>
                  <InputText value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Liderazgo empresarial" />
                </Campo>
                <Campo label="Descripción">
                  <Textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del curso..." />
                </Campo>
                <div className="md:col-span-2">
                  <Campo label="Imagen de portada">
                    <SelectorImagen
                      file={form.imagenFile}
                      url={form.imagenUrl}
                      onFile={f => setForm({ ...form, imagenFile: f, imagenUrl: '' })}
                      onUrl={u => setForm({ ...form, imagenUrl: u, imagenFile: null })}
                    />
                  </Campo>
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Btn variant="ghost" size="sm" onClick={cerrar}>Cancelar</Btn>
                <Btn size="sm" onClick={guardar} loading={saving}>
                  <Save size={14} />{editando ? 'Guardar cambios' : 'Crear curso'}
                </Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="animate-pulse h-16 rounded-xl bg-gray-100" />)}</div>
      ) : cursos.length === 0 ? (
        <div className="text-center py-10 text-gray-400"><BookOpen size={36} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No hay cursos. Crea el primero.</p></div>
      ) : (
        <div className="space-y-2">
          {cursos.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#0266ff]/30 hover:bg-blue-50/30 transition-all group">
              {c.imagen ? <img src={c.imagen} className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                : <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><BookOpen size={20} className="text-[#0266ff]" /></div>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{c.titulo}</p>
                <p className="text-xs text-gray-400">{c.modulos?.length || 0} módulos</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => abrirEditar(c)} className="p-1.5 rounded-lg hover:bg-blue-100 text-[#0266ff]"><Pencil size={14} /></button>
                <button onClick={() => setConfirmId(c.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ModalConfirm open={!!confirmId} title="¿Eliminar curso?"
        message="Se eliminarán todos los módulos, lecciones y evaluaciones asociadas."
        onConfirm={() => onEliminar(confirmId)} onClose={() => setConfirmId(null)} />
    </SectionCard>
  )
}

/* ══ PANEL MÓDULOS ══ */
function PanelModulos({ modulos, cursos, onCrear, onEditar, onEliminar, loading }) {
  const emptyForm = { titulo: '', descripcion: '', imagenFile: null, imagenUrl: '', cursoId: '' }
  const [form, setForm] = useState(emptyForm)
  const [editando, setEditando] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const abrirNuevo = () => { setForm(emptyForm); setEditando(null); setShowForm(true) }
  const abrirEditar = (m) => {
    setForm({ titulo: m.titulo, descripcion: m.descripcion || '', imagenFile: null, imagenUrl: m.imagen || '', cursoId: m.curso?.id || '' })
    setEditando(m); setShowForm(true)
  }
  const cerrar = () => { setShowForm(false); setEditando(null); setForm(emptyForm) }

  const guardar = async () => {
    if (!form.titulo.trim() || !form.cursoId) return toast.error('Título y curso son obligatorios')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('titulo', form.titulo)
      fd.append('descripcion', form.descripcion)
      fd.append('cursoId', String(form.cursoId))
      if (form.imagenFile) fd.append('imagen', form.imagenFile)
      else if (form.imagenUrl) fd.append('imagen', form.imagenUrl)
      if (editando) await onEditar(editando.id, fd)
      else await onCrear(fd)
      cerrar()
    } finally { setSaving(false) }
  }

  return (
    <SectionCard icon={<Layers size={20} />} title="Módulos" badge={modulos.length}>
      <div className="flex justify-end mb-4">
        <Btn onClick={abrirNuevo} disabled={cursos.length === 0}><Plus size={16} />Nuevo módulo</Btn>
      </div>
      {cursos.length === 0 && <p className="text-xs text-amber-600 mb-3 flex items-center gap-1"><AlertCircle size={14} />Crea un curso primero</p>}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-[#0266ff] text-sm">{editando ? 'Editar módulo' : 'Nuevo módulo'}</p>
                <button onClick={cerrar} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Título" required>
                  <InputText value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Comunicación efectiva" />
                </Campo>
                <Campo label="Curso" required>
                  <Selec value={form.cursoId} onChange={e => setForm({ ...form, cursoId: e.target.value })}>
                    <option value="">Seleccionar curso</option>
                    {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                  </Selec>
                </Campo>
                <Campo label="Descripción">
                  <Textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del módulo..." />
                </Campo>
                <Campo label="Imagen">
                  <SelectorImagen
                    file={form.imagenFile}
                    url={form.imagenUrl}
                    onFile={f => setForm({ ...form, imagenFile: f, imagenUrl: '' })}
                    onUrl={u => setForm({ ...form, imagenUrl: u, imagenFile: null })}
                  />
                </Campo>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Btn variant="ghost" size="sm" onClick={cerrar}>Cancelar</Btn>
                <Btn size="sm" onClick={guardar} loading={saving}><Save size={14} />{editando ? 'Guardar cambios' : 'Crear módulo'}</Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="animate-pulse h-16 rounded-xl bg-gray-100" />)}</div>
      ) : modulos.length === 0 ? (
        <div className="text-center py-10 text-gray-400"><Layers size={36} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No hay módulos aún.</p></div>
      ) : (
        <div className="space-y-2">
          {modulos.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#0266ff]/30 hover:bg-blue-50/30 transition-all group">
              {m.imagen ? <img src={m.imagen} className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
                : <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><Layers size={20} className="text-[#0266ff]" /></div>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{m.titulo}</p>
                <p className="text-xs text-gray-400">{m.curso?.titulo || '—'}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => abrirEditar(m)} className="p-1.5 rounded-lg hover:bg-blue-100 text-[#0266ff]"><Pencil size={14} /></button>
                <button onClick={() => setConfirmId(m.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ModalConfirm open={!!confirmId} title="¿Eliminar módulo?" message="Se eliminarán todas las lecciones y evaluaciones relacionadas."
        onConfirm={() => onEliminar(confirmId)} onClose={() => setConfirmId(null)} />
    </SectionCard>
  )
}

/* ══ PANEL LECCIONES ══ */
function PanelLecciones({ lecciones, modulos, onCrear, onEditar, onEliminar, loading }) {
  const emptyForm = { titulo: '', descripcion: '', imagenFile: null, imagenUrl: '', videoFile: null, videoUrl: '', contenidoTexto: '', moduloId: '', archivos: [] }
  const [form, setForm] = useState(emptyForm)
  const [editando, setEditando] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const abrirNuevo = () => { setForm(emptyForm); setEditando(null); setShowForm(true) }
  const abrirEditar = (l) => {
    setForm({ titulo: l.titulo, descripcion: l.descripcion || '', imagenFile: null, imagenUrl: l.imagen || '', videoFile: null, videoUrl: l.videoUrl || '', contenidoTexto: l.contenidoTexto || '', moduloId: l.modulo?.id || '', archivos: [] })
    setEditando(l); setShowForm(true)
  }
  const cerrar = () => { setShowForm(false); setEditando(null); setForm(emptyForm) }

  const guardar = async () => {
    if (!form.titulo.trim() || !form.moduloId || !form.contenidoTexto.trim())
      return toast.error('Título, módulo y contenido son obligatorios')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('titulo', form.titulo)
      fd.append('descripcion', form.descripcion)
      fd.append('contenidoTexto', form.contenidoTexto)
      fd.append('moduloId', String(form.moduloId))
      if (form.imagenFile) fd.append('imagen', form.imagenFile)
      else if (form.imagenUrl) fd.append('imagen', form.imagenUrl)
      if (form.videoFile) fd.append('video', form.videoFile)
      else if (form.videoUrl) fd.append('videoUrl', form.videoUrl)
      form.archivos.forEach(a => fd.append('archivos', a))
      if (editando) await onEditar(editando.id, fd)
      else await onCrear(fd)
      cerrar()
    } finally { setSaving(false) }
  }

  return (
    <SectionCard icon={<FileText size={20} />} title="Lecciones" badge={lecciones.length}>
      <div className="flex justify-end mb-4">
        <Btn onClick={abrirNuevo} disabled={modulos.length === 0}><Plus size={16} />Nueva lección</Btn>
      </div>
      {modulos.length === 0 && <p className="text-xs text-amber-600 mb-3 flex items-center gap-1"><AlertCircle size={14} />Crea un módulo primero</p>}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-[#0266ff] text-sm">{editando ? 'Editar lección' : 'Nueva lección'}</p>
                <button onClick={cerrar} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Campo label="Título" required>
                  <InputText value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Escucha activa" />
                </Campo>
                <Campo label="Módulo" required>
                  <Selec value={form.moduloId} onChange={e => setForm({ ...form, moduloId: e.target.value })}>
                    <option value="">Seleccionar módulo</option>
                    {modulos.map(m => <option key={m.id} value={m.id}>{m.titulo} — {m.curso?.titulo}</option>)}
                  </Selec>
                </Campo>
                <Campo label="Descripción">
                  <Textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción de la lección..." />
                </Campo>
                <Campo label="Imagen">
                  <SelectorImagen
                    file={form.imagenFile} url={form.imagenUrl}
                    onFile={f => setForm({ ...form, imagenFile: f, imagenUrl: '' })}
                    onUrl={u => setForm({ ...form, imagenUrl: u, imagenFile: null })}
                  />
                </Campo>
                <div className="md:col-span-2">
                  <Campo label="Video (opcional)">
                    <SelectorVideo
                      file={form.videoFile} url={form.videoUrl}
                      onFile={f => setForm({ ...form, videoFile: f, videoUrl: '' })}
                      onUrl={u => setForm({ ...form, videoUrl: u, videoFile: null })}
                    />
                  </Campo>
                </div>
                <div className="md:col-span-2">
                  <Campo label="Archivos PDF">
                    <SelectorPDFs archivos={form.archivos} onArchivos={a => setForm({ ...form, archivos: a })} />
                  </Campo>
                </div>
                <div className="md:col-span-2">
                  <Campo label="Contenido" required>
                    <Textarea rows={6} value={form.contenidoTexto} onChange={e => setForm({ ...form, contenidoTexto: e.target.value })} placeholder="Contenido completo de la lección..." />
                  </Campo>
                </div>
              </div>
              <div className="flex justify-end mt-5 gap-2">
                <Btn variant="ghost" size="sm" onClick={cerrar}>Cancelar</Btn>
                <Btn size="sm" onClick={guardar} loading={saving}><Save size={14} />{editando ? 'Guardar cambios' : 'Crear lección'}</Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="animate-pulse h-16 rounded-xl bg-gray-100" />)}</div>
      ) : lecciones.length === 0 ? (
        <div className="text-center py-10 text-gray-400"><FileText size={36} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No hay lecciones aún.</p></div>
      ) : (
        <div className="space-y-2">
          {lecciones.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#0266ff]/30 hover:bg-blue-50/30 transition-all group">
              {l.imagen ? <img src={l.imagen} className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
                : <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><FileText size={20} className="text-[#0266ff]" /></div>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{l.titulo}</p>
                <p className="text-xs text-gray-400 truncate">{l.modulo?.titulo || '—'}</p>
              </div>
              {l.quiz && <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 flex-shrink-0">Con evaluación</span>}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => abrirEditar(l)} className="p-1.5 rounded-lg hover:bg-blue-100 text-[#0266ff]"><Pencil size={14} /></button>
                <button onClick={() => setConfirmId(l.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ModalConfirm open={!!confirmId} title="¿Eliminar lección?" message="Se eliminará la evaluación asociada también."
        onConfirm={() => onEliminar(confirmId)} onClose={() => setConfirmId(null)} />
    </SectionCard>
  )
}

/* ══ PANEL QUIZZES ══ */
function PanelQuizzes({ quizzes, lecciones, onCrear, onEditar, onEliminar, loading }) {
  const emptyForm = { leccionId: '', minCorrectas: 1, preguntas: [{ texto: '', opciones: ['', ''], correcta: 0 }] }
  const [form, setForm] = useState(emptyForm)
  const [editando, setEditando] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const leccionesSinQuiz = lecciones.filter(l => !l.quiz)

  const abrirNuevo = () => { setForm(emptyForm); setEditando(null); setShowForm(true) }
  const abrirEditar = (q) => {
    setForm({
      leccionId: q.leccion?.id || '', minCorrectas: q.minCorrectas,
      preguntas: (q.preguntas || []).map(p => ({
        texto: p.texto,
        opciones: p.opciones?.map(o => typeof o === 'string' ? o : o.texto) || ['', ''],
        correcta: Array.isArray(p.opciones) ? p.opciones.findIndex(o => o.correcta) : 0
      }))
    })
    setEditando(q); setShowForm(true)
  }
  const cerrar = () => { setShowForm(false); setEditando(null) }
  const addP = () => setForm({ ...form, preguntas: [...form.preguntas, { texto: '', opciones: ['', ''], correcta: 0 }] })
  const removeP = i => setForm({ ...form, preguntas: form.preguntas.filter((_, idx) => idx !== i) })
  const updateP = (i, f, v) => { const ps = [...form.preguntas]; ps[i] = { ...ps[i], [f]: v }; setForm({ ...form, preguntas: ps }) }
  const updateO = (pi, oi, v) => { const ps = [...form.preguntas]; ps[pi].opciones[oi] = v; setForm({ ...form, preguntas: ps }) }
  const addO = pi => { const ps = [...form.preguntas]; ps[pi].opciones.push(''); setForm({ ...form, preguntas: ps }) }
  const removeO = (pi, oi) => {
    const ps = [...form.preguntas]
    if (ps[pi].opciones.length <= 2) return
    ps[pi].opciones = ps[pi].opciones.filter((_, i) => i !== oi)
    if (ps[pi].correcta >= oi) ps[pi].correcta = Math.max(0, ps[pi].correcta - 1)
    setForm({ ...form, preguntas: ps })
  }
  const guardar = async () => {
    if (!form.leccionId) return toast.error('Selecciona una lección')
    if (!form.preguntas.length) return toast.error('Agrega al menos una pregunta')
    if (editando) await onEditar(editando.id, form)
    else await onCrear(form)
    cerrar()
  }

  return (
    <SectionCard icon={<ClipboardList size={20} />} title="Evaluaciones" badge={quizzes.length}>
      <div className="flex justify-end mb-4">
        <Btn onClick={abrirNuevo} disabled={lecciones.length === 0}><Plus size={16} />Nueva evaluación</Btn>
      </div>
      {lecciones.length === 0 && <p className="text-xs text-amber-600 mb-3 flex items-center gap-1"><AlertCircle size={14} />Crea lecciones primero</p>}
      {lecciones.length > 0 && leccionesSinQuiz.length === 0 && !editando && <p className="text-xs text-green-700 mb-3 flex items-center gap-1"><Check size={14} />Todas las lecciones tienen evaluación</p>}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-[#0266ff] text-sm">{editando ? 'Editar evaluación' : 'Nueva evaluación'}</p>
                <button onClick={cerrar} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Campo label="Lección" required>
                  <Selec value={form.leccionId} onChange={e => setForm({ ...form, leccionId: e.target.value })}>
                    <option value="">Seleccionar lección</option>
                    {lecciones.map(l => <option key={l.id} value={l.id}>{l.titulo}</option>)}
                  </Selec>
                </Campo>
                <Campo label="Mínimo para aprobar">
                  <InputText type="number" min={1} value={form.minCorrectas} onChange={e => setForm({ ...form, minCorrectas: Number(e.target.value) })} />
                </Campo>
              </div>
              <div className="space-y-4">
                {form.preguntas.map((p, pi) => (
                  <div key={pi} className="bg-white rounded-xl p-4 border border-gray-200 relative">
                    <button onClick={() => removeP(pi)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><X size={16} /></button>
                    <p className="text-xs font-bold text-gray-500 mb-2">Pregunta {pi + 1}</p>
                    <InputText value={p.texto} onChange={e => updateP(pi, 'texto', e.target.value)} placeholder="Escribe la pregunta..." className="mb-3" />
                    <div className="space-y-2">
                      {p.opciones.map((op, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`c-${pi}`} checked={p.correcta === oi} onChange={() => updateP(pi, 'correcta', oi)} className="accent-[#0266ff] flex-shrink-0" />
                          <input value={op} onChange={e => updateO(pi, oi, e.target.value)} placeholder={`Opción ${oi + 1}`}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0266ff]/30" />
                          <button onClick={() => removeO(pi, oi)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addO(pi)} className="text-[#0266ff] text-xs mt-2 flex items-center gap-1 hover:underline"><Plus size={12} />Opción</button>
                  </div>
                ))}
              </div>
              <button onClick={addP} className="mt-3 text-[#0266ff] text-sm flex items-center gap-1 hover:underline"><Plus size={14} />Agregar pregunta</button>
              <div className="flex justify-end mt-5 gap-2">
                <Btn variant="ghost" size="sm" onClick={cerrar}>Cancelar</Btn>
                <Btn size="sm" onClick={guardar}><Save size={14} />{editando ? 'Guardar cambios' : 'Crear evaluación'}</Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="animate-pulse h-16 rounded-xl bg-gray-100" />)}</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-10 text-gray-400"><ClipboardList size={36} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No hay evaluaciones aún.</p></div>
      ) : (
        <div className="space-y-2">
          {quizzes.map(q => (
            <div key={q.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#0266ff]/30 hover:bg-blue-50/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><ClipboardList size={20} className="text-[#0266ff]" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{q.leccion?.titulo || '—'}</p>
                <p className="text-xs text-gray-400">{q.preguntas?.length || 0} preguntas · mínimo {q.minCorrectas}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => abrirEditar(q)} className="p-1.5 rounded-lg hover:bg-blue-100 text-[#0266ff]"><Pencil size={14} /></button>
                <button onClick={() => setConfirmId(q.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ModalConfirm open={!!confirmId} title="¿Eliminar evaluación?" message="Esta acción no se puede deshacer."
        onConfirm={() => onEliminar(confirmId)} onClose={() => setConfirmId(null)} />
    </SectionCard>
  )
}

/* ══ PRINCIPAL ══ */
export default function GestionContenido() {
  const { cursos, obtenerCursos, crearCurso, editarCurso, eliminarCurso, loading: lC } = useCurso()
  const { modulos, obtenerModulos, crearModulo, editarModulo, eliminarModulo, loading: lM } = useModulo()
  const { lecciones, obtenerLecciones, crearLeccion, editarLeccion, eliminarLeccion, loading: lL } = useLeccion()
  const { quizzes, obtenerQuizzes, crearQuiz, editarQuiz, eliminarQuiz, loading: lQ } = useQuiz()

  const refresh = async () => Promise.all([obtenerCursos(), obtenerModulos(), obtenerLecciones(), obtenerQuizzes()])
  useEffect(() => { refresh() }, [])

  // Todos los handlers pasan FormData directo al hook
  const handleCrearCurso = async (fd) => { await crearCurso(fd); await refresh() }
  const handleEditarCurso = async (id, fd) => { await editarCurso(id, fd); await refresh() }
  const handleEliminarCurso = async (id) => { await eliminarCurso(id); await refresh() }

  const handleCrearModulo = async (fd) => { await crearModulo(fd); await refresh() }
  const handleEditarModulo = async (id, fd) => { await editarModulo(id, fd); await refresh() }
  const handleEliminarModulo = async (id) => { await eliminarModulo(id); await refresh() }

  const handleCrearLeccion = async (fd) => { await crearLeccion(fd); await refresh() }
  const handleEditarLeccion = async (id, fd) => { await editarLeccion(id, fd); await refresh() }
  const handleEliminarLeccion = async (id) => { await eliminarLeccion(id); await refresh() }

  const handleCrearQuiz = async (f) => { await crearQuiz(f); await refresh() }
  const handleEditarQuiz = async (id, f) => { await editarQuiz(id, f); await refresh() }
  const handleEliminarQuiz = async (id) => { await eliminarQuiz(id); await refresh() }

  return (
    <div className="min-h-screen bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Gestión de contenido</h1>
        <p className="text-gray-500 mt-1 text-sm">Crea cursos, módulos, lecciones y evaluaciones. Sube imágenes y videos desde tu PC o pega URLs.</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 flex-wrap">
        {[
          { icon: <BookOpen size={12} />, label: '1. Crea un curso' },
          { icon: <ChevronRight size={12} />, label: null },
          { icon: <Layers size={12} />, label: '2. Agrega módulos' },
          { icon: <ChevronRight size={12} />, label: null },
          { icon: <FileText size={12} />, label: '3. Crea lecciones' },
          { icon: <ChevronRight size={12} />, label: null },
          { icon: <ClipboardList size={12} />, label: '4. Añade evaluaciones' },
        ].map((s, i) => s.label
          ? <span key={i} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">{s.icon}{s.label}</span>
          : <span key={i} className="text-gray-300">{s.icon}</span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PanelCursos cursos={cursos} loading={lC} onCrear={handleCrearCurso} onEditar={handleEditarCurso} onEliminar={handleEliminarCurso} />
        <PanelModulos modulos={modulos} cursos={cursos} loading={lM} onCrear={handleCrearModulo} onEditar={handleEditarModulo} onEliminar={handleEliminarModulo} />
        <PanelLecciones lecciones={lecciones} modulos={modulos} loading={lL} onCrear={handleCrearLeccion} onEditar={handleEditarLeccion} onEliminar={handleEliminarLeccion} />
        <PanelQuizzes quizzes={quizzes} lecciones={lecciones} loading={lQ} onCrear={handleCrearQuiz} onEditar={handleEditarQuiz} onEliminar={handleEliminarQuiz} />
      </div>
    </div>
  )
}
