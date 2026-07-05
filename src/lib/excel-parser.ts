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
    throw new Error(`No se encontró cabecera (buscando celda "Dni"). Muestra: ${preview}`);
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

  // Map indexes
  const idxDni = getColIdx(['dni']);
  const idxGrupo = getColIdx(['grupo']);
  const idxPersona = getColIdx(['persona']);
  const idxAlumno = getColIdx(['alumno', 'alumnocodigo']);
  const idxCodigoPago = getColIdx(['codigopagoalumno']);
  const idxEstructura = getColIdx(['estructura']);
  const idxSemestre = getColIdx(['semestre']);
  const idxNombre = getColIdx(['nombrecompleto']);
  const idxSede = getColIdx(['sede']);
  const idxCarrera = getColIdx(['carrera']);
  const idxPrograma = getColIdx(['programa']);
  const idxCiclo = getColIdx(['ciclo']);
  const idxSeccion = getColIdx(['seccion']);
  
  const idxNota1 = getColIdx(['nota1']);
  const idxNota2 = getColIdx(['nota2']);
  const idxNota3 = getColIdx(['nota3']);
  const idxNota4 = getColIdx(['nota4']);
  const idxNota5 = getColIdx(['nota5']);
  const idxNota6 = getColIdx(['nota6']);
  const idxNota7 = getColIdx(['nota7']);
  const idxNota8 = getColIdx(['nota8']);
  const idxNota9 = getColIdx(['nota9']);
  const idxNota10 = getColIdx(['nota10']);
  const idxNota11 = getColIdx(['nota11']);
  const idxNota12 = getColIdx(['nota12']);

  const idxMatBoleta = getColIdx(['matricula-boleta', 'matriculaboleta']);
  const idxMatFecha = getColIdx(['matricula-fecha', 'matriculafecha']);
  const idxMatImporte = getColIdx(['matricula-importe', 'matriculaimporte']);

  const idxC1Boleta = getColIdx(['cuota1-boleta', 'cuota1boleta']);
  const idxC1Fecha = getColIdx(['cuota1-fecha', 'cuota1fecha']);
  const idxC1Importe = getColIdx(['cuota1-importe', 'cuota1importe']);

  const idxC2Boleta = getColIdx(['cuota2-boleta', 'cuota2boleta']);
  const idxC2Fecha = getColIdx(['cuota2-fecha', 'cuota2fecha']);
  const idxC2Importe = getColIdx(['cuota2-importe', 'cuota2importe']);

  const idxC3Boleta = getColIdx(['cuota3-boleta', 'cuota3boleta']);
  const idxC3Fecha = getColIdx(['cuota3-fecha', 'cuota3fecha']);
  const idxC3Importe = getColIdx(['cuota3-importe', 'cuota3importe']);

  const idxC4Boleta = getColIdx(['cuota4-boleta', 'cuota4boleta']);
  const idxC4Fecha = getColIdx(['cuota4-fecha', 'cuota4fecha']);
  const idxC4Importe = getColIdx(['cuota4-importe', 'cuota4importe']);

  const idxC5Boleta = getColIdx(['cuota5-boleta', 'cuota5boleta']);
  const idxC5Fecha = getColIdx(['cuota5-fecha', 'cuota5fecha']);
  const idxC5Importe = getColIdx(['cuota5-importe', 'cuota5importe']);

  const idxXcicoBoleta = getColIdx(['ciclocompleto-boleta', 'ciclocompletoboleta']);
  const idxXcicoFecha = getColIdx(['ciclocompleto-fecha', 'ciclocompletofecha']);
  const idxXcicoImporte = getColIdx(['ciclocompleto-importe', 'ciclocompletoimporte']);

  const idxRatiBoleta = getColIdx(['ratificacion-boleta', 'ratificacionboleta']);
  const idxRatiFecha = getColIdx(['ratificacion-fecha', 'ratificacionfecha']);
  const idxRatiImporte = getColIdx(['ratificacion-importe', 'ratificacionimporte']);

  const idxEmail = getColIdx(['email']);
  const idxTelefono = getColIdx(['telefono']);
  const idxCelular = getColIdx(['celular']);
  const idxDireccion = getColIdx(['direccion']);
  const idxUbigeo = getColIdx(['ubigeo']);
  const idxEscala = getColIdx(['escala']);
  const idxObservacion = getColIdx(['observacion']);
  const idxCurricula = getColIdx(['curricula']);
  const idxDescGrupo = getColIdx(['descripciongrupo']);
  
  const idxFechaMatricula = getColIdx(['fechadematricula']);
  const idxMatriculado = getColIdx(['matriculado']);
  const idxCategoria = getColIdx(['categoria']);
  const idxImporteTotal = getColIdx(['importetotal']);
  const idxTotalPagado = getColIdx(['totalpagado']);
  const idxDeuda = getColIdx(['deuda']);

  const idxVen1 = getColIdx(['ven1']);
  const idxVen2 = getColIdx(['ven2']);
  const idxVen3 = getColIdx(['ven3']);
  const idxVen4 = getColIdx(['ven4']);
  const idxVen5 = getColIdx(['ven5']);

  const idxDeuda1 = getColIdx(['deuda1']);
  const idxDeuda2 = getColIdx(['deuda2']);
  const idxDeuda3 = getColIdx(['deuda3']);
  const idxDeuda4 = getColIdx(['deuda4']);
  const idxDeuda5 = getColIdx(['deuda5']);

  const dataRows = raw.slice(headerIdx + 1);
  const rows: ExcelRow[] = [];

  for (const row of dataRows) {
    const get = (idx: number) => idx !== -1 ? row[idx] ?? null : null;

    const dni = parseStr(get(idxDni));
    const grupo = parseStr(get(idxGrupo));

    if (!dni) continue;

    rows.push({
      dni,
      grupo,
      persona: parseStr(get(idxPersona)),
      alumno_codigo: parseStr(get(idxAlumno)),
      codigo_pago: parseStr(get(idxCodigoPago)),
      estructura: parseStr(get(idxEstructura)),
      semestre: parseStr(get(idxSemestre)),
      nombre_completo: parseStr(get(idxNombre)),
      sede: parseStr(get(idxSede)),
      carrera: parseStr(get(idxCarrera)),
      programa: parseStr(get(idxPrograma)),
      ciclo: parseStr(get(idxCiclo)),
      seccion: parseStr(get(idxSeccion)),
      nota_1: parseNum(get(idxNota1)) || null,
      nota_2: parseNum(get(idxNota2)) || null,
      nota_3: parseNum(get(idxNota3)) || null,
      nota_4: parseNum(get(idxNota4)) || null,
      nota_5: parseNum(get(idxNota5)) || null,
      nota_6: parseNum(get(idxNota6)) || null,
      nota_7: parseNum(get(idxNota7)) || null,
      nota_8: parseNum(get(idxNota8)) || null,
      nota_9: parseNum(get(idxNota9)) || null,
      nota_10: parseNum(get(idxNota10)) || null,
      nota_11: parseNum(get(idxNota11)) || null,
      nota_12: parseNum(get(idxNota12)) || null,
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
      c5_boleta: parseStr(get(idxC5Boleta)),
      c5_fecha: parseDate(get(idxC5Fecha)),
      c5_importe: parseNum(get(idxC5Importe)),
      xcico_boleta: parseStr(get(idxXcicoBoleta)),
      xcico_fecha: parseDate(get(idxXcicoFecha)),
      xcico_importe: parseNum(get(idxXcicoImporte)),
      rati_boleta: parseStr(get(idxRatiBoleta)),
      rati_fecha: parseDate(get(idxRatiFecha)),
      rati_importe: parseNum(get(idxRatiImporte)),
      email: parseStr(get(idxEmail)),
      telefono: parseStr(get(idxTelefono)),
      celular: parseStr(get(idxCelular)),
      direccion: parseStr(get(idxDireccion)),
      ubigeo: parseStr(get(idxUbigeo)),
      escala: parseStr(get(idxEscala)),
      observacion_excel: parseStr(get(idxObservacion)),
      curricula: parseStr(get(idxCurricula)),
      descripcion_grupo: parseStr(get(idxDescGrupo)),
      fecha_matricula: parseDate(get(idxFechaMatricula)),
      matriculado: parseStr(get(idxMatriculado)),
      categoria: parseStr(get(idxCategoria)),
      importe_total: parseNum(get(idxImporteTotal)),
      total_pagado: parseNum(get(idxTotalPagado)),
      deuda: parseNum(get(idxDeuda)),
      ven_1: parseDate(get(idxVen1)),
      ven_2: parseDate(get(idxVen2)),
      ven_3: parseDate(get(idxVen3)),
      ven_4: parseDate(get(idxVen4)),
      ven_5: parseDate(get(idxVen5)),
      deuda_1: parseNum(get(idxDeuda1)),
      deuda_2: parseNum(get(idxDeuda2)),
      deuda_3: parseNum(get(idxDeuda3)),
      deuda_4: parseNum(get(idxDeuda4)),
      deuda_5: parseNum(get(idxDeuda5)),
    })
  }

  return { rows, total: rows.length }
}
