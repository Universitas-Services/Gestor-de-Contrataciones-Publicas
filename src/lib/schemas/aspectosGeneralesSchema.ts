import { z } from "zod";

const MAX_TEXT_100 = 100;
const MAX_TEXT_255 = 255;
const MAX_TEXT_500 = 500;

export const MODALIDAD_CRS_OPTIONS = [
  "La ejecución de proyectos de desarrollo socio comunitario.",
  "La creación de nuevos empleos permanentes.",
  "Formación socio productiva de integrantes de la comunidad.",
  "Venta de bienes a precios solidarios o al costo.",
  "Aportes en dinero o especie a programas sociales determinados por el Estado o a instituciones sin fines de lucro.",
  "Cualquier otro que satisfaga las necesidades prioritarias del entorno social del contratante.",
] as const;

export type ModalidadCrsOption = (typeof MODALIDAD_CRS_OPTIONS)[number];

function parseDecimalString(value: string) {
  const raw = value.trim();
  if (!raw) return Number.NaN;

  // US / ISO: "2.5" o "12" (punto decimal, sin miles)
  if (/^\d+(\.\d+)?$/.test(raw)) {
    return Number(raw);
  }

  // Formato VE: miles con punto, decimal con coma ("1.500,50" → 1500.5)
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function requiredText(message: string, maxLength = MAX_TEXT_255) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .max(maxLength, `Máximo ${maxLength} caracteres`);
}

function requiredBoolean(message: string) {
  return z
    .boolean()
    .optional()
    .refine((value) => value === true || value === false, { message });
}

function requiredPositiveIntegerString(message: string) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => /^\d+$/.test(value), "Debe ingresar un número entero")
    .refine((value) => Number(value) > 0, "Debe ser mayor a cero");
}

function optionalText(maxLength: number) {
  return z.string().max(maxLength, `Máximo ${maxLength} caracteres`);
}

function optionalDecimalString() {
  return z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value === "" || !Number.isNaN(parseDecimalString(value)), {
      message: "Debe ingresar un número válido",
    });
}

function percentage0to100String(message: string, max = 100) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => !Number.isNaN(parseDecimalString(value)), "Debe ingresar un número válido")
    .refine((value) => {
      const num = parseDecimalString(value);
      return num >= 0 && num <= max;
    }, `Debe ser un valor entre 0 y ${max}`);
}

function percentageRangeString(message: string, min: number, max: number) {
  const minLabel = String(min).replace(".", ",");
  const maxLabel = String(max).replace(".", ",");
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => !Number.isNaN(parseDecimalString(value)), "Debe ingresar un número válido")
    .refine((value) => {
      const num = parseDecimalString(value);
      return num >= min && num <= max;
    }, `Debe ser un valor entre ${minLabel} y ${maxLabel}`);
}

export const aspectosGeneralesFormSchema = z
  .object({
    datosActoAutorizacionInicioAuAu: requiredText(
      "Indique los datos del acto administrativo de autorización"
    ),
    diasValidezOfertaAuAu: requiredPositiveIntegerString(
      "Indique el plazo mínimo de validez de las ofertas"
    ),
    autoridadAclaratoriasAuAu: requiredText(
      "Indique la autoridad competente encargada de aclaratorias"
    ),
    normativaLegalAuAu: z.preprocess(
      (value) => {
        if (Array.isArray(value)) {
          return value
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
        }
        if (typeof value === "string" && value.trim()) {
          const trimmed = value.trim();
          if (trimmed.startsWith("[")) {
            try {
              const parsed = JSON.parse(trimmed) as unknown;
              if (Array.isArray(parsed)) {
                return parsed
                  .filter((item): item is string => typeof item === "string")
                  .map((item) => item.trim())
                  .filter(Boolean);
              }
            } catch {
              // texto plano
            }
          }
          return [trimmed];
        }
        return [];
      },
      z
        .array(z.string().trim().min(1))
        .min(1, "Agregue al menos una normativa legal complementaria")
    ),

    diasVigenciaGarantiaExtAuAu: requiredPositiveIntegerString(
      "Indique los días de vigencia de la garantía de mantenimiento"
    ),
    monedaDiferenteAuAu: requiredBoolean("Indique si admitirá propuestas en moneda extranjera"),
    nomMonedaExtranjeraAuAu: optionalText(MAX_TEXT_100),
    idiomaDiferenteAuAu: requiredBoolean(
      "Indique si admitirá documentos en idiomas distintos al castellano"
    ),
    nomIdiomaDiferenteAuAu: optionalText(MAX_TEXT_100),

    porcentajeResponsabilidadSocialAuAu: percentage0to100String(
      "Indique el porcentaje destinado al CRS"
    ),
    unidadRespCumplimientoCrsAuAu: requiredText(
      "Indique la unidad técnica responsable del seguimiento del CRS"
    ),
    modalidadCrsAuAu: z
      .string({ message: "Seleccione la modalidad del CRS" })
      .trim()
      .min(1, "Seleccione la modalidad del CRS")
      .refine(
        (value): value is ModalidadCrsOption =>
          (MODALIDAD_CRS_OPTIONS as readonly string[]).includes(value),
        "Seleccione una modalidad válida"
      ),
    formaCumplimientoCrsAuAu: requiredText(
      "Describa la forma de cumplimiento del CRS",
      MAX_TEXT_500
    ),

    porcentajeMantenimientoOfertaAuAu: percentageRangeString(
      "Indique el porcentaje de la Garantía de Mantenimiento de la Oferta",
      1.5,
      2.5
    ),
    porcentajeFielCumplimientoAuAu: percentage0to100String(
      "Indique el porcentaje de la Garantía de Fiel Cumplimiento"
    ),
    retencionFielCumplimientoAuAu: requiredBoolean(
      "Indique si se admitirá retención para Fiel Cumplimiento"
    ),
    anticipoEspecialAuAu: requiredBoolean("Indique si desea otorgar un Anticipo Especial"),
    porcentajeAnticipoEspecialAuAu: optionalDecimalString(),
  })
  .superRefine((data, ctx) => {
    if (data.monedaDiferenteAuAu === true && !data.nomMonedaExtranjeraAuAu?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["nomMonedaExtranjeraAuAu"],
        message: "Especifique el nombre de la moneda extranjera",
      });
    }

    if (data.idiomaDiferenteAuAu === true && !data.nomIdiomaDiferenteAuAu?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["nomIdiomaDiferenteAuAu"],
        message: "Especifique el idioma distinto al castellano",
      });
    }

    if (data.anticipoEspecialAuAu === true) {
      const pct = data.porcentajeAnticipoEspecialAuAu?.trim() ?? "";
      if (!pct) {
        ctx.addIssue({
          code: "custom",
          path: ["porcentajeAnticipoEspecialAuAu"],
          message: "Indique el porcentaje de anticipo especial",
        });
      } else {
        const num = parseDecimalString(pct);
        if (Number.isNaN(num) || num < 0 || num > 20) {
          ctx.addIssue({
            code: "custom",
            path: ["porcentajeAnticipoEspecialAuAu"],
            message: "El anticipo especial debe ser un valor entre 0 y 20",
          });
        }
      }
    }
  });

export type AspectosGeneralesFormValues = z.infer<typeof aspectosGeneralesFormSchema>;

export type AspectosGeneralesFormInputValues = {
  datosActoAutorizacionInicioAuAu: string;
  diasValidezOfertaAuAu: string;
  autoridadAclaratoriasAuAu: string;
  normativaLegalAuAu: string[];
  diasVigenciaGarantiaExtAuAu: string;
  monedaDiferenteAuAu: boolean | undefined;
  nomMonedaExtranjeraAuAu: string;
  idiomaDiferenteAuAu: boolean | undefined;
  nomIdiomaDiferenteAuAu: string;
  porcentajeResponsabilidadSocialAuAu: string;
  unidadRespCumplimientoCrsAuAu: string;
  modalidadCrsAuAu: string;
  formaCumplimientoCrsAuAu: string;
  porcentajeMantenimientoOfertaAuAu: string;
  porcentajeFielCumplimientoAuAu: string;
  retencionFielCumplimientoAuAu: boolean | undefined;
  anticipoEspecialAuAu: boolean | undefined;
  porcentajeAnticipoEspecialAuAu: string;
};
