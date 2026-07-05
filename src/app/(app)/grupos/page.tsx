import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function GruposPage() {
  const supabase = createClient()
  
  const { data: alumnos, error } = await supabase
    .from('vista_mis_alumnos')
    .select('*')
    
  if (error) {
    console.error('Error fetching grupos:', error)
  }

  const list = alumnos || []
  
  // Agrupar por grupo
  const gruposMap = new Map<string, any>()
  list.forEach(a => {
    if (!gruposMap.has(a.grupo)) {
      gruposMap.set(a.grupo, { nombre: a.grupo, total: 0, alDia: 0, conDeuda: 0, deudaTotal: 0, carrera: a.carrera })
    }
    const stats = gruposMap.get(a.grupo)
    stats.total++
    if (a.deuda_total <= 0) stats.alDia++
    else {
      stats.conDeuda++
      stats.deudaTotal += Number(a.deuda_total)
    }
  })
  
  const grupos = Array.from(gruposMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mis Grupos</h1>
          <p className="text-slate-400 mt-1">Gestión de todos los grupos que tienes asignados.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {grupos.length === 0 ? (
          <div className="col-span-full card p-10 text-center border-dashed">
            <p className="text-slate-400 mb-4">No tienes alumnos importados o asignados a tu lista.</p>
            <Link href="/importar" className="btn-primary inline-flex">
              Importar Datos
            </Link>
          </div>
        ) : (
          grupos.map(g => (
            <Link 
              key={g.nombre} 
              href={`/grupos/${encodeURIComponent(g.nombre)}`}
              className="card p-5 card-hover block group"
            >
              <div className="flex items-start justify-between mb-4 gap-2">
                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2" title={g.nombre}>
                  {g.nombre}
                </h3>
                <span className="shrink-0 bg-[#0d1626] border border-[#1e2d45] text-slate-300 text-xs font-medium px-2.5 py-1 rounded-lg">
                  {g.total} alumnos
                </span>
              </div>
              
              <p className="text-xs text-slate-500 mb-4 line-clamp-1" title={g.carrera}>{g.carrera}</p>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1e2d45]">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Al Día</p>
                  <p className="font-medium text-emerald-400">{g.alDia}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Con Deuda</p>
                  <p className="font-medium text-red-400">{g.conDeuda}</p>
                </div>
                {g.deudaTotal > 0 && (
                  <div className="col-span-2 pt-2">
                    <p className="text-xs text-slate-500 mb-1">Deuda Acumulada</p>
                    <p className="font-medium text-red-400 text-sm">{formatCurrency(g.deudaTotal)}</p>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
