'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RiesgoAcademico, EstadoSeguimiento, Seguimiento } from '@/lib/types'
import { getRiesgoColor, getSeguimientoColor } from '@/lib/utils'

interface Props {
  dni: string
  grupo: string
  seguimiento?: Seguimiento | null
}

export default function SeguimientoForm({ dni, grupo, seguimiento }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    riesgo_academico: seguimiento?.riesgo_academico || 'sin_evaluar',
    estado_seguimiento: seguimiento?.estado_seguimiento || 'sin_contactar',
    ultima_comunicacion: seguimiento?.ultima_comunicacion || '',
    telefono_alterno: seguimiento?.telefono_alterno || '',
    observacion: seguimiento?.observacion || ''
  })
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    try {
      const res = await fetch('/api/seguimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, grupo, ...formData }),
      })

      if (!res.ok) throw new Error('Error al guardar')
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Hubo un error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Riesgo Académico</label>
          <select 
            className="input text-sm"
            value={formData.riesgo_academico}
            onChange={e => setFormData({...formData, riesgo_academico: e.target.value as RiesgoAcademico})}
          >
            <option value="sin_evaluar">Sin evaluar</option>
            <option value="bajo">🟢 Bajo</option>
            <option value="medio">🟡 Medio</option>
            <option value="alto">🔴 Alto</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Estado de Seguimiento</label>
          <select 
            className="input text-sm"
            value={formData.estado_seguimiento}
            onChange={e => setFormData({...formData, estado_seguimiento: e.target.value as EstadoSeguimiento})}
          >
            <option value="sin_contactar">Sin contactar</option>
            <option value="contactado">Contactado</option>
            <option value="en_proceso">En proceso</option>
            <option value="resuelto">Resuelto</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Última Comunicación</label>
          <input 
            type="date" 
            className="input text-sm"
            value={formData.ultima_comunicacion}
            onChange={e => setFormData({...formData, ultima_comunicacion: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Teléfono Alternativo</label>
          <input 
            type="text" 
            className="input text-sm"
            placeholder="Ej: 987654321"
            value={formData.telefono_alterno}
            onChange={e => setFormData({...formData, telefono_alterno: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Observación del Tutor</label>
        <textarea 
          className="input text-sm min-h-[100px] resize-y"
          placeholder="Notas privadas sobre el alumno (ej: prometió pagar el 5, pidió reprogramación...)"
          value={formData.observacion}
          onChange={e => setFormData({...formData, observacion: e.target.value})}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && <span className="text-sm text-emerald-400">¡Guardado!</span>}
        <button type="submit" disabled={loading} className="btn-primary text-sm px-6">
          {loading ? 'Guardando...' : 'Guardar Seguimiento'}
        </button>
      </div>
    </form>
  )
}
