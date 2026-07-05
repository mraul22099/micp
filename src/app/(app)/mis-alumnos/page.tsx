'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function MisAlumnosPage() {
  const [dni, setDni] = useState('')
  const [grupo, setGrupo] = useState('')
  const [carrera, setCarrera] = useState('')
  const [ciclo, setCiclo] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' })
  const [modo, setModo] = useState<'manual' | 'excel'>('manual')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ type: '', text: '' })

    try {
      const res = await fetch('/api/mis-alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, grupo, carrera, ciclo }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al agregar')

      setMsg({ type: 'success', text: `Alumno ${dni} agregado exitosamente al grupo ${grupo}.` })
      setDni('')
      setGrupo('')
      setCarrera('')
      setCiclo('')
      router.refresh()
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadMsg({ type: '', text: '' })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/mis-alumnos/importar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al importar')

      setUploadMsg({
        type: 'success',
        text: `Se importaron ${data.result.agregados} alumno(s). ${data.result.errores > 0 ? `${data.result.errores} error(es).` : ''}`
      })
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Mis Alumnos</h1>
        <p className="text-slate-400 mt-1">Agrega los alumnos asignados a tu tutoría. Puedes subirlos por Excel o agregarlos manualmente.</p>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-2">
        <button
          onClick={() => setModo('manual')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            modo === 'manual'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 border border-[#1e2d45] hover:text-white hover:bg-white/5'
          }`}
        >
          ✏️ Agregar Manual
        </button>
        <button
          onClick={() => setModo('excel')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            modo === 'excel'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 border border-[#1e2d45] hover:text-white hover:bg-white/5'
          }`}
        >
          📊 Importar Excel
        </button>
      </div>

      {/* Modo Manual */}
      {modo === 'manual' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Agregar Alumno Manualmente</h2>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">DNI del Alumno *</label>
              <input 
                type="text" 
                className="input"
                placeholder="Ej: 44175090"
                value={dni}
                onChange={e => setDni(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Carrera *</label>
              <input 
                type="text" 
                className="input"
                placeholder="Ej: ADMINISTRACIÓN"
                value={carrera}
                onChange={e => setCarrera(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Ciclo *</label>
              <input 
                type="text" 
                className="input"
                placeholder="Ej: 5"
                value={ciclo}
                onChange={e => setCiclo(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Grupo *</label>
              <input 
                type="text" 
                className="input"
                placeholder="Ej: 23AGO-AE05-A"
                value={grupo}
                onChange={e => setGrupo(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
                {loading ? 'Agregando...' : 'Agregar a Mi Lista'}
              </button>
            </div>
          </form>

          {msg.text && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {msg.text}
            </div>
          )}
        </div>
      )}

      {/* Modo Excel */}
      {modo === 'excel' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Importar desde Excel</h2>
          <p className="text-slate-500 text-sm mb-4">
            Sube un archivo Excel con las columnas: <strong className="text-slate-300">DNI, CARRERA, CICLO, GRUPO</strong> (en cualquier orden). El sistema identificará las columnas automáticamente.
          </p>
          <form onSubmit={handleExcelUpload} className="space-y-4">
            <div className="border-2 border-dashed border-[#1e2d45] rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-colors">
              <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 file:cursor-pointer cursor-pointer"
                required
              />
              <p className="text-xs text-slate-600 mt-2">Formatos: .xlsx, .xls, .csv</p>
            </div>
            <button type="submit" disabled={uploading} className="btn-primary w-full md:w-auto bg-emerald-600 hover:bg-emerald-700">
              {uploading ? '📊 Importando...' : '📊 Importar Mis Alumnos'}
            </button>
          </form>

          {uploadMsg.text && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${uploadMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {uploadMsg.text}
            </div>
          )}
        </div>
      )}

      <div className="card p-6 text-center border-dashed border-[#1e2d45]">
        <h3 className="text-slate-300 font-medium mb-2">💡 ¿Cómo funciona?</h3>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          <strong>Paso 1:</strong> Importa el Excel "Control de Pagos" en la sección Importar.<br />
          <strong>Paso 2:</strong> Aquí agregas los alumnos que te asignaron (por Excel o manual).<br />
          <strong>Paso 3:</strong> Ve a "Control de Pagos" para ver la tabla completa con los datos de pago de tus alumnos.
        </p>
      </div>
    </div>
  )
}
