import { read, utils } from 'xlsx'

export interface ExcelRow {
  dni: string
  grupo: string
  persona: string
  alumno_codigo: string
  codigo_pago: string
  estructura: string
  semestre: string
  nombre_completo: string
  sede: string
  carrera: string
  programa: string
  ciclo: string
  seccion: string
  nota_1: number | null
  nota_2: number | null
  nota_3: number | null
  nota_4: number | null
  nota_5: number | null
  nota_6: number | null
  nota_7: number | null
  nota_8: number | null
  nota_9: number | null
  nota_10: number | null
  nota_11: number | null
  nota_12: number | null
  mat_boleta: string
  mat_fecha: string | null
  mat_importe: number
  c1_boleta: string
  c1_fecha: string | null
  c1_importe: number
  c2_boleta: string
  c2_fecha: string | null
  c2_importe: number
  c3_boleta: string
  c3_fecha: string | null
  c3_importe: number
  c4_boleta: string
  c4_fecha: string | null
  c4_importe: number
  c5_boleta: string
  c5_fecha: string | null
  c5_importe: number
  xcico_boleta: string
  xcico_fecha: string | null
  xcico_importe: number
  rati_boleta: string
  rati_fecha: string | null
  rati_importe: number
  email: string
  telefono: string
  celular: string
  direccion: string
  ubigeo: string
  escala: string
  observacion_excel: string
  curricula: string
  descripcion_grupo: string
  fecha_matricula: string | null
  matriculado: string
  categoria: string
  importe_total: number
  total_pagado: number
  deuda: number
  ven_1: string | null
  ven_2: string | null
  ven_3: string | null
  ven_4: string | null
  ven_5: string | null
  deuda_1: number
  deuda_2: number
  deuda_3: number
  deuda_4: number
  deuda_5: number
}

function parseDate(val: unknown): string | null {
  if (!val) return null
  if (typeof val === 'string') {
    const s = val.trim()
    // DD/MM/YYYY
    const ddmmyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (ddmmyyyy) {
      const [, dd, mm, yyyy] = ddmmyyyy
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
    }
    // YYYY-MM-DD already
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10)
    // DD/MM/YYYY with extra text (e.g. "30/03/2026 - CONVALIDACION")
    const ddmmWithText = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (ddmmWithText) {
      const [, dd, mm, yyyy] = ddmmWithText
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
    }
    const d = new Date(s)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
    return null
  }
  if (typeof val === 'number') {
    // Excel serial number
    const utc_days = Math.floor(val - 25569)
    const date = new Date(utc_days * 86400000)
    return date.toISOString().split('T')[0]
  }
  return null
}

function parseNum(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  const n = parseFloat(String(val))
  return isNaN(n) ? 0 : n
}

function parseStr(val: unknown): string {
  if (val === null || val === undefined) return ''
  return String(val).trim()
}

export async function parseExcelBuffer(buffer: ArrayBuffer): Promise<{ rows: ExcelRow[]; total: number }> {
  const wb = read(buffer, { type: 'array', cellDates: false })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]

  // Read all rows as arrays. Header is at row 3 (index 2), data starts at row 4 (index 3)
  const raw = utils.sheet_to_json(ws, { header: 1, defval: null }) as unknown[][]
  const dataRows = raw.slice(3) // skip rows 0,1,2 (header on index 2)
  const rows: ExcelRow[] = []

  for (const row of dataRows) {
    const get = (col: number) => row[col] ?? null

    const dni = parseStr(get(7))   // Column H (index 7)
    const grupo = parseStr(get(49)) // Column AX (index 49)

    if (!dni) continue // Skip rows without DNI

    rows.push({
      dni,
      grupo,
      persona: parseStr(get(1)),
      alumno_codigo: parseStr(get(2)),
      codigo_pago: parseStr(get(3)),
      estructura: parseStr(get(4)),
      semestre: parseStr(get(5)),
      nombre_completo: parseStr(get(6)),
      sede: parseStr(get(8)),
      carrera: parseStr(get(9)),
      programa: parseStr(get(10)),
      ciclo: parseStr(get(11)),
      seccion: parseStr(get(12)),
      // Notas 1-12 (columns 13-24)
      nota_1: parseNum(get(13)) || null,
      nota_2: parseNum(get(14)) || null,
      nota_3: parseNum(get(15)) || null,
      nota_4: parseNum(get(16)) || null,
      nota_5: parseNum(get(17)) || null,
      nota_6: parseNum(get(18)) || null,
      nota_7: parseNum(get(19)) || null,
      nota_8: parseNum(get(20)) || null,
      nota_9: parseNum(get(21)) || null,
      nota_10: parseNum(get(22)) || null,
      nota_11: parseNum(get(23)) || null,
      nota_12: parseNum(get(24)) || null,
      // Matricula (columns 25-27)
      mat_boleta: parseStr(get(25)),
      mat_fecha: parseDate(get(26)),
      mat_importe: parseNum(get(27)),
      // Cuota 1 (columns 28-30)
      c1_boleta: parseStr(get(28)),
      c1_fecha: parseDate(get(29)),
      c1_importe: parseNum(get(30)),
      // Cuota 2 (columns 31-33)
      c2_boleta: parseStr(get(31)),
      c2_fecha: parseDate(get(32)),
      c2_importe: parseNum(get(33)),
      // Cuota 3 (columns 34-36)
      c3_boleta: parseStr(get(34)),
      c3_fecha: parseDate(get(35)),
      c3_importe: parseNum(get(36)),
      // Cuota 4 (columns 37-39)
      c4_boleta: parseStr(get(37)),
      c4_fecha: parseDate(get(38)),
      c4_importe: parseNum(get(39)),
      // Cuota 5 (columns 40-42)
      c5_boleta: parseStr(get(40)),
      c5_fecha: parseDate(get(41)),
      c5_importe: parseNum(get(42)),
      // Ciclo Completo / XCICO (columns 43-45)
      xcico_boleta: parseStr(get(43)),
      xcico_fecha: parseDate(get(44)),
      xcico_importe: parseNum(get(45)),
      // Ratificacion / RATI (columns 46-48)
      rati_boleta: parseStr(get(46)),
      rati_fecha: parseDate(get(47)),
      rati_importe: parseNum(get(48)),
      // Contact info (columns 50-56)
      email: parseStr(get(50)),
      telefono: parseStr(get(51)),
      celular: parseStr(get(52)),
      direccion: parseStr(get(53)),
      ubigeo: parseStr(get(54)),
      escala: parseStr(get(55)),
      observacion_excel: parseStr(get(56)),
      // Academic (columns 57-64)
      curricula: parseStr(get(57)),
      descripcion_grupo: parseStr(get(58)),
      fecha_matricula: parseDate(get(59)),
      matriculado: parseStr(get(60)),
      categoria: parseStr(get(61)),
      importe_total: parseNum(get(62)),
      total_pagado: parseNum(get(63)),
      deuda: parseNum(get(64)),
      // Vencimientos (columns 66-70)
      ven_1: parseDate(get(66)),
      ven_2: parseDate(get(67)),
      ven_3: parseDate(get(68)),
      ven_4: parseDate(get(69)),
      ven_5: parseDate(get(70)),
      // Deudas por cuota (columns 71-75)
      deuda_1: parseNum(get(71)),
      deuda_2: parseNum(get(72)),
      deuda_3: parseNum(get(73)),
      deuda_4: parseNum(get(74)),
      deuda_5: parseNum(get(75)),
    })
  }

  return { rows, total: rows.length }
}
