import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, getEstadoColor, getNombreCompleto, getRiesgoColor, getCuotaEstado } from '@/lib/utils'
import SeguimientoForm from './SeguimientoForm'

export default async function AlumnoPage({ 
  params,
  searchParams
}: { 
  params: { dni: string }
  searchParams: { grupo?: string }
}) {
  const dni = params.dni
  const grupo = searchParams.grupo

  if (!grupo) {
    return (
      <div className="p-8 text-center text-slate-400">
        Se requiere especificar el grupo en la URL (?grupo=...)
      </div>
    )
  }

  const supabase = createClient()
  
  // 1. Obtener alumno
  const { data: alumno, error } = await supabase
    .from('vista_mis_alumnos')
    .select('*')
    .eq('dni', dni)
    .eq('grupo', grupo)
    .single()
    
  if (error || !alumno) {
    notFound()
  }

  // 2. Obtener cuotas
  const { data: cuotas } = await supabase
    .from('cuotas')
    .select('*')
    .eq('alumno_id', alumno.id)
    .order('nro_cuota', { ascending: true })

  const listCuotas = cuotas || []

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 mb-6">
        <Link href={`/grupos/${encodeURIComponent(grupo)}`} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-2 w-fit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Grupo
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{getNombreCompleto(alumno)}</h1>
            <p className="text-slate-400 mt-1">DNI: {alumno.dni}</p>
          </div>
          <div className="flex gap-2">
            <span className={`badge ${getEstadoColor(alumno.estado_matricula)}`}>
              {alumno.estado_matricula || 'Sin Estado'}
            </span>
            {alumno.riesgo_academico === 'alto' && (
              <span className={`badge ${getRiesgoColor('alto').badge}`}>Riesgo Alto</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Datos Personales y Académicos */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-[#1e2d45] pb-2">Contacto</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500 mb-0.5">Celular</p>
                <p className="text-slate-200">{alumno.celular || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Email</p>
                <p className="text-slate-200 break-words">{alumno.email || '—'}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-[#1e2d45] pb-2">Curso</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500 mb-0.5">Grupo</p>
                <p className="text-slate-200">{alumno.grupo}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Carrera / Módulo</p>
                <p className="text-slate-200">{alumno.carrera || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-500 mb-0.5">Turno</p>
                  <p className="text-slate-200">{alumno.turno || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Frecuencia</p>
                  <p className="text-slate-200">{alumno.frecuencia || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Horario</p>
                <p className="text-slate-200">{alumno.horario || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Fecha Inicio</p>
                <p className="text-slate-200">{formatDate(alumno.fecha_inicio)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Promoción</p>
                <p className="text-slate-200 whitespace-pre-wrap text-xs">{alumno.promocion || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Central y Derecha: Pagos y Seguimiento */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-4 border-emerald-500/20 bg-emerald-500/5">
              <p className="text-xs text-slate-400 mb-1">Total Pagado</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(alumno.total_pagado_cuotas + alumno.monto_inscripcion + alumno.monto_matricula)}</p>
            </div>
            <div className={`card p-4 ${alumno.deuda_total > 0 ? 'border-red-500/20 bg-red-500/5' : ''}`}>
              <p className="text-xs text-slate-400 mb-1">Deuda Total</p>
              <p className={`text-2xl font-bold ${alumno.deuda_total > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                {formatCurrency(alumno.deuda_total)}
              </p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-[#1e2d45] pb-2">Timeline de Pagos</h3>
            <div className="space-y-4">
              
              {/* Inscripción y Matrícula */}
              <div className="flex gap-4 p-3 rounded-xl bg-[#0a0f1e]/50 border border-[#1e2d45]">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-0.5">Inscripción</p>
                  <p className="font-medium text-slate-200">{formatCurrency(alumno.monto_inscripcion)}</p>
                  {alumno.fecha_pago_inscripcion && <p className="text-xs text-slate-500 mt-1">{formatDate(alumno.fecha_pago_inscripcion)}</p>}
                </div>
                <div className="w-px bg-[#1e2d45]"></div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-0.5">Matrícula</p>
                  <p className="font-medium text-slate-200">{formatCurrency(alumno.monto_matricula)}</p>
                  {alumno.fecha_pago_matricula && <p className="text-xs text-slate-500 mt-1">{formatDate(alumno.fecha_pago_matricula)}</p>}
                </div>
              </div>

              {/* Lista de Cuotas */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-slate-400 uppercase mt-4 mb-2">Cuotas Programadas</h4>
                {listCuotas.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No hay cuotas programadas</p>
                ) : (
                  listCuotas.map(cuota => {
                    const est = getCuotaEstado(cuota as any)
                    return (
                      <div key={cuota.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0f1e]/50 border border-[#1e2d45]">
                        <div>
                          <p className="text-sm font-medium text-slate-200">Cuota {cuota.nro_cuota}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Prog: {formatDate(cuota.fecha_programada)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-200">{formatCurrency(cuota.monto_programado)}</p>
                          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            est === 'pagado' ? 'bg-emerald-400/10 text-emerald-400' :
                            est === 'vencido' ? 'bg-red-400/10 text-red-400' :
                            'bg-slate-400/10 text-slate-400'
                          }`}>
                            {est === 'pagado' ? 'Pagado' : est === 'vencido' ? 'Vencida' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-[#1e2d45] pb-2">Mi Seguimiento</h3>
            <SeguimientoForm 
              dni={alumno.dni} 
              grupo={alumno.grupo}
              seguimiento={{
                id: 0,
                dni: alumno.dni,
                grupo: alumno.grupo,
                riesgo_academico: alumno.riesgo_academico || 'sin_evaluar',
                estado_seguimiento: alumno.estado_seguimiento || 'sin_contactar',
                ultima_comunicacion: alumno.ultima_comunicacion,
                telefono_alterno: alumno.telefono_alterno,
                observacion: alumno.observacion,
                actualizado_en: null
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
