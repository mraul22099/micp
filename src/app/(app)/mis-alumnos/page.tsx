'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MisAlumnosPage() {
  const [dni, setDni] = useState('')
  const [grupo, setGrupo] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ type: '', text: '' })

    try {
      const res = await fetch('/api/mis-alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, grupo }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al agregar')

      setMsg({ type: 'success', text: 'Alumno agregado a tu lista exitosamente.' })
      setDni('')
      setGrupo('')
      router.refresh()
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (dniToRemove: string, grupoToRemove: string) => {
    if (!confirm('¿Estás seguro de quitar a este alumno de tu lista? No se borrarán sus datos del sistema, solo dejarás de verlo.')) return

    try {
      const res = await fetch(`/api/mis-alumnos?dni=${dniToRemove}&grupo=${encodeURIComponent(grupoToRemove)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al quitar')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Error al quitar de la lista')
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Mi Lista de Alumnos</h1>
        <p className="text-slate-400 mt-1">Agrega aquí los DNI y Grupos de los alumnos que te han sido asignados.</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Agregar Alumno Manualmente</h2>
        <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">DNI del Alumno</label>
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
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Grupo Exacto (del Excel)</label>
            <input 
              type="text" 
              className="input"
              placeholder="Ej: CPD ADMINISTRACION..."
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

      <div className="card p-6 text-center border-dashed border-[#1e2d45]">
        <h3 className="text-slate-300 font-medium mb-2">💡 ¿Cómo funciona esto?</h3>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          El Excel contiene miles de alumnos. Al agregar el DNI y Grupo exacto aquí, 
          le dices al sistema que este alumno es tuyo. La próxima vez que importes el Excel, 
          todos los datos y pagos de tus alumnos se actualizarán automáticamente.
        </p>
      </div>
    </div>
  )
}
