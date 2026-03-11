import * as z from "zod";

export const nuevoProveedorSchema = z.object({
  // Sección 1: Identificación y validación
  correo: z.string().email({ message: "Ingrese un correo válido" }),
  nombre: z.string().min(1, { message: "Razón social es requerida" }),
  rif: z
    .string()
    .min(1, { message: "El RIF es requerido" })
    .regex(/^[JGVEP]-\d{8}-?\d?$/, "Formato de RIF inválido"),
  formaJuridica: z.string().optional(),
  tipoPersona: z.string().min(1, { message: "Seleccione un tipo de persona" }),
  datosRegistroMercantil: z.string().optional(),
  estado: z.string().min(1, { message: "Seleccione un estado" }),
  parroquia: z.string().min(1, { message: "Seleccione una parroquia" }),
  representanteNombre: z.string().min(1, { message: "Nombre del representante es requerido" }),
  municipio: z.string().min(1, { message: "Seleccione un municipio" }),
  representanteCedula: z.string().min(1, { message: "Cédula del representante es requerida" }),
  telefono: z.string().min(1, { message: "Teléfono de contacto es requerido" }),
  direccionFiscal: z.string().min(1, { message: "Dirección fiscal es requerida" }),

  // Sección 2: Validación de requisitos
  rnc: z.enum(["Si", "No"]),
  solvenciaLaboral: z.enum(["Si", "No"]),
  licenciaMunicipal: z.enum(["Si", "No"]),

  // Sección 3: Capacidad técnica y financiera
  actividadPrincipal: z.string().min(1, { message: "La actividad comercial es requerida" }),
  areaEspecialidad: z.string().min(1, { message: "Seleccione un área de especialidad" }),
  anosExperiencia: z.string().min(1, { message: "Años de experiencia requeridos" }),
  patrimonioNeto: z.string().min(1, { message: "Patrimonio neto reportado es requerido" }),
  fechaEstadoFinanciero: z.string().min(1, { message: "Fecha es requerida" }),
  nivelContratacion: z.string().min(1, { message: "Seleccione un nivel de contratación" }),

  // Paso 2: Carga de documentos (se envían en la request FormData tipicamente, pero aca los simularemos)
  documentos: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        size: z.string(),
        time: z.string(),
        type: z.string(),
        observaciones: z.string().optional(),
      })
    )
    .optional(),
});

export type NuevoProveedorFormValues = z.infer<typeof nuevoProveedorSchema>;
