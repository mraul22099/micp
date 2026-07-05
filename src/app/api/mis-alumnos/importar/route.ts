import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { read, utils } from 'xlsx'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
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
    const wb = read(buffer, { type: 'array', cellDates: false })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[]

    let agregados = 0
    let errores = 0

    for (const row of rows) {
      try {
        // Buscar columnas por nombre (case-insensitive)
        const keys = Object.keys(row)
        const findCol = (names: string[]) => {
          for (const name of names) {
            const key = keys.find(k => k.toLowerCase().trim() === name.toLowerCase())
            if (key && row[key]) return String(row[key]).trim()
          }
          return ''
        }

        const dni = findCol(['dni', 'DNI', 'Dni', 'documento', 'DOCUMENTO'])
        const carrera = findCol(['carrera', 'CARRERA', 'Carrera'])
        const ciclo = findCol(['ciclo', 'CICLO', 'Ciclo'])
        const grupo = findCol(['grupo', 'GRUPO', 'Grupo'])

        if (!dni) continue // Skip rows without DNI

        const { error } = await supabase
          .from('mis_alumnos')
          .upsert({
            dni,
            grupo: grupo || 'SIN_GRUPO',
            carrera,
            ciclo,
            agregado_en: new Date().toISOString()
          }, { onConflict: 'dni,grupo' })

        if (error) throw error
        agregados++
      } catch (e) {
        console.error('Error importando alumno:', e)
        errores++
      }
    }

    return NextResponse.json({
      success: true,
      result: { total: rows.length, agregados, errores }
    })

  } catch (error: any) {
    console.error('Error importando mis alumnos:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
