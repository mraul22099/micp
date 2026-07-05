import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, getEstadoColor, getNombreCompleto, getRiesgoColor } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // 1. Obtener todos los alumnos del tutor
  const { data: alumnos, error } = await supabase
    .from('vista_mis_alumnos')
    .select('*')
    
  if (error) {
    console.error('Error fetching dashboard:', error)
  }

  const list = alumnos || []
  
  // Calcular métricas
  const totalAlumnos = list.length
  const alDia = list.filter(a => a.deuda_total <= 0).length
  const conDeuda = list.filter(a => a.deuda_total > 0).length
  const riesgoAlto = list.filter(a => a.riesgo_academico === 'alto').length

  // Agrupar por grupo para mostrar la lista de grupos
  const gruposMap = new Map<string, number>()
  list.forEach(a => {
    gruposMap.set(a.grupo, (gruposMap.get(a.grupo) || 0) + 1)
  })
  const grupos = Array.from(gruposMap.entries()).map(([nombre, total]) => ({ nombre, total }))
  
  // Alertas (deudores o riesgo alto sin contactar)
  const alertas = list.filter(a => 
    (a.deuda_total > 0 && a.estado_seguimiento === 'sin_contactar') || 
    (a.riesgo_academico === 'alto')
  ).slice(0, 5) // Mostrar máximo 5

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Resumen general de tus grupos asignados.</p>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-sm font-medium">Total Alumnos</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalAlumnos}</p>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium">Al Día</h3>
          </div>
          <p className="text-3xl font-bold text-white">{alDia}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 text-red-400 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium">Con Deuda</h3>
          </div>
          <p className="text-3xl font-bold text-white">{conDeuda}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 text-amber-400 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-sm font-medium">Riesgo Alto</h3>
          </div>
          <p className="text-3xl font-bold text-white">{riesgoAlto}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna principal: Alertas */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Alertas Prioritarias</h2>
          </div>
          
          {alertas.length === 0 ? (
            <div className="card p-8 text-center border-dashed">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-slate-200 font-medium mb-1">Todo bajo control</h3>
              <p className="text-sm text-slate-500">No hay alumnos que requieran atención urgente en este momento.</p>
            </div>
          ) : (
            <div className="card divide-y divide-[#1e2d45]">
              {alertas.map(al => (
                <div key={`${al.dni}-${al.grupo}`} className="p-4 hover:bg-[#1a2236] transition-colors flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/alumno/${al.dni}?grupo=${encodeURIComponent(al.grupo)}`} className="font-medium text-white hover:text-indigo-400 transition-colors">
                      {getNombreCompleto(al)}
                    </Link>
                    <p className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-md mt-0.5">{al.grupo}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {al.deuda_total > 0 && (
                      <span className="text-xs font-medium text-red-400">Deuda: {formatCurrency(al.deuda_total)}</span>
                    )}
                    {al.riesgo_academico === 'alto' && (
                      <span className={getRiesgoColor('alto').badge + ' px-2 py-0.5 rounded text-[10px]'}>Riesgo Alto</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna lateral: Mis Grupos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Mis Grupos ({grupos.length})</h2>
            <Link href="/grupos" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">Ver todos</Link>
          </div>
          
          <div className="card divide-y divide-[#1e2d45]">
            {grupos.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-slate-500">Aún no has importado alumnos.</p>
              </div>
            ) : (
              grupos.map(g => (
                <Link 
                  key={g.nombre} 
                  href={`/grupos/${encodeURIComponent(g.nombre)}`}
                  className="p-4 flex items-center justify-between hover:bg-[#1a2236] transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-300 group-hover:text-white truncate">{g.nombre}</p>
                  </div>
                  <div className="shrink-0 bg-[#0d1626] px-2 py-1 rounded text-xs font-medium text-slate-400 border border-[#1e2d45]">
                    {g.total}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
