export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      {/* Spinner animado con branding */}
      <div className="relative w-16 h-16 mb-6">
        {/* Anillos exteriores */}
        <div className="absolute inset-0 rounded-full border-4 border-[#1e2d45]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        {/* Logo central (opcional, pero se ve premium) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-indigo-500/20 rounded-md"></div>
        </div>
      </div>
      
      {/* Texto premium */}
      <h3 className="text-xl font-semibold text-white tracking-tight mb-2">Cargando datos...</h3>
      <p className="text-slate-500 text-sm animate-pulse">Obteniendo la información más reciente de tus alumnos</p>
    </div>
  )
}
