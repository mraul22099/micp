import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ControlPagosPage() {
  const supabase = createClient()

  // Obtener alumnos de mis_alumnos con todos sus datos de alumnos
  const { data: misAlumnos, error } = await supabase
    .from('mis_alumnos')
    .select('dni, grupo, ciclo, carrera, semestre')
    .order('grupo', { ascending: true })

  let alumnos: any[] = []
  if (misAlumnos && misAlumnos.length > 0) {
    // Para cada mi_alumno, buscar los datos completos en alumnos
    const dnis = misAlumnos.map(m => m.dni)
    const { data: alumnosData } = await supabase
      .from('alumnos')
      .select('*')
      .in('dni', dnis)
    
    if (alumnosData) {
      // Combinar datos
      alumnos = misAlumnos.map(ma => {
        const alumno = alumnosData.find(a => a.dni === ma.dni && a.grupo === ma.grupo)
        return alumno ? { ...alumno } : { dni: ma.dni, grupo: ma.grupo, ciclo: ma.ciclo, carrera: ma.carrera }
      })
    }
  }

  // Obtener semestres únicos para el header
  const semestres = [...new Set(alumnos.map(a => a.semestre).filter(Boolean))]

  return (
    <div className="p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Control de Pagos</h1>
            <p className="text-slate-400 text-sm mt-1">
              {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''} asignado{alumnos.length !== 1 ? 's' : ''}
              {semestres.length > 0 && <span className="ml-2 text-indigo-400 font-medium">· {semestres.join(', ')}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {semestres[0] || 'Sin semestre'}
            </span>
          </div>
        </div>
      </div>

      {alumnos.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Sin alumnos asignados</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Primero importa el Excel de Control de Pagos, luego agrega tus alumnos en "Mis Alumnos". Aquí aparecerá la tabla completa.
          </p>
          <div className="flex gap-3 justify-center mt-5">
            <a href="/importar" className="btn-primary text-sm">Importar Excel</a>
            <a href="/mis-alumnos" className="px-4 py-2 rounded-xl text-sm font-medium border border-[#1e2d45] text-slate-300 hover:text-white hover:bg-white/5 transition-all">Mis Alumnos</a>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs whitespace-nowrap border-collapse">
              <thead>
                <tr className="bg-[#0a1628] border-b border-[#1e2d45]">
                  <th className="sticky left-0 z-10 bg-[#0a1628] px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-[#1e2d45] min-w-[120px]">GRUPO</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[100px]">DNI</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">NOMBRE</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[80px]">CICLO</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[70px]">SECC.</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[80px]">ESCALA</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[80px]">ESTADO</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[100px]">CELULAR</th>
                  {/* Matrícula */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-amber-500/70 uppercase tracking-wider border-l border-[#1e2d45] min-w-[100px]">MAT - Boleta</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-amber-500/70 uppercase tracking-wider min-w-[90px]">MAT - Fecha</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-amber-500/70 uppercase tracking-wider min-w-[80px]">MAT - S/.</th>
                  {/* C1 */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-blue-500/70 uppercase tracking-wider border-l border-[#1e2d45] min-w-[100px]">C1 - Boleta</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-blue-500/70 uppercase tracking-wider min-w-[90px]">C1 - Fecha</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-blue-500/70 uppercase tracking-wider min-w-[80px]">C1 - S/.</th>
                  {/* C2 */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-purple-500/70 uppercase tracking-wider border-l border-[#1e2d45] min-w-[100px]">C2 - Boleta</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-purple-500/70 uppercase tracking-wider min-w-[90px]">C2 - Fecha</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-purple-500/70 uppercase tracking-wider min-w-[80px]">C2 - S/.</th>
                  {/* C3 */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-emerald-500/70 uppercase tracking-wider border-l border-[#1e2d45] min-w-[100px]">C3 - Boleta</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-emerald-500/70 uppercase tracking-wider min-w-[90px]">C3 - Fecha</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-emerald-500/70 uppercase tracking-wider min-w-[80px]">C3 - S/.</th>
                  {/* C4 */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-rose-500/70 uppercase tracking-wider border-l border-[#1e2d45] min-w-[100px]">C4 - Boleta</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-rose-500/70 uppercase tracking-wider min-w-[90px]">C4 - Fecha</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-rose-500/70 uppercase tracking-wider min-w-[80px]">C4 - S/.</th>
                  {/* C5 */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-cyan-500/70 uppercase tracking-wider border-l border-[#1e2d45] min-w-[100px]">C5 - Boleta</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-cyan-500/70 uppercase tracking-wider min-w-[90px]">C5 - Fecha</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-cyan-500/70 uppercase tracking-wider min-w-[80px]">C5 - S/.</th>
                  {/* XCICO */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-yellow-500/70 uppercase tracking-wider border-l border-[#1e2d45] min-w-[100px]">XCICO - Boleta</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-yellow-500/70 uppercase tracking-wider min-w-[90px]">XCICO - Fecha</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-yellow-500/70 uppercase tracking-wider min-w-[80px]">XCICO - S/.</th>
                  {/* RATI */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-orange-500/70 uppercase tracking-wider border-l border-[#1e2d45] min-w-[100px]">RATI - Boleta</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-orange-500/70 uppercase tracking-wider min-w-[90px]">RATI - Fecha</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-orange-500/70 uppercase tracking-wider min-w-[80px]">RATI - S/.</th>
                  {/* Totales / Deuda */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-l border-[#1e2d45] min-w-[90px]">TOTAL</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider min-w-[80px]">PAGADO</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-red-400/80 uppercase tracking-wider min-w-[80px]">DEUDA</th>
                  {/* Vencimientos */}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-l border-[#1e2d45] min-w-[85px]">VEN 1</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[85px]">VEN 2</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[85px]">VEN 3</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[85px]">VEN 4</th>
                  <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[85px]">VEN 5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d45]">
                {alumnos.map((alumno, i) => {
                  const tieneDeuda = alumno.deuda && alumno.deuda < 0
                  return (
                    <tr key={`${alumno.dni}-${alumno.grupo}-${i}`}
                      className={`hover:bg-white/[0.02] transition-colors ${tieneDeuda ? 'bg-red-500/5' : ''}`}>
                      {/* GRUPO */}
                      <td className="sticky left-0 z-10 bg-[#0d1626] px-3 py-2.5 font-medium text-indigo-300 border-r border-[#1e2d45] text-xs">
                        {alumno.grupo || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-300 font-mono">{alumno.dni || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-200 font-medium max-w-[200px] truncate">{alumno.nombre_completo || `${alumno.dni}`}</td>
                      <td className="px-3 py-2.5 text-slate-400">{alumno.ciclo || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400">{alumno.seccion || '—'}</td>
                      <td className="px-3 py-2.5">
                        {alumno.escala ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-300">{alumno.escala}</span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        {alumno.matriculado === '1' || alumno.matriculado === 1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">Matric.</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/50 text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px]">{alumno.celular || '—'}</td>

                      {/* MAT */}
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] border-l border-[#1e2d45]">{alumno.mat_boleta || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{alumno.mat_fecha || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300">{alumno.mat_importe ? `${alumno.mat_importe}` : '—'}</td>

                      {/* C1 */}
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] border-l border-[#1e2d45]">{alumno.c1_boleta || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{alumno.c1_fecha || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300">{alumno.c1_importe ? `${alumno.c1_importe}` : '—'}</td>

                      {/* C2 */}
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] border-l border-[#1e2d45]">{alumno.c2_boleta || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{alumno.c2_fecha || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300">{alumno.c2_importe ? `${alumno.c2_importe}` : '—'}</td>

                      {/* C3 */}
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] border-l border-[#1e2d45]">{alumno.c3_boleta || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{alumno.c3_fecha || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300">{alumno.c3_importe ? `${alumno.c3_importe}` : '—'}</td>

                      {/* C4 */}
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] border-l border-[#1e2d45]">{alumno.c4_boleta || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{alumno.c4_fecha || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300">{alumno.c4_importe ? `${alumno.c4_importe}` : '—'}</td>

                      {/* C5 */}
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] border-l border-[#1e2d45]">{alumno.c5_boleta || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{alumno.c5_fecha || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300">{alumno.c5_importe ? `${alumno.c5_importe}` : '—'}</td>

                      {/* XCICO */}
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] border-l border-[#1e2d45]">{alumno.xcico_boleta || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{alumno.xcico_fecha || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300">{alumno.xcico_importe ? `${alumno.xcico_importe}` : '—'}</td>

                      {/* RATI */}
                      <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] border-l border-[#1e2d45]">{alumno.rati_boleta || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{alumno.rati_fecha || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300">{alumno.rati_importe ? `${alumno.rati_importe}` : '—'}</td>

                      {/* Totales */}
                      <td className="px-3 py-2.5 text-right font-medium text-slate-300 border-l border-[#1e2d45]">{alumno.importe_total || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-emerald-400">{alumno.total_pagado || '—'}</td>
                      <td className={`px-3 py-2.5 text-right font-bold ${tieneDeuda ? 'text-red-400' : 'text-emerald-400'}`}>
                        {alumno.deuda !== null && alumno.deuda !== undefined ? alumno.deuda : '—'}
                      </td>

                      {/* Vencimientos */}
                      <td className="px-3 py-2.5 text-slate-500 text-[11px] border-l border-[#1e2d45]">{alumno.ven_1 || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-[11px]">{alumno.ven_2 || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-[11px]">{alumno.ven_3 || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-[11px]">{alumno.ven_4 || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-[11px]">{alumno.ven_5 || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
