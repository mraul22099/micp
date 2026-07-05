import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ExcelRow } from '@/lib/excel-parser'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // Verificar auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { filename, rows, isLastBatch, totalRows, totalProcesados, totalErrores, duracionMs } = await request.json()
    
    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Formato inválido. Se esperaba un array de filas.' }, { status: 400 })
    }

    let procesados = 0
    let errores = 0

    // En Supabase podemos hacer upsert directamente con un array de objetos
    // Esto es mucho más rápido que un loop fila por fila
    try {
      const rowsToInsert = rows.map((row: ExcelRow) => ({
        ...row,
        ultima_importacion: new Date().toISOString()
      }))

      const { error: upsertError } = await supabase
        .from('alumnos')
        .upsert(rowsToInsert, { onConflict: 'dni,grupo' })

      if (upsertError) {
        throw upsertError
      }
      
      procesados = rows.length
    } catch (e: any) {
      console.error(`Error procesando lote:`, e)
      // Si el lote completo falla, intentamos uno por uno
      for (const row of rows) {
        try {
          const { error } = await supabase
            .from('alumnos')
            .upsert({
              ...row,
              ultima_importacion: new Date().toISOString()
            }, { onConflict: 'dni,grupo' })
          if (error) throw error
          procesados++
        } catch (innerError) {
          errores++
        }
      }
    }

    // Si es el último lote, guardar el log de importación
    if (isLastBatch && filename) {
      await supabase.from('importaciones').insert({
        nombre_archivo: filename,
        total_filas: totalRows,
        actualizados: totalProcesados + procesados,
        errores: totalErrores + errores,
        duracion_ms: duracionMs
      })
    }

    return NextResponse.json({
      success: true,
      result: { procesados, errores }
    })

  } catch (error: any) {
    console.error('Error importando lote Excel:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
