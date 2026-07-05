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
                {/* Fila 1 de Cabecera (Agrupaciones) */}
                <tr className="bg-[#0a1628] border-b border-[#1e2d45]">
                  <th colSpan={24} className="sticky left-0 z-10 bg-[#0a1628] px-3 py-2 text-left text-[11px] font-bold text-indigo-400 border-r border-[#1e2d45]">
                    SEMESTRE: {semestres[0] || '2025-1'}
                  </th>
                  <th colSpan={6} className="px-3 py-2 text-center text-[11px] font-bold text-amber-500/90 border-r border-[#1e2d45] bg-amber-500/5">MAT</th>
                  <th colSpan={5} className="px-3 py-2 text-center text-[11px] font-bold text-blue-500/90 border-r border-[#1e2d45] bg-blue-500/5">1C</th>
                  <th colSpan={5} className="px-3 py-2 text-center text-[11px] font-bold text-purple-500/90 border-r border-[#1e2d45] bg-purple-500/5">2C</th>
                  <th colSpan={5} className="px-3 py-2 text-center text-[11px] font-bold text-emerald-500/90 border-r border-[#1e2d45] bg-emerald-500/5">3C</th>
                  <th colSpan={5} className="px-3 py-2 text-center text-[11px] font-bold text-rose-500/90 border-r border-[#1e2d45] bg-rose-500/5">4C</th>
                  <th colSpan={5} className="px-3 py-2 text-center text-[11px] font-bold text-cyan-500/90 bg-cyan-500/5">5C</th>
                </tr>
                {/* Fila 2 de Cabecera (Columnas detalladas) */}
                <tr className="bg-[#0a1628] border-b border-[#1e2d45]">
                  {/* Datos del Alumno */}
                  <th className="sticky left-0 z-10 bg-[#0a1628] px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase min-w-[120px] border-r border-[#1e2d45]">DNI/CARRERA</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">OBS</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">ORDEN</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">INICIO/GRUPO</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">DNI</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">CARRERA</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">RATI</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">CICLO</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">Ciclo Grupo Sección</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">Fecha Matricula</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">Cursos Desapr</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">ESTADO</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">INICIO</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">Q10</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">NRO CUOTAS DEBE</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">MAT</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">ESCALA</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">XCICO</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">Cursos Desapr</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">ESTADO</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">CEL</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">MASIVO</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase">MES</th>
                  <th className="px-2 py-3 text-left text-[9px] font-semibold text-slate-500 uppercase border-r border-[#1e2d45]">DIAS FATLAN</th>
                  
                  {/* MAT */}
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-amber-500/70 uppercase">FECHA</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-amber-500/70 uppercase">BOLETA -MAT</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-amber-500/70 uppercase">MONTO</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-amber-500/70 uppercase">x</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-amber-500/70 uppercase">x</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-amber-500/70 uppercase border-r border-[#1e2d45]">x</th>
                  
                  {/* 1C */}
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-blue-500/70 uppercase">FECHA</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-blue-500/70 uppercase">BOLETA -1C</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-blue-500/70 uppercase">MONTO</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-blue-500/70 uppercase">X</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-blue-500/70 uppercase border-r border-[#1e2d45]">X</th>
                  
                  {/* 2C */}
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-purple-500/70 uppercase">FECHA</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-purple-500/70 uppercase">BOLETA -2C</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-purple-500/70 uppercase">MONTO</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-purple-500/70 uppercase">CUR.01</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-purple-500/70 uppercase border-r border-[#1e2d45]">CUR.02</th>
                  
                  {/* 3C */}
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-emerald-500/70 uppercase">FECHA</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-emerald-500/70 uppercase">BOLETA -3C</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-emerald-500/70 uppercase">MONTO</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-emerald-500/70 uppercase">CUR.03</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-emerald-500/70 uppercase border-r border-[#1e2d45]">CUR.04</th>
                  
                  {/* 4C */}
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-rose-500/70 uppercase">FECHA</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-rose-500/70 uppercase">BOLETA -4C</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-rose-500/70 uppercase">MONTO</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-rose-500/70 uppercase">CUR.05</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-rose-500/70 uppercase border-r border-[#1e2d45]">CUR.06</th>
                  
                  {/* 5C */}
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-cyan-500/70 uppercase">FECHA</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-cyan-500/70 uppercase">BOLETA -5C</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-cyan-500/70 uppercase">MONTO</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-cyan-500/70 uppercase">CUR.07</th>
                  <th className="px-2 py-3 text-center text-[9px] font-semibold text-cyan-500/70 uppercase">CUR.08</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d45]">
                {alumnos.map((alumno, i) => {
                  const deudas = [alumno.deuda_1, alumno.deuda_2, alumno.deuda_3, alumno.deuda_4, alumno.deuda_5];
                  const nroCuotasDebe = deudas.filter(d => typeof d === 'number' && d < 0).length;
                  
                  return (
                    <tr key={`${alumno.dni}-${alumno.grupo}-${i}`}
                      className={`hover:bg-white/[0.02] transition-colors ${nroCuotasDebe > 0 ? 'bg-red-500/5' : ''}`}>
                      
                      {/* Datos Base */}
                      <td className="sticky left-0 z-10 bg-[#0d1626] px-2 py-1.5 border-r border-[#1e2d45]">
                        <div className="font-semibold text-indigo-300 text-[10px] leading-tight">{alumno.dni || '—'}</div>
                        <div className="text-slate-500 text-[9px] truncate max-w-[120px]" title={alumno.carrera}>{alumno.carrera || '—'}</div>
                      </td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">{alumno.observacion_excel || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-500 text-[10px] text-center">{i + 1}</td>
                      <td className="px-2 py-1.5 text-slate-300 font-medium text-[10px]">{alumno.grupo || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-300 font-mono text-[10px]">{alumno.dni || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px] max-w-[150px] truncate" title={alumno.carrera}>{alumno.carrera || '—'}</td>
                      <td className="px-2 py-1.5 text-orange-400 text-[10px]">{alumno.rati_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-300 text-[10px]">{alumno.ciclo || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px] whitespace-nowrap">
                        {`${alumno.ciclo || ''} ${alumno.grupo || ''} ${alumno.seccion || ''}`.trim() || '—'}
                      </td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">{alumno.fecha_matricula || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">—</td>
                      <td className="px-2 py-1.5 text-emerald-400 text-[10px] font-medium">{alumno.matriculado == '1' ? 'MATRICULADO' : '—'}</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">—</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">—</td>
                      <td className={`px-2 py-1.5 text-center font-bold text-[11px] ${nroCuotasDebe > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {nroCuotasDebe}
                      </td>
                      <td className="px-2 py-1.5 text-amber-400 text-[10px]">{alumno.mat_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-300 font-medium text-[10px]">{alumno.escala || '—'}</td>
                      <td className="px-2 py-1.5 text-yellow-400 text-[10px]">{alumno.xcico_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">—</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">—</td>
                      <td className="px-2 py-1.5 text-slate-300 font-mono text-[10px]">{alumno.celular || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">—</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">—</td>
                      <td className="px-2 py-1.5 text-slate-400 text-[10px] border-r border-[#1e2d45]">—</td>
                      
                      {/* MAT */}
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">{alumno.mat_fecha || '—'}</td>
                      <td className="px-2 py-1.5 text-amber-500/70 font-mono text-[10px]">{alumno.mat_boleta || '—'}</td>
                      <td className="px-2 py-1.5 text-amber-400 font-medium text-[10px] text-right">{alumno.mat_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center">-</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center">-</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center border-r border-[#1e2d45]">-</td>

                      {/* 1C */}
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">{alumno.c1_fecha || '—'}</td>
                      <td className="px-2 py-1.5 text-blue-500/70 font-mono text-[10px]">{alumno.c1_boleta || '—'}</td>
                      <td className="px-2 py-1.5 text-blue-400 font-medium text-[10px] text-right">{alumno.c1_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center">-</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center border-r border-[#1e2d45]">-</td>

                      {/* 2C */}
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">{alumno.c2_fecha || '—'}</td>
                      <td className="px-2 py-1.5 text-purple-500/70 font-mono text-[10px]">{alumno.c2_boleta || '—'}</td>
                      <td className="px-2 py-1.5 text-purple-400 font-medium text-[10px] text-right">{alumno.c2_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center">-</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center border-r border-[#1e2d45]">-</td>

                      {/* 3C */}
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">{alumno.c3_fecha || '—'}</td>
                      <td className="px-2 py-1.5 text-emerald-500/70 font-mono text-[10px]">{alumno.c3_boleta || '—'}</td>
                      <td className="px-2 py-1.5 text-emerald-400 font-medium text-[10px] text-right">{alumno.c3_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center">-</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center border-r border-[#1e2d45]">-</td>

                      {/* 4C */}
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">{alumno.c4_fecha || '—'}</td>
                      <td className="px-2 py-1.5 text-rose-500/70 font-mono text-[10px]">{alumno.c4_boleta || '—'}</td>
                      <td className="px-2 py-1.5 text-rose-400 font-medium text-[10px] text-right">{alumno.c4_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center">-</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center border-r border-[#1e2d45]">-</td>

                      {/* 5C */}
                      <td className="px-2 py-1.5 text-slate-400 text-[10px]">{alumno.c5_fecha || '—'}</td>
                      <td className="px-2 py-1.5 text-cyan-500/70 font-mono text-[10px]">{alumno.c5_boleta || '—'}</td>
                      <td className="px-2 py-1.5 text-cyan-400 font-medium text-[10px] text-right">{alumno.c5_importe || '—'}</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center">-</td>
                      <td className="px-2 py-1.5 text-slate-600 text-[9px] text-center">-</td>
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
