import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function getNombreCompleto(alumno: { nombre?: string | null; paterno?: string | null; materno?: string | null }): string {
  return [alumno.nombre, alumno.paterno, alumno.materno].filter(Boolean).join(' ') || 'Sin nombre'
}

export function getTurnoLabel(turno: string | null): string {
  if (turno === 'M') return 'Mañana'
  if (turno === 'T') return 'Tarde'
  if (turno === 'N') return 'Noche'
  return turno || '—'
}

export function getEstadoColor(estado: string | null): string {
  switch (estado) {
    case 'Aprobado': return 'text-emerald-400 bg-emerald-400/10'
    case 'Observado': return 'text-amber-400 bg-amber-400/10'
    case 'Pre Aprobado': return 'text-blue-400 bg-blue-400/10'
    case 'Registrado': return 'text-slate-400 bg-slate-400/10'
    case 'Pendiente': return 'text-orange-400 bg-orange-400/10'
    case 'A Mejorar': return 'text-red-400 bg-red-400/10'
    default: return 'text-slate-400 bg-slate-400/10'
  }
}

export function getRiesgoColor(riesgo: string | null): { dot: string; badge: string; label: string } {
  switch (riesgo) {
    case 'alto': return { dot: 'bg-red-500', badge: 'text-red-400 bg-red-400/10', label: 'Alto' }
    case 'medio': return { dot: 'bg-amber-400', badge: 'text-amber-400 bg-amber-400/10', label: 'Medio' }
    case 'bajo': return { dot: 'bg-emerald-400', badge: 'text-emerald-400 bg-emerald-400/10', label: 'Bajo' }
    default: return { dot: 'bg-slate-500', badge: 'text-slate-400 bg-slate-400/10', label: 'Sin evaluar' }
  }
}

export function getSeguimientoColor(estado: string | null): { badge: string; label: string } {
  switch (estado) {
    case 'sin_contactar': return { badge: 'text-slate-400 bg-slate-400/10', label: 'Sin contactar' }
    case 'contactado': return { badge: 'text-blue-400 bg-blue-400/10', label: 'Contactado' }
    case 'en_proceso': return { badge: 'text-amber-400 bg-amber-400/10', label: 'En proceso' }
    case 'resuelto': return { badge: 'text-emerald-400 bg-emerald-400/10', label: 'Resuelto' }
    default: return { badge: 'text-slate-400 bg-slate-400/10', label: 'Sin contactar' }
  }
}

export function getCuotaEstado(cuota: { fecha_programada: string | null; monto_pagado: number; monto_programado: number }): 'pagado' | 'vencido' | 'pendiente' {
  if (cuota.monto_pagado >= cuota.monto_programado && cuota.monto_programado > 0) return 'pagado'
  if (cuota.fecha_programada) {
    const hoy = new Date()
    const fecha = new Date(cuota.fecha_programada + 'T00:00:00')
    if (fecha < hoy) return 'vencido'
  }
  return 'pendiente'
}

export function diasDesde(dateStr: string | null): number | null {
  if (!dateStr) return null
  const fecha = new Date(dateStr + 'T00:00:00')
  const hoy = new Date()
  return Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24))
}
