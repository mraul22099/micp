import { read, utils } from 'xlsx'

interface ExcelRow {
  dni: string
  grupo: string
  nombre: string
  paterno: string
  materno: string
  celular: string
  email: string
  carrera: string
  turno: string
  horario: string
  frecuencia: string
  local: string
  fecha_inicio: string | null
  fecha_inscripcion: string | null
  estado_matricula: string
  nota_final: number | null
  promocion: string
  nro_inscripcion: string
  monto_inscripcion: number
  tipo_pago_inscripcion: string
  fecha_pago_inscripcion: string | null
  nro_matricula: string
  monto_matricula: number
  tipo_pago_matricula: string
  fecha_pago_matricula: string | null
  total_pagado_cuotas: number
  deuda_total: number
  cuotas_programadas_raw: string
  cuotas_pagadas_raw: string
}

interface CuotaParsed {
  nro_cuota: number
  fecha_programada: string | null
  monto_programado: number
  monto_pagado: number
  nro_recibo: string | null
  tipo_pago: string | null
  fecha_pago: string | null
}

function parseDate(val: unknown): string | null {
  if (!val) return null
  if (typeof val === 'string') {
    // Intentar parsear string de fecha
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
    return null
  }
  if (typeof val === 'number') {
    // Número serial de Excel
    const utc_days = Math.floor(val - 25569)
    const date = new Date(utc_days * 86400000)
    return date.toISOString().split('T')[0]
  }
  return null
}

function parseNum(val: unknown): number {
  if (!val) return 0
  const n = parseFloat(String(val))
  return isNaN(n) ? 0 : n
}

function parseStr(val: unknown): string {
  if (!val) return ''
  return String(val).trim()
}

/**
 * Parsea "1 / 2026-01-05 / 290.00\n2 / 2026-02-05 / 290.00" → array de cuotas programadas
 */
function parseCuotasProgramadas(raw: string): Array<{ nro: number; fecha: string | null; monto: number }> {
  if (!raw) return []
  return raw.split('\n').map(line => {
    const parts = line.split('/').map(s => s.trim())
    return {
      nro: parseInt(parts[0]) || 0,
      fecha: parts[1] || null,
      monto: parseFloat(parts[2]) || 0,
    }
  }).filter(c => c.nro > 0)
}

/**
 * Parsea "1 / 290.00 / NRO_RECIBO / TIPO_PAGO / 2026-01-01" → array de pagos
 */
function parseCuotasPagadas(raw: string): Array<{ nro: number; monto: number; recibo: string; tipo: string; fecha: string | null }> {
  if (!raw) return []
  return raw.split('\n').map(line => {
    const parts = line.split('/').map(s => s.trim())
    return {
      nro: parseInt(parts[0]) || 0,
      monto: parseFloat(parts[1]) || 0,
      recibo: parts.slice(2, parts.length - 2).join('/').trim() || '',
      tipo: parts[parts.length - 2] || '',
      fecha: parts[parts.length - 1] || null,
    }
  }).filter(c => c.nro > 0)
}

export function parseCuotas(programadasRaw: string, pagadasRaw: string): CuotaParsed[] {
  const prog = parseCuotasProgramadas(programadasRaw)
  const pag = parseCuotasPagadas(pagadasRaw)

  const hoy = new Date()

  return prog.map(p => {
    const pago = pag.find(pg => pg.nro === p.nro)
    const fechaObj = p.fecha ? new Date(p.fecha + 'T00:00:00') : null
    const montoPagado = pago?.monto || 0
    let estado: 'pagado' | 'pendiente' | 'vencido' = 'pendiente'
    if (montoPagado >= p.monto && p.monto > 0) {
      estado = 'pagado'
    } else if (fechaObj && fechaObj < hoy) {
      estado = 'vencido'
    }

    return {
      nro_cuota: p.nro,
      fecha_programada: p.fecha,
      monto_programado: p.monto,
      monto_pagado: montoPagado,
      nro_recibo: pago?.recibo || null,
      tipo_pago: pago?.tipo || null,
      fecha_pago: pago?.fecha || null,
    }
  })
}

export async function parseExcelBuffer(buffer: ArrayBuffer): Promise<{ rows: ExcelRow[]; total: number }> {
  const wb = read(buffer, { type: 'array', cellDates: false })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]

  // La fila 3 (índice 2) es el header real — columnas A..BY
  const raw = utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][]

  // Fila header está en índice 2 (fila 3 del Excel)
  // Datos empiezan en índice 3 (fila 4 del Excel)
  const dataRows = raw.slice(3)
  const rows: ExcelRow[] = []

  for (const row of dataRows) {
    const get = (col: number) => row[col] ?? null

    const dni = parseStr(get(1))  // B
    const grupo = parseStr(get(25)) // Z

    if (!dni || !grupo) continue

    rows.push({
      dni,
      grupo,
      nombre: parseStr(get(2)),          // C
      paterno: parseStr(get(3)),          // D
      materno: parseStr(get(4)),          // E
      celular: parseStr(get(5)),          // F
      email: parseStr(get(6)),            // G
      carrera: parseStr(get(24)),         // Y
      turno: parseStr(get(29)),           // AD
      horario: parseStr(get(28)),         // AC
      frecuencia: parseStr(get(27)),      // AB
      local: parseStr(get(26)),           // AA
      fecha_inicio: parseDate(get(30)),   // AE
      fecha_inscripcion: parseDate(get(22)), // W
      estado_matricula: parseStr(get(73)), // BV (índice 0-based: A=0,B=1...BV=73)
      nota_final: parseNum(get(57)) || null, // BF
      promocion: parseStr(get(32)),       // AG
      nro_inscripcion: parseStr(get(47)), // AV
      monto_inscripcion: parseNum(get(48)), // AW
      tipo_pago_inscripcion: parseStr(get(49)), // AX
      fecha_pago_inscripcion: parseDate(get(50)), // AY
      nro_matricula: parseStr(get(51)),   // AZ
      monto_matricula: parseNum(get(52)), // BA
      tipo_pago_matricula: parseStr(get(53)), // BB
      fecha_pago_matricula: parseDate(get(54)), // BC
      total_pagado_cuotas: parseNum(get(60)), // BI
      deuda_total: parseNum(get(64)),     // BM
      cuotas_programadas_raw: parseStr(get(58)), // BG
      cuotas_pagadas_raw: parseStr(get(59)),     // BH
    })
  }

  return { rows, total: rows.length }
}
