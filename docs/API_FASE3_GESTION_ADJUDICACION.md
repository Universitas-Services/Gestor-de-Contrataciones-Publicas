# API — Fase 3 Gestión: Adaptar vs Nuevo

Documento de integración alineado con el backend real en:

`C:\Users\unive\OneDrive\Desktop\frank\front\contrataciones-api`

**Stack API:** NestJS 11 + Prisma 5 + PostgreSQL + JWT + Swagger (`/api/docs`) + generador DOCX (`docxtemplater`).

**Front Gestión (maquetado mock):** pestaña Fase 3 → carácter TOTAL/PARCIAL → dictámenes → informe → documento adjudicación → notificaciones.

---

## 0. Veredicto rápido

| Área                                                       | Estado en API hoy                 | Acción                                                    |
| ---------------------------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| Evaluación oferente (Sobre1/2, hub, listado)               | Existe                            | **Reutilizar**                                            |
| `posicionPrelacion` (`posicion_prelacion_au_au`)           | Existe (string manual)            | **Adaptar** (unicidad, normalización, prelación efectiva) |
| Informe `POST/GET /evaluacion-fase3/informe/:id`           | Existe (contrato parcial)         | **Adaptar** (campos nuevos + mover garantía/CRS/plazo)    |
| Generar/preview/download informe DOCX                      | Existe                            | **Adaptar** plantilla a campos nuevos                     |
| `Adjudicacion` 1 ganador (`/expedientes/:id/adjudicacion`) | Existe (modelo Fase 4 legacy)     | **No alcanza** para Gestión Fase 3 → **Nuevo** dictámenes |
| Carácter TOTAL / PARCIAL                                   | No existe                         | **Nuevo**                                                 |
| Dictámenes por oferente (TOTAL/PARCIAL)                    | No existe                         | **Nuevo**                                                 |
| Promoción a “Primera Opción” en parcial                    | No existe                         | **Nuevo** (efecto al guardar dictamen)                    |
| Acta + notificaciones Fase 4                               | Existen (post-adjudicación única) | **Adaptar** para multi-adjudicado / gates del hub         |

---

## 1. Inventario de lo que YA existe (rutas reales)

### 1.1 Evaluación + informe (`src/evaluacion-fase3/`)

| Método   | Path                                               | Uso hoy                            |
| -------- | -------------------------------------------------- | ---------------------------------- |
| `POST`   | `/evaluacion-fase3/iniciar`                        | Inicia evaluación                  |
| `GET`    | `/evaluacion-fase3/expediente/:expedienteId`       | Listado hub (front Fase 3 lo usa)  |
| `GET`    | `/evaluacion-fase3/expediente/:expedienteId/stats` | Métricas                           |
| `GET`    | `/evaluacion-fase3/:evaluacionId`                  | Detalle                            |
| `PATCH`  | `/evaluacion-fase3/:evaluacionId/sobre1`           | Sobre 1                            |
| `PATCH`  | `/evaluacion-fase3/:evaluacionId/sobre2`           | Sobre 2 (+ prelación legacy)       |
| `PATCH`  | `/evaluacion-fase3/:evaluacionId/calificacion`     | Calificación + `posicionPrelacion` |
| `GET`    | `/evaluacion-fase3/:evaluacionId/calcular-totales` | Totales                            |
| `DELETE` | `/evaluacion-fase3/:evaluacionId`                  | Borrado                            |
| `POST`   | `/evaluacion-fase3/informe/:expedienteId`          | Upsert informe                     |
| `GET`    | `/evaluacion-fase3/informe/:expedienteId`          | Leer informe                       |

### 1.2 Hub evaluación (`src/evaluacion-fase3/hub/`)

| Método  | Path                                                                        |
| ------- | --------------------------------------------------------------------------- |
| `GET`   | `/evaluacion-fase3/:evaluacionId/hub`                                       |
| `PATCH` | `.../hub/legal` \| `financiera` \| `tecnica` \| `evaluacion` \| `promocion` |

La prelación se escribe al confirmar módulos del hub / calificación / sobre2 en `EvaluacionResultados.posicionPrelacion`.

### 1.3 Adjudicación legacy — 1 ganador (`src/adjudicacion/`)

| Método  | Path                                      | Payload actual                                                                             |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `POST`  | `/expedientes/:expedienteId/adjudicacion` | `montoAdjudicadoBs`, `partidaPresupuestariaGasto`, `montoCrsBs`, `referenciaRecomendacion` |
| `GET`   | `/expedientes/:expedienteId/adjudicacion` |                                                                                            |
| `PATCH` | `/expedientes/:expedienteId/adjudicacion` | Partial del create                                                                         |

**Comportamiento actual (`AdjudicacionService.create`):**

1. Exige expediente `EN_EVALUACION`.
2. Busca evaluación con `posicionPrelacion === 'Primera Opción'` (match **exacto**, case-sensitive).
3. Crea **una** fila `Adjudicacion` con `ofertaGanadoraId` único por expediente.
4. Pasa expediente a `ADJUDICADO`.

Este modelo **no soporta** adjudicación parcial multi-oferente ni dictámenes por evaluación.

### 1.4 Generador de documentos (`src/generador-documentos/`)

Ya hay pipelines reutilizables:

| Método | Path                                                                    |
| ------ | ----------------------------------------------------------------------- |
| `POST` | `/generador-documentos/generar/informe-recomendacion/:expedienteId`     |
| `GET`  | `/generador-documentos/preview/informe-recomendacion/:expedienteId`     |
| `GET`  | `/generador-documentos/download/informe-recomendacion/:expedienteId`    |
| `POST` | `/generador-documentos/generar/acta-adjudicacion/:expedienteId`         |
| `GET`  | `/generador-documentos/preview/acta-adjudicacion/:expedienteId`         |
| `GET`  | `/generador-documentos/download/acta-adjudicacion/:expedienteId`        |
| `POST` | `/generador-documentos/generar/notificaciones-fase4/:expedienteId`      |
| `GET`  | `/generador-documentos/preview/notificacion/evaluacion/:evaluacionId`   |
| `GET`  | `/generador-documentos/download/notificacion/evaluacion/:evaluacionId`  |
| `GET`  | `/generador-documentos/expedientes/:expedienteId/estado-notificaciones` |

Enums doc: `INFORME_RECOMENDACION`, `ACTA_ADJUDICACION`, `NOTIFICACION_ADJUDICADO`, `NOTIFICACION_NO_ADJUDICADO`, etc.

---

## 2. Modelos Prisma relevantes (estado actual)

### 2.1 Prelación — `tb_evaluacion_resultados`

```prisma
posicionPrelacion String? @map("posicion_prelacion_au_au") @db.VarChar(50)
```

- Un solo campo (ranking de evaluación).
- **No** hay `posicion_prelacion_adjudicacion_au_au`.
- **No** hay cálculo automático por puntaje en servidor (se persiste lo que escribe evaluación/hub).
- Consumidores duros: adjudicación y notificaciones buscan exactamente `'Primera Opción'`.

### 2.2 Informe — `tb_informe_recomendacion` + `CreateInformeDto`

| Campo Prisma / DTO                 | Columna DB                                      | ¿En form Gestión Fase 3?                                       |
| ---------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| `actualizacionPresupuesto`         | `actualizacion_presupuesto_au_au`               | Sí (bloque presupuesto)                                        |
| `montoNuevoPresupuesto`            | `monto_nuevo_presupuesto_au_au`                 | Sí                                                             |
| `justificacionActualizacionPresup` | `justificacion_actualizacion_presupuesto_au_au` | Sí (nombre front: `justificacionActualizacionPresupuestoAuAu`) |
| `observacionFormalidades`          | `observacion_formalidades_au_au`                | Sí                                                             |
| `omisionFormalidades`              | `omision_formalidades_au_au`                    | Sí                                                             |
| `subsanacionActo`                  | `subsanacion_acto_au_au`                        | Sí                                                             |
| `datosActoSubsanacion`             | `datos_acto_subsanacion_au_au`                  | Sí                                                             |
| `indVerificadoGarantia`            | `ind_verificado_garantia_au_au`                 | **No en informe UI** — vive en dictamen TOTAL/PARCIAL          |
| `indVerificadoCrs`                 | `ind_verificado_crs_au_au`                      | **No en informe UI** — vive en dictamen                        |
| `plazoEjecucionOfertaGanadora`     | `plazo_ejecucion_oferta_ganadora_au_au`         | **No en informe UI** — vive en dictamen TOTAL                  |

**Faltan en schema/DTO (sí están en el form mock del front):**

| Campo front                 | Columna sugerida                 |
| --------------------------- | -------------------------------- |
| `existeItemsSinOfertasAuAu` | `existe_items_sin_ofertas_au_au` |
| `itemsSinOfertasAuAu`       | `items_sin_ofertas_au_au`        |
| `motivoItemsSinOfertasAuAu` | `motivo_items_sin_ofertas_au_au` |

### 2.3 Adjudicación — modelo `"Adjudicacion"` (sin `@@map("tb_adjudicacion")`)

| Campo                                                                                      | Limitación vs Gestión Fase 3                                                                 |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `expedienteId` unique                                                                      | 1 adjudicación / expediente                                                                  |
| `ofertaGanadoraId` unique                                                                  | 1 ganador                                                                                    |
| `montoAdjudicadoBs`, `partidaPresupuestariaGasto`, `montoCrsBs`, `referenciaRecomendacion` | No mapean a dictámenes AuAu (partidas múltiples, alcance parcial, causa no adjudicado, etc.) |

---

## 3. Matriz ADAPTAR vs NUEVO

### 3.1 ADAPTAR (partiendo de lo existente)

#### A) Informe — `CreateInformeDto` + `InformeRecomendacion` + generador

1. **Agregar** columnas/DTO:
   - `existeItemsSinOfertas` / `existe_items_sin_ofertas_au_au`
   - `itemsSinOfertas` / `items_sin_ofertas_au_au`
   - `motivoItemsSinOfertas` / `motivo_items_sin_ofertas_au_au`
2. **Validación condicional** (hoy todo es `@IsOptional()`):
   - 3 booleanos raíz requeridos al “generar”: items sin ofertas, actualización presupuesto, observación formalidades.
   - Si true → exigir textos / monto.
3. **Decidir destino de campos que el informe API tiene pero el form Gestión movió a dictamen:**
   - Opción recomendada: dejar de exigirlos en informe; leerlos desde dictámenes al generar DOCX.
   - Mantener columnas por compatibilidad legacy o deprecarlas en una migración posterior.
4. **Alias naming front ↔ API:**
   - Front: `justificacionActualizacionPresupuestoAuAu`
   - API actual: `justificacionActualizacionPresup`
   - Aceptar ambos en DTO o documentar mapeo en el servicio del front.
5. Actualizar plantilla DOCX del informe para incluir bloque “ítems sin ofertas”.

**Endpoints a reutilizar (no inventar path nuevo si no hace falta):**

```http
POST /evaluacion-fase3/informe/:expedienteId
GET  /evaluacion-fase3/informe/:expedienteId
POST /generador-documentos/generar/informe-recomendacion/:expedienteId
GET  /generador-documentos/preview|download/informe-recomendacion/:expedienteId
```

#### B) Prelación — `posicion_prelacion_au_au`

1. **Normalizar** valor canónico a `"Primera Opción"` (como ya exige `AdjudicacionService` y el front con `POSICION_PRELACION_OPTIONS`).
2. Ideal: validar unicidad de “Primera Opción” en evaluación (hoy no se valida).
3. Comparaciones case-insensitive en adjudicación/notificaciones (hoy match exacto).
4. **No borrar** el ranking de evaluación al adjudicar parcial.

**Nuevo campo (recomendado) en `tb_evaluacion_resultados`:**

```prisma
posicionPrelacionAdjudicacion String? @map("posicion_prelacion_adjudicacion_au_au") @db.VarChar(50)
```

Regla de negocio Gestión:

- Al guardar dictamen **PARCIAL** con `oferenteAdjudicadoProcedimientoAuAu = true` → setear `posicionPrelacionAdjudicacion = "Primera Opción"`.
- Listados / notificaciones / acta deben preferir:
  `posicionPrelacionAdjudicacion ?? posicionPrelacion`
- En **TOTAL**, la primera opción sigue siendo la de evaluación (`posicionPrelacion`).

#### C) Generador acta + notificaciones

Hoy asumen **un** ganador (`Primera Opción`) + resto no adjudicado.

**Adaptar** para:

| Carácter | Quién recibe notificación adjudicado                                                  | Quién no adjudicado          |
| -------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| TOTAL    | Oferta con primera opción (dictamen total)                                            | Resto calificados (opcional) |
| PARCIAL  | Todas las evaluaciones con dictamen adjudicado=true (todas “Primera Opción” efectiva) | Dictámenes adjudicado=false  |

Reutilizar paths:

```http
POST /generador-documentos/generar/acta-adjudicacion/:expedienteId
POST /generador-documentos/generar/notificaciones-fase4/:expedienteId
GET  .../preview|download/...
GET  .../estado-notificaciones
```

(Renombrar mentalmente “fase4” → post-adjudicación; el path puede quedarse por compatibilidad.)

#### D) Listado `GET /evaluacion-fase3/expediente/:expedienteId`

**Adaptar response** para incluir, por evaluación:

- `posicionPrelacion` (Fase 2)
- `posicionPrelacionAdjudicacion` (nuevo, nullable)
- flags de dictamen / notificación (cuando existan)
- datos ya usados por el front: calificación, montos, oferta, etc.

---

### 3.2 NUEVO (no existe hoy)

#### A) Cabecera de adjudicación Gestión (carácter + gates)

Nuevo recurso (nombre sugerido):

```http
GET  /evaluacion-fase3/expediente/:expedienteId/gestion-adjudicacion
PUT  /evaluacion-fase3/expediente/:expedienteId/gestion-adjudicacion/caracter
```

Persistencia sugerida (nueva tabla o columnas en expediente):

| Campo                         | Tipo                                              |
| ----------------------------- | ------------------------------------------------- |
| `caracter_adjudicacion_au_au` | `TOTAL` \| `PARCIAL` \| null                      |
| flags derivados o persistidos | informe generado, documento adjudicación generado |

**Reglas:**

- No cambiar carácter si ya hay dictámenes o informe (`409`).
- Gates (también en servidor):
  - TOTAL: dictamen total de primera(s) opción(es) de evaluación.
  - PARCIAL: dictamen de **todos** los `oferenteCalificado = true`.
  - Informe → desbloquea acta.
  - Acta generada → desbloquea notificaciones.

#### B) Dictámenes por evaluación

Nueva tabla sugerida `tb_dictamen_adjudicacion` (1 fila por `evaluacion_id` / expediente):

**TOTAL**

| Campo front                        | Columna sugerida                                        |
| ---------------------------------- | ------------------------------------------------------- |
| `partidasAdjudicadasTotalAuAu`     | `partidas_adjudicadas_total_au_au` (varchar CSV o JSON) |
| `montoAdjudicadoTotalAuAu`         | `monto_adjudicado_total_au_au`                          |
| `plazoEjecucionOfertaGanadoraAuAu` | `plazo_ejecucion_oferta_ganadora_au_au`                 |
| `indVerificadoGarantiaAuAu`        | `ind_verificado_garantia_au_au`                         |
| `indVerificadoCrsAuAu`             | `ind_verificado_crs_au_au`                              |

**PARCIAL**

| Campo front                                          | Columna sugerida                          | Condición |
| ---------------------------------------------------- | ----------------------------------------- | --------- |
| `oferenteAdjudicadoProcedimientoAuAu`                | `oferente_adjudicado_procedimiento_au_au` | siempre   |
| `causaNoAdjudicadoAuAu`                              | `causa_no_adjudicado_au_au`               | si false  |
| `cantidadRenglonesAuAu`                              | `cantidad_renglones_au_au`                | si true   |
| `alcanceAdjudicacionParcialAuAu`                     | `alcance_adjudicacion_parcial_au_au`      | si true   |
| `partidasAdjudicadasParcialAuAu`                     | `partidas_adjudicadas_parcial_au_au`      | si true   |
| `montoAdjudicadoParcialAuAu`                         | `monto_adjudicado_parcial_au_au`          | si true   |
| `plazoEjecucionOfertaParcialAuAu`                    | `plazo_ejecucion_oferta_parcial_au_au`    | si true   |
| `indVerificadoGarantiaAuAu` / `indVerificadoCrsAuAu` | mismos nombres                            | si true   |
| `notificacionGenerada`                               | `notificacion_generada_au_au`             | flag      |

Endpoints nuevos:

```http
PUT /evaluacion-fase3/expediente/:expedienteId/dictamenes/:evaluacionId/total
PUT /evaluacion-fase3/expediente/:expedienteId/dictamenes/:evaluacionId/parcial
GET /evaluacion-fase3/expediente/:expedienteId/dictamenes
```

**Efecto colateral PARCIAL adjudicado=true:** actualizar `posicionPrelacionAdjudicacion = "Primera Opción"`.

#### C) Relación con `Adjudicacion` legacy

Opciones (elegir una en implementación):

| Opción              | Descripción                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Convivencia** | Mantener `POST /expedientes/:id/adjudicacion` para Elaboración/Fase 4 antigua; Gestión usa solo dictámenes nuevos. Acta/notifs leen dictámenes si existen.             |
| **2 — Evolución**   | Al cerrar Gestión (informe + dictámenes), materializar/actualizar `Adjudicacion` (TOTAL → 1 ganador; PARCIAL → revisar unique `ofertaGanadoraId` — hoy bloquea multi). |
| **3 — Reemplazo**   | Migrar modelo `Adjudicacion` a multi-fila y deprecar DTO viejo.                                                                                                        |

**Recomendación:** Opción **1** a corto plazo (menos riesgo) + adaptar generador para leer dictámenes; Opción **3** a medio plazo si parcial es requisito de negocio fuerte.

---

## 4. Mapeo campo a campo: form Gestión → API

### 4.1 Informe (form `InformeRecomendacionForm`)

| Front                                       | API hoy                                                                       | Acción                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| `existeItemsSinOfertasAuAu`                 | —                                                                             | **Nuevo** en schema + DTO                         |
| `itemsSinOfertasAuAu`                       | —                                                                             | **Nuevo**                                         |
| `motivoItemsSinOfertasAuAu`                 | —                                                                             | **Nuevo**                                         |
| `actualizacionPresupuestoAuAu`              | `actualizacionPresupuesto`                                                    | **Reutilizar** (hacer requerido)                  |
| `montoNuevoPresupuestoAuAu`                 | `montoNuevoPresupuesto`                                                       | **Reutilizar**                                    |
| `justificacionActualizacionPresupuestoAuAu` | `justificacionActualizacionPresup`                                            | **Adaptar** nombre/alias                          |
| `observacionFormalidadesAuAu`               | `observacionFormalidades`                                                     | **Reutilizar**                                    |
| `omisionFormalidadesAuAu`                   | `omisionFormalidades`                                                         | **Reutilizar**                                    |
| `subsanacionActoAuAu`                       | `subsanacionActo`                                                             | **Reutilizar**                                    |
| `datosActoSubsanacionAuAu`                  | `datosActoSubsanacion`                                                        | **Reutilizar**                                    |
| —                                           | `indVerificadoGarantia` / `indVerificadoCrs` / `plazoEjecucionOfertaGanadora` | **Mover origen** a dictamen; DOCX los toma de ahí |

### 4.2 Dictamen TOTAL / PARCIAL

Todo el bloque es **nuevo** en API (no mapear al DTO `CreateAdjudicacionDto` actual).

### 4.3 Carácter

**Nuevo.** No existe en expediente ni en adjudicación.

---

## 5. Flujo objetivo (cómo encaja con lo existente)

```text
[Ya existe] Evaluación Fase 2/3 → posicionPrelacion ("Primera Opción", "Segunda Opción", …)
        │
[NUEVO]   PUT carácter TOTAL | PARCIAL
        │
[NUEVO]   PUT dictamen total | parcial (por evaluacionId)
        │     └─ PARCIAL adjudicado → posicionPrelacionAdjudicacion = "Primera Opción"
        │
[ADAPTAR] POST /evaluacion-fase3/informe/:id  (+ campos ítems sin ofertas)
[ADAPTAR] POST generador .../informe-recomendacion
        │
[ADAPTAR] POST generador .../acta-adjudicacion  (leer dictámenes / multi)
[ADAPTAR] POST generador .../notificaciones-fase4
        │
[LEGACY]  POST /expedientes/:id/adjudicacion  → opcional / Elaboración; no es el hub Gestión
```

---

## 6. Checklist de implementación backend (orden sugerido)

1. **Migración Prisma informe:** 3 campos ítems sin ofertas; validaciones en `CreateInformeDto`.
2. **Migración prelación efectiva:** `posicion_prelacion_adjudicacion_au_au`.
3. **Migración carácter + `tb_dictamen_adjudicacion`** (o nombre equivalente).
4. **Endpoints** gestión-adjudicacion + dictámenes total/parcial.
5. **Efecto** al guardar parcial adjudicado → set prelación adjudicación.
6. **Adaptar** `AdjudicacionService` / generador acta-notifs a multi + match case-insensitive de `"Primera Opción"`.
7. **Actualizar** plantillas DOCX (informe + acta + notif).
8. **Enriquecer** `GET .../expediente/:id` con prelación efectiva + flags dictamen.
9. Documentar en Swagger qué queda legacy (`CreateAdjudicacionDto`) vs Gestión.

---

## 7. Checklist de cableado front (cuando API esté lista)

1. Sustituir `sessionStorage` (`useFase3GestionState`) por GET gestión-adjudicacion + mutaciones.
2. Mapear informe: alias `justificacionActualizacionPresup` ↔ form.
3. Tras dictamen parcial: refetch listado para ver “Primera Opción”.
4. Preview/descarga: usar `generadorDocumentosService` (paths ya existentes en front).
5. No usar `POST /expedientes/:id/adjudicacion` para el hub Gestión salvo que se elija Opción 2/3.
6. Comparar prelación con `.toLowerCase()` (ya en `evaluacionesFase3Utils`); alinear API a `"Primera Opción"`.

Archivos front de referencia:

- `fase3/types.ts`, `useFase3GestionState.ts`, `Fase3GestionPanel.tsx`
- Forms TOTAL / PARCIAL / Informe
- `lib/schemas/fase3GestionAdjudicacionSchema.ts`
- `services/oferenteService.ts` (stubs informe)
- `services/generadorDocumentosService.ts`

---

## 8. Archivos API a tocar

| Acción                      | Archivo                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Adaptar DTO informe         | `src/evaluacion-fase3/dto/create-informe.dto.ts`                                              |
| Adaptar service informe     | `src/evaluacion-fase3/evaluacion-fase3.service.ts`                                            |
| Schema                      | `prisma/schema.prisma` (`InformeRecomendacion`, `EvaluacionResultados`, nueva tabla dictamen) |
| Nuevo módulo/controller     | p.ej. `src/evaluacion-fase3/gestion-adjudicacion/` o ampliar controller                       |
| Adaptar adjudicación legacy | `src/adjudicacion/adjudicacion.service.ts`                                                    |
| Adaptar docs                | `src/generador-documentos/generador-documentos.service.ts` (+ plantillas)                     |

---

## 9. Reglas de negocio (recordatorio para API)

1. Fase 2 guarda ranking en `posicionPrelacion` (`Primera Opción`, `Segunda Opción`, …).
2. Fase 3 **TOTAL:** solo adjudica a primera opción de evaluación.
3. Fase 3 **PARCIAL:** dictamen por cada calificado; los **adjudicados** pasan a primera opción **efectiva** (`posicionPrelacionAdjudicacion`) sin borrar el ranking de evaluación.
4. Informe: bloques SÍ/NO + condicionales (ítems desiertos, presupuesto, formalidades).
5. Documento adjudicación tras informe; notificaciones tras documento.
6. Match de prelación: normalizar a `"Primera Opción"` en toda la API.

---

_Este documento reemplaza el borrador genérico anterior: ahora distingue explícitamente lo reutilizable de `contrataciones-api` frente a lo que hay que crear para el hub de Gestión Fase 3._
