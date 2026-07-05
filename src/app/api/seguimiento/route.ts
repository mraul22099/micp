import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const data = await request.json()

    if (!data.dni || !data.grupo) {
      return NextResponse.json({ error: 'Faltan datos (DNI/Grupo)' }, { status: 400 })
    }

    const { error } = await supabase
      .from('seguimiento')
      .upsert({ 
        dni: data.dni,
        grupo: data.grupo,
        riesgo_academico: data.riesgo_academico || 'sin_evaluar',
        estado_seguimiento: data.estado_seguimiento || 'sin_contactar',
        ultima_comunicacion: data.ultima_comunicacion || null,
        telefono_alterno: data.telefono_alterno || null,
        observacion: data.observacion || null,
        actualizado_en: new Date().toISOString()
      }, { onConflict: 'dni,grupo' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
