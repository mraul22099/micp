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

  // Read all rows as arrays.
  const raw = utils.sheet_to_json(ws, { header: 1, defval: null, blankrows: false }) as unknown[][]
  
  // Find the header row (look for 'dni' in the first 20 rows)
  let headerIdx = -1;
  for (let i = 0; i < Math.min(20, raw.length); i++) {
    const row = raw[i];
    if (row && row.some(cell => typeof cell === 'string' && cell.trim().toLowerCase() === 'dni')) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    const preview = raw.slice(0, 5).map(r => JSON.stringify(r)).join(' | ');
    throw new Error(`No se encontró cabecera. Hojas: ${wb.SheetNames.join(',')}, Total filas detectadas: ${raw.length}, Muestra: ${preview}`);
  }

  const headerRow = raw[headerIdx].map(c => typeof c === 'string' ? c.trim().toLowerCase().replace(/\s+/g, '') : '');

  
  const getColIdx = (possibleNames: string[]) => {
    const normalizedNames = possibleNames.map(n => n.toLowerCase().replace(/\s+/g, ''));
    for (const name of normalizedNames) {
      const idx = headerRow.indexOf(name);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  // Datos base
  const idxDni = getColIdx(['dni']);
  const idxCarrera = getColIdx(['carrera']);
  const idxNombre = getColIdx(['nombrecompleto']);
  const idxCiclo = getColIdx(['periodo', 'ciclo']);
  const idxSeccion = getColIdx(['secc', 'seccion']);
  const idxCelular = getColIdx(['celular']);
  const idxSede = getColIdx(['ode', 'sede']);
  const idxAlumno = getColIdx(['codigo']);
  const idxEmail = getColIdx(['correoelectronico', 'email']);
  const idxDireccion = getColIdx(['direccion']);
  const idxSemestre = getColIdx(['semestreactual', 'semestre']);
  const idxPrograma = getColIdx(['programa']);
  const idxEscala = getColIdx(['escala']);

  // Pagos y Cuotas están relativos a "condiciondepagos" o "escalas"
  let idxCondicion = getColIdx(['condiciondepagos']);
  if (idxCondicion === -1) idxCondicion = getColIdx(['escalas']) + 1; // Fallback aproximado
  
  // Si encontramos la columna base, mapeamos el resto relativo a ella
  let idxMatFecha=-1, idxMatBoleta=-1, idxMatImporte=-1;
  let idxC1Fecha=-1, idxC1Boleta=-1, idxC1Importe=-1;
  let idxC2Fecha=-1, idxC2Boleta=-1, idxC2Importe=-1;
  let idxC3Fecha=-1, idxC3Boleta=-1, idxC3Importe=-1;
  let idxC4Fecha=-1, idxC4Boleta=-1, idxC4Importe=-1;
  let idxVen1=-1, idxVen2=-1, idxVen3=-1, idxVen4=-1;
  let idxTotalPagado=-1, idxImporteTotal=-1, idxDeuda=-1;

  if (idxCondicion !== -1) {
    idxMatFecha = idxCondicion + 1; idxMatBoleta = idxCondicion + 2; idxMatImporte = idxCondicion + 3;
    idxC1Fecha = idxCondicion + 4; idxC1Boleta = idxCondicion + 5; idxC1Importe = idxCondicion + 6;
    idxC2Fecha = idxCondicion + 7; idxC2Boleta = idxCondicion + 8; idxC2Importe = idxCondicion + 9;
    idxC3Fecha = idxCondicion + 10; idxC3Boleta = idxCondicion + 11; idxC3Importe = idxCondicion + 12;
    idxC4Fecha = idxCondicion + 13; idxC4Boleta = idxCondicion + 14; idxC4Importe = idxCondicion + 15;
    
    idxVen1 = idxCondicion + 16;
    idxVen2 = idxCondicion + 17;
    idxVen3 = idxCondicion + 18;
    idxVen4 = idxCondicion + 19;
    
    idxTotalPagado = idxCondicion + 20; // PAGOS REALIZADOS
    idxImporteTotal = idxCondicion + 21; // COMPROMISO DE PAGO
    idxDeuda = idxCondicion + 22; // DEUDA DEL CICLO
  } else {
    // Si no encuentra la estructura estricta, intentamos mapear algunas cosas sueltas
    idxTotalPagado = getColIdx(['pagosrealizados']);
    idxImporteTotal = getColIdx(['compromisodepago']);
    idxDeuda = getColIdx(['deudadelciclo']);
  }

  const dataRows = raw.slice(headerIdx + 1);
  const rows: ExcelRow[] = [];

  for (const row of dataRows) {
    const get = (idx: number) => (idx !== -1 && idx < row.length) ? row[idx] ?? null : null;

    const dni = parseStr(get(idxDni));
    const carrera = parseStr(get(idxCarrera));

    if (!dni || !carrera) continue; // Requerimos ambos ahora

    rows.push({
      dni,
      grupo: '', // Grupo ya no viene en el Excel
      persona: '',
      alumno_codigo: parseStr(get(idxAlumno)),
      codigo_pago: '',
      estructura: '',
      semestre: parseStr(get(idxSemestre)),
      nombre_completo: parseStr(get(idxNombre)),
      sede: parseStr(get(idxSede)),
      carrera,
      programa: parseStr(get(idxPrograma)),
      ciclo: parseStr(get(idxCiclo)),
      seccion: parseStr(get(idxSeccion)),
      nota_1: null, nota_2: null, nota_3: null, nota_4: null,
      nota_5: null, nota_6: null, nota_7: null, nota_8: null,
      nota_9: null, nota_10: null, nota_11: null, nota_12: null,
      
      mat_boleta: parseStr(get(idxMatBoleta)),
      mat_fecha: parseDate(get(idxMatFecha)),
      mat_importe: parseNum(get(idxMatImporte)),
      
      c1_boleta: parseStr(get(idxC1Boleta)),
      c1_fecha: parseDate(get(idxC1Fecha)),
      c1_importe: parseNum(get(idxC1Importe)),
      
      c2_boleta: parseStr(get(idxC2Boleta)),
      c2_fecha: parseDate(get(idxC2Fecha)),
      c2_importe: parseNum(get(idxC2Importe)),
      
      c3_boleta: parseStr(get(idxC3Boleta)),
      c3_fecha: parseDate(get(idxC3Fecha)),
      c3_importe: parseNum(get(idxC3Importe)),
      
      c4_boleta: parseStr(get(idxC4Boleta)),
      c4_fecha: parseDate(get(idxC4Fecha)),
      c4_importe: parseNum(get(idxC4Importe)),
      
      c5_boleta: '', c5_fecha: null, c5_importe: 0,
      xcico_boleta: '', xcico_fecha: null, xcico_importe: 0,
      rati_boleta: '', rati_fecha: null, rati_importe: 0,
      
      email: parseStr(get(idxEmail)),
      telefono: '',
      celular: parseStr(get(idxCelular)),
      direccion: parseStr(get(idxDireccion)),
      ubigeo: '',
      escala: parseStr(get(idxEscala)),
      observacion_excel: '',
      curricula: '',
      descripcion_grupo: '',
      fecha_matricula: null,
      matriculado: '',
      categoria: '',
      
      importe_total: parseNum(get(idxImporteTotal)),
      total_pagado: parseNum(get(idxTotalPagado)),
      deuda: parseNum(get(idxDeuda)),
      
      ven_1: parseDate(get(idxVen1)),
      ven_2: parseDate(get(idxVen2)),
      ven_3: parseDate(get(idxVen3)),
      ven_4: parseDate(get(idxVen4)),
      ven_5: null,
      
      deuda_1: 0, deuda_2: 0, deuda_3: 0, deuda_4: 0, deuda_5: 0
    });
  }

  return { rows, total: rows.length }
}
