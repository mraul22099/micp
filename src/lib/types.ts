export type EstadoMatricula = 'Aprobado' | 'Observado' | 'Registrado' | 'Pre Aprobado' | 'Pendiente' | 'A Mejorar'
export type Turno = 'M' | 'T' | 'N'
export type RiesgoAcademico = 'alto' | 'medio' | 'bajo' | 'sin_evaluar'
export type EstadoSeguimiento = 'sin_contactar' | 'contactado' | 'en_proceso' | 'resuelto'
export type EstadoCuota = 'pagado' | 'pendiente' | 'vencido'

export interface Alumno {
  id: number
  dni: string
  grupo: string
  nombre: string | null
  paterno: string | null
  materno: string | null
  celular: string | null
  email: string | null
  carrera: string | null
  turno: string | null
  horario: string | null
  frecuencia: string | null
  local: string | null
  fecha_inicio: string | null
  fecha_inscripcion: string | null
  estado_matricula: string | null
  nota_final: number | null
  promocion: string | null
  nro_inscripcion: string | null
  monto_inscripcion: number
  tipo_pago_inscripcion: string | null
  fecha_pago_inscripcion: string | null
  nro_matricula: string | null
  monto_matricula: number
  tipo_pago_matricula: string | null
  fecha_pago_matricula: string | null
  total_pagado_cuotas: number
  deuda_total: number
  ultima_importacion: string | null
}

export interface Cuota {
  id: number
  alumno_id: number
  nro_cuota: number
  fecha_programada: string | null
  monto_programado: number
  monto_pagado: number
  nro_recibo: string | null
  tipo_pago: string | null
  fecha_pago: string | null
  estado: EstadoCuota
}

export interface Seguimiento {
  id: number
  dni: string
  grupo: string
  riesgo_academico: RiesgoAcademico
  estado_seguimiento: EstadoSeguimiento
  ultima_comunicacion: string | null
  telefono_alterno: string | null
  observacion: string | null
  actualizado_en: string | null
}

export interface AlumnoConSeguimiento extends Alumno {
  seguimiento?: Seguimiento
  cuotas?: Cuota[]
  cuotas_vencidas?: number
  cuotas_pendientes?: number
  cuotas_pagadas?: number
}

export interface ImportResult {
  total: number
  nuevos: number
  actualizados: number
  errores: number
  duracion_ms: number
}
