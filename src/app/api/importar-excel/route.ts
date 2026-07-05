import { createClient } from '@/lib/supabase/server'
import { parseExcelBuffer } from '@/lib/excel-parser'
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

    let procesados = 0
    let errores = 0
    const start = Date.now()

    // Procesar en lotes de 50
    const batchSize = 50
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      
      for (const row of batch) {
        try {
          const { error: upsertError } = await supabase
            .from('alumnos')
            .upsert({
              dni: row.dni,
              grupo: row.grupo,
              persona: row.persona,
              alumno_codigo: row.alumno_codigo,
              codigo_pago: row.codigo_pago,
              estructura: row.estructura,
              semestre: row.semestre,
              nombre_completo: row.nombre_completo,
              sede: row.sede,
              carrera: row.carrera,
              programa: row.programa,
              ciclo: row.ciclo,
              seccion: row.seccion,
              nota_1: row.nota_1,
              nota_2: row.nota_2,
              nota_3: row.nota_3,
              nota_4: row.nota_4,
              nota_5: row.nota_5,
              nota_6: row.nota_6,
              nota_7: row.nota_7,
              nota_8: row.nota_8,
              nota_9: row.nota_9,
              nota_10: row.nota_10,
              nota_11: row.nota_11,
              nota_12: row.nota_12,
              mat_boleta: row.mat_boleta,
              mat_fecha: row.mat_fecha,
              mat_importe: row.mat_importe,
              c1_boleta: row.c1_boleta,
              c1_fecha: row.c1_fecha,
              c1_importe: row.c1_importe,
              c2_boleta: row.c2_boleta,
              c2_fecha: row.c2_fecha,
              c2_importe: row.c2_importe,
              c3_boleta: row.c3_boleta,
              c3_fecha: row.c3_fecha,
              c3_importe: row.c3_importe,
              c4_boleta: row.c4_boleta,
              c4_fecha: row.c4_fecha,
              c4_importe: row.c4_importe,
              c5_boleta: row.c5_boleta,
              c5_fecha: row.c5_fecha,
              c5_importe: row.c5_importe,
              xcico_boleta: row.xcico_boleta,
              xcico_fecha: row.xcico_fecha,
              xcico_importe: row.xcico_importe,
              rati_boleta: row.rati_boleta,
              rati_fecha: row.rati_fecha,
              rati_importe: row.rati_importe,
              email: row.email,
              telefono: row.telefono,
              celular: row.celular,
              direccion: row.direccion,
              ubigeo: row.ubigeo,
              escala: row.escala,
              observacion_excel: row.observacion_excel,
              curricula: row.curricula,
              descripcion_grupo: row.descripcion_grupo,
              fecha_matricula: row.fecha_matricula,
              matriculado: row.matriculado,
              categoria: row.categoria,
              importe_total: row.importe_total,
              total_pagado: row.total_pagado,
              deuda: row.deuda,
              ven_1: row.ven_1,
              ven_2: row.ven_2,
              ven_3: row.ven_3,
              ven_4: row.ven_4,
              ven_5: row.ven_5,
              deuda_1: row.deuda_1,
              deuda_2: row.deuda_2,
              deuda_3: row.deuda_3,
              deuda_4: row.deuda_4,
              deuda_5: row.deuda_5,
              ultima_importacion: new Date().toISOString()
            }, { onConflict: 'dni,grupo' })

          if (upsertError) throw upsertError
          procesados++
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
      actualizados: procesados,
      errores: errores,
      duracion_ms: duracion_ms
    })

    return NextResponse.json({
      success: true,
      result: { total, procesados, errores, duracion_ms }
    })

  } catch (error: any) {
    console.error('Error importando Excel:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
