import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, getEstadoColor, getNombreCompleto, getRiesgoColor } from '@/lib/utils'

export default async function GrupoDetallePage({ params }: { params: { grupo: string } }) {
  const decodedGrupo = decodeURIComponent(params.grupo)
  const supabase = createClient()
  
  const { data: alumnos, error } = await supabase
    .from('vista_mis_alumnos')
    .select('*')
    .eq('grupo', decodedGrupo)
    .order('paterno', { ascending: true })
    
  if (error) {
    console.error('Error fetching grupo:', error)
  }

  const list = alumnos || []
  const carrera = list[0]?.carrera || '—'

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 mb-6">
        <Link href="/grupos" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-2 w-fit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Grupos
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{decodedGrupo}</h1>
          <p className="text-slate-400 mt-2">{carrera}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0a0f1e]/50 border-b border-[#1e2d45]">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Alumno</th>
                <th className="px-4 py-3 font-medium text-slate-400">Contacto</th>
                <th className="px-4 py-3 font-medium text-slate-400">Estado Matrícula</th>
                <th className="px-4 py-3 font-medium text-slate-400 text-right">Deuda</th>
                <th className="px-4 py-3 font-medium text-slate-400 text-center">Riesgo</th>
                <th className="px-4 py-3 font-medium text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d45]">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No hay alumnos en este grupo.
                  </td>
                </tr>
              ) : (
                list.map((al) => (
                  <tr key={al.dni} className="hover:bg-[#1a2236]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{getNombreCompleto(al)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">DNI: {al.dni}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-300">{al.celular || '—'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{al.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getEstadoColor(al.estado_matricula)}`}>
                        {al.estado_matricula || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {al.deuda_total > 0 ? (
                        <span className="font-medium text-red-400">{formatCurrency(al.deuda_total)}</span>
                      ) : (
                        <span className="text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-1 rounded">Al Día</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <div className={`w-3 h-3 rounded-full ${getRiesgoColor(al.riesgo_academico).dot}`} title={getRiesgoColor(al.riesgo_academico).label} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link 
                        href={`/alumno/${al.dni}?grupo=${encodeURIComponent(al.grupo)}`}
                        className="btn-ghost inline-flex text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs px-3 py-1.5"
                      >
                        Ver Perfil
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
