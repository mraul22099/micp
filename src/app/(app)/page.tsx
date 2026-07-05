import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Contar alumnos totales importados
  const { count: totalAlumnos } = await supabase
    .from('alumnos')
    .select('*', { count: 'exact', head: true })

  // Contar mis alumnos
  const { count: totalMisAlumnos } = await supabase
    .from('mis_alumnos')
    .select('*', { count: 'exact', head: true })

  // Obtener mis alumnos con datos
  const { data: misAlumnosData } = await supabase
    .from('mis_alumnos')
    .select('dni, grupo')

  let alumnosConDeuda = 0
  let deudaTotal = 0
  let semestre = ''

  if (misAlumnosData && misAlumnosData.length > 0) {
    const dnis = misAlumnosData.map(m => m.dni)
    const { data: alumnosInfo } = await supabase
      .from('alumnos')
      .select('deuda, semestre')
      .in('dni', dnis)

    if (alumnosInfo) {
      alumnosInfo.forEach(a => {
        if (a.deuda && a.deuda < 0) {
          alumnosConDeuda++
          deudaTotal += Math.abs(a.deuda)
        }
        if (a.semestre && !semestre) semestre = a.semestre
      })
    }
  }

  // Última importación
  const { data: ultimaImport } = await supabase
    .from('importaciones')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Vista general del sistema
            {semestre && <span className="ml-2 text-indigo-400 font-medium">· Semestre {semestre}</span>}
          </p>
        </div>
      </div>

      {/* Cards resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Alumnos Importados</p>
          <p className="text-3xl font-bold text-white mt-2">{totalAlumnos || 0}</p>
          <p className="text-xs text-slate-500 mt-1">del Excel</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Mis Alumnos</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">{totalMisAlumnos || 0}</p>
          <p className="text-xs text-slate-500 mt-1">asignados</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Con Deuda</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{alumnosConDeuda}</p>
          <p className="text-xs text-slate-500 mt-1">alumno(s)</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Deuda Total</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">S/ {deudaTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">pendiente</p>
        </div>
      </div>

      {/* Última importación */}
      {ultimaImport && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Última Importación</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Archivo</p>
              <p className="text-white font-medium truncate">{ultimaImport.nombre_archivo}</p>
            </div>
            <div>
              <p className="text-slate-500">Total filas</p>
              <p className="text-white font-medium">{ultimaImport.total_filas?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500">Procesados</p>
              <p className="text-emerald-400 font-medium">{ultimaImport.actualizados?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500">Duración</p>
              <p className="text-white font-medium">{ultimaImport.duracion_ms ? `${(ultimaImport.duracion_ms / 1000).toFixed(1)}s` : '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/importar" className="card p-6 hover:border-indigo-500/30 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h3 className="text-white font-semibold">Importar Excel</h3>
          <p className="text-slate-500 text-sm mt-1">Subir el archivo Control de Pagos</p>
        </Link>

        <Link href="/mis-alumnos" className="card p-6 hover:border-emerald-500/30 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold">Mis Alumnos</h3>
          <p className="text-slate-500 text-sm mt-1">Agregar o importar mis alumnos asignados</p>
        </Link>

        <Link href="/control-pagos" className="card p-6 hover:border-amber-500/30 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold">Control de Pagos</h3>
          <p className="text-slate-500 text-sm mt-1">Ver tabla completa de pagos y deudas</p>
        </Link>
      </div>
    </div>
  )
}
