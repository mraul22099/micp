import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { dni, grupo } = await request.json()

    if (!dni || !grupo) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { error } = await supabase
      .from('mis_alumnos')
      .upsert({ dni, grupo }, { onConflict: 'dni,grupo' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const dni = searchParams.get('dni')
    const grupo = searchParams.get('grupo')

    if (!dni || !grupo) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { error } = await supabase
      .from('mis_alumnos')
      .delete()
      .match({ dni, grupo })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
