'use client'

import { useState } from 'react'
import { ImportResult } from '@/lib/types'
import { parseExcelBuffer } from '@/lib/excel-parser'

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
      setResult(null)
      setProgress(0)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Selecciona un archivo Excel primero')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setProgress(5) // Start processing

    try {
      const startTime = Date.now()
      
      // 1. Leer el archivo en el navegador
      const buffer = await file.arrayBuffer()
      setProgress(15) // File loaded into memory
      
      // 2. Parsear el Excel en el navegador (Evita subir 5MB al servidor de golpe)
      const { rows, total } = await parseExcelBuffer(buffer)
      setProgress(30) // File parsed

      if (total === 0) {
        throw new Error('El archivo no contiene alumnos válidos (no se encontró DNI o Grupo)')
      }

      // 3. Enviar a la API en lotes pequeños (Evita el Timeout de 10s de Vercel)
      const batchSize = 100 // 100 alumnos por petición
      let procesados = 0
      let errores = 0

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        const isLastBatch = i + batchSize >= rows.length
        
        const res = await fetch('/api/importar-excel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            rows: batch,
            isLastBatch,
            totalRows: total,
            totalProcesados: procesados,
            totalErrores: errores,
            duracionMs: Date.now() - startTime
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Error al importar un lote')
        }

        procesados += data.result.procesados
        errores += data.result.errores
        
        // Actualizar barra de progreso (30% to 100%)
        const percentage = 30 + Math.round(((i + batchSize) / total) * 70)
        setProgress(Math.min(percentage, 100))
      }

      const duracion_ms = Date.now() - startTime

      setResult({
        total,
        actualizados: procesados,
        errores,
        duracion_ms
      })
      
      setFile(null)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (err: any) {
      setError(err.message)
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Importar Excel</h1>
        <p className="text-slate-400 mt-1">Sube el archivo maestro del instituto para actualizar los datos de pagos.</p>
      </div>

      <div className="card p-6 md:p-10">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#1e2d45] rounded-2xl p-10 bg-[#0d1626]/50 transition-colors hover:bg-[#1a2236]/50">
          <svg className="w-12 h-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          
          <div className="text-center mb-6">
            <p className="text-sm text-slate-300 font-medium mb-1">
              {file ? file.name : 'Arrastra tu archivo o haz clic aquí'}
            </p>
            <p className="text-xs text-slate-500">
              Solo archivos .xlsx
            </p>
          </div>

          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="btn-ghost flex-1 text-sm border border-[#1e2d45]"
              disabled={loading}
            >
              Seleccionar
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? 'Procesando...' : 'Importar'}
            </button>
          </div>
          
          {/* Barra de progreso */}
          {loading && (
            <div className="w-full max-w-xs mt-6">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-[#1e2d45] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                {progress < 30 ? 'Leyendo Excel...' : 'Guardando en la base de datos (por lotes)...'}
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-400">Error en la importación</h3>
            <p className="text-sm text-red-400/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-emerald-400">¡Importación Exitosa!</h3>
              <p className="text-sm text-emerald-400/80">Procesado en {(result.duracion_ms / 1000).toFixed(1)} segundos</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#0a0f1e]/50 rounded-lg p-3 border border-emerald-500/10">
              <p className="text-xs text-slate-400 mb-1">Total Procesados</p>
              <p className="text-xl font-semibold text-white">{result.total}</p>
            </div>
            <div className="bg-[#0a0f1e]/50 rounded-lg p-3 border border-emerald-500/10">
              <p className="text-xs text-slate-400 mb-1">Guardados</p>
              <p className="text-xl font-semibold text-white">{result.actualizados}</p>
            </div>
            <div className="bg-[#0a0f1e]/50 rounded-lg p-3 border border-emerald-500/10">
              <p className="text-xs text-slate-400 mb-1">Errores</p>
              <p className="text-xl font-semibold text-red-400">{result.errores}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
