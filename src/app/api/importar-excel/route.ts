import { createClient } from '@/lib/supabase/server'
import { parseExcelBuffer } from '@/lib/excel-parser'
import { parseCuotas } from '@/lib/excel-parser'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // Verificar auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const { rows, total } = await parseExcelBuffer(buffer)

    let nuevos = 0
    let actualizados = 0
    let errores = 0
    const start = Date.now()

    // Procesar en lotes para no saturar
    const batchSize = 100
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      
      for (const row of batch) {
        try {
          // Upsert Alumno
          const { data: alumnoData, error: alumnoError } = await supabase
            .from('alumnos')
            .upsert({
              dni: row.dni,
              grupo: row.grupo,
              nombre: row.nombre,
              paterno: row.paterno,
              materno: row.materno,
              celular: row.celular,
              email: row.email,
              carrera: row.carrera,
              turno: row.turno,
              horario: row.horario,
              frecuencia: row.frecuencia,
              local: row.local,
              fecha_inicio: row.fecha_inicio,
              fecha_inscripcion: row.fecha_inscripcion,
              estado_matricula: row.estado_matricula,
              nota_final: row.nota_final,
              promocion: row.promocion,
              nro_inscripcion: row.nro_inscripcion,
              monto_inscripcion: row.monto_inscripcion,
              tipo_pago_inscripcion: row.tipo_pago_inscripcion,
              fecha_pago_inscripcion: row.fecha_pago_inscripcion,
              nro_matricula: row.nro_matricula,
              monto_matricula: row.monto_matricula,
              tipo_pago_matricula: row.tipo_pago_matricula,
              fecha_pago_matricula: row.fecha_pago_matricula,
              total_pagado_cuotas: row.total_pagado_cuotas,
              deuda_total: row.deuda_total,
              ultima_importacion: new Date().toISOString()
            }, { onConflict: 'dni,grupo' })
            .select('id')
            .single()

          if (alumnoError) throw alumnoError
          
          actualizados++ // Simplificación: asumimos actualizados si upsert pasa. Supabase no retorna status exacto de insert/update en JS simple

          // Procesar Cuotas
          if (alumnoData?.id) {
            const cuotasParsed = parseCuotas(row.cuotas_programadas_raw, row.cuotas_pagadas_raw)
            if (cuotasParsed.length > 0) {
              // Borrar anteriores
              await supabase.from('cuotas').delete().eq('alumno_id', alumnoData.id)
              // Insertar nuevas
              const cuotasToInsert = cuotasParsed.map(c => ({
                alumno_id: alumnoData.id,
                nro_cuota: c.nro_cuota,
                fecha_programada: c.fecha_programada,
                monto_programado: c.monto_programado,
                monto_pagado: c.monto_pagado,
                nro_recibo: c.nro_recibo,
                tipo_pago: c.tipo_pago,
                fecha_pago: c.fecha_pago,
                estado: (c.monto_pagado >= c.monto_programado && c.monto_programado > 0) ? 'pagado' :
                        (c.fecha_programada && new Date(c.fecha_programada) < new Date()) ? 'vencido' : 'pendiente'
              }))
              await supabase.from('cuotas').insert(cuotasToInsert)
            }
          }
        } catch (e) {
          console.error(`Error procesando DNI ${row.dni}:`, e)
          errores++
        }
      }
    }

    const duracion_ms = Date.now() - start

    // Guardar log de importación
    await supabase.from('importaciones').insert({
      nombre_archivo: file.name,
      total_filas: total,
      actualizados: actualizados,
      errores: errores,
      duracion_ms: duracion_ms
    })

    return NextResponse.json({
      success: true,
      result: { total, actualizados, errores, duracion_ms }
    })

  } catch (error: any) {
    console.error('Error importando Excel:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
