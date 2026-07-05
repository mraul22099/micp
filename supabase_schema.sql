-- ============================================================
-- SISTEMA DE CONTROL DE PAGOS Y ACADÉMICO — TUTOR ASESOR
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. TABLA PRINCIPAL DE ALUMNOS (datos del Excel maestro)
CREATE TABLE IF NOT EXISTS public.alumnos (
  id                  BIGSERIAL PRIMARY KEY,
  dni                 TEXT NOT NULL,
  grupo               TEXT NOT NULL,
  nombre              TEXT,
  paterno             TEXT,
  materno             TEXT,
  celular             TEXT,
  email               TEXT,
  carrera             TEXT,
  turno               TEXT,         -- M=Mañana, T=Tarde, N=Noche
  horario             TEXT,
  frecuencia          TEXT,         -- LU,MI,VI / SA / DO
  local               TEXT,
  fecha_inicio        DATE,
  fecha_inscripcion   DATE,
  estado_matricula    TEXT,         -- Aprobado, Observado, Pendiente, etc.
  nota_final          NUMERIC,
  promocion           TEXT,
  -- Pagos resumen
  nro_inscripcion     TEXT,
  monto_inscripcion   NUMERIC DEFAULT 0,
  tipo_pago_inscripcion TEXT,
  fecha_pago_inscripcion DATE,
  nro_matricula       TEXT,
  monto_matricula     NUMERIC DEFAULT 0,
  tipo_pago_matricula TEXT,
  fecha_pago_matricula DATE,
  total_pagado_cuotas NUMERIC DEFAULT 0,
  deuda_total         NUMERIC DEFAULT 0,
  -- Metadatos
  ultima_importacion  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (dni, grupo)
);

-- 2. CUOTAS DETALLADAS POR ALUMNO
CREATE TABLE IF NOT EXISTS public.cuotas (
  id                BIGSERIAL PRIMARY KEY,
  alumno_id         BIGINT REFERENCES public.alumnos(id) ON DELETE CASCADE,
  nro_cuota         INTEGER,
  fecha_programada  DATE,
  monto_programado  NUMERIC DEFAULT 0,
  monto_pagado      NUMERIC DEFAULT 0,
  nro_recibo        TEXT,
  tipo_pago         TEXT,
  fecha_pago        DATE,
  estado            TEXT DEFAULT 'pendiente' -- 'pagado' | 'pendiente' | 'vencido'
);

-- 3. MIS ALUMNOS ASIGNADOS (lista personal del tutor)
CREATE TABLE IF NOT EXISTS public.mis_alumnos (
  id          BIGSERIAL PRIMARY KEY,
  dni         TEXT NOT NULL,
  grupo       TEXT NOT NULL,
  agregado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (dni, grupo)
);

-- 4. SEGUIMIENTO ACADÉMICO (campos manuales del tutor)
CREATE TABLE IF NOT EXISTS public.seguimiento (
  id                    BIGSERIAL PRIMARY KEY,
  dni                   TEXT NOT NULL,
  grupo                 TEXT NOT NULL,
  riesgo_academico      TEXT DEFAULT 'sin_evaluar', -- 'alto'|'medio'|'bajo'|'sin_evaluar'
  estado_seguimiento    TEXT DEFAULT 'sin_contactar', -- 'sin_contactar'|'contactado'|'en_proceso'|'resuelto'
  ultima_comunicacion   DATE,
  telefono_alterno      TEXT,
  observacion           TEXT,
  actualizado_en        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (dni, grupo)
);

-- 5. LOG DE IMPORTACIONES
CREATE TABLE IF NOT EXISTS public.importaciones (
  id              BIGSERIAL PRIMARY KEY,
  fecha           TIMESTAMPTZ DEFAULT NOW(),
  nombre_archivo  TEXT,
  total_filas     INTEGER DEFAULT 0,
  nuevos          INTEGER DEFAULT 0,
  actualizados    INTEGER DEFAULT 0,
  errores         INTEGER DEFAULT 0,
  duracion_ms     INTEGER
);

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_alumnos_dni ON public.alumnos(dni);
CREATE INDEX IF NOT EXISTS idx_alumnos_grupo ON public.alumnos(grupo);
CREATE INDEX IF NOT EXISTS idx_alumnos_estado ON public.alumnos(estado_matricula);
CREATE INDEX IF NOT EXISTS idx_cuotas_alumno ON public.cuotas(alumno_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_estado ON public.cuotas(estado);
CREATE INDEX IF NOT EXISTS idx_mis_alumnos_dni ON public.mis_alumnos(dni);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Solo el dueño accede
-- ============================================================
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mis_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.importaciones ENABLE ROW LEVEL SECURITY;

-- Política: solo usuarios autenticados acceden a todo
DROP POLICY IF EXISTS "authenticated_only" ON public.alumnos;
CREATE POLICY "authenticated_only" ON public.alumnos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_only" ON public.cuotas;
CREATE POLICY "authenticated_only" ON public.cuotas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_only" ON public.mis_alumnos;
CREATE POLICY "authenticated_only" ON public.mis_alumnos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_only" ON public.seguimiento;
CREATE POLICY "authenticated_only" ON public.seguimiento
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_only" ON public.importaciones;
CREATE POLICY "authenticated_only" ON public.importaciones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- VISTA: MIS ALUMNOS CON TODOS SUS DATOS (útil para queries)
-- ============================================================
CREATE OR REPLACE VIEW public.vista_mis_alumnos AS
SELECT
  a.*,
  s.riesgo_academico,
  s.estado_seguimiento,
  s.ultima_comunicacion,
  s.telefono_alterno,
  s.observacion,
  (
    SELECT COUNT(*) FROM public.cuotas c
    WHERE c.alumno_id = a.id AND c.estado = 'vencido'
  ) AS cuotas_vencidas,
  (
    SELECT COUNT(*) FROM public.cuotas c
    WHERE c.alumno_id = a.id AND c.estado = 'pendiente'
  ) AS cuotas_pendientes,
  (
    SELECT COUNT(*) FROM public.cuotas c
    WHERE c.alumno_id = a.id AND c.estado = 'pagado'
  ) AS cuotas_pagadas
FROM public.alumnos a
INNER JOIN public.mis_alumnos ma ON a.dni = ma.dni AND a.grupo = ma.grupo
LEFT JOIN public.seguimiento s ON a.dni = s.dni AND a.grupo = s.grupo;
