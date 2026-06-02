import * as z from "zod";

export const nuevoProveedorSchema = z
  .object({
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
    cedulaNatural: z
      .string()
      .optional()
      .refine((val) => !val || /^[VvEe]-\d{6,8}$/.test(val), {
        message: "Formato inválido. Use V-XXXXXXXX o E-XXXXXXXX",
      }),
    nombreAutoridad: z.string().optional(),
    cedulaAutoridad: z
      .string()
      .optional()
      .refine((val) => !val || /^[VvEe]-\d{6,8}$/.test(val), {
        message: "Formato inválido. Use V-XXXXXXXX o E-XXXXXXXX",
      }),
    datosDesignacionAutoridad: z.string().optional(),
    estado: z.string().optional(),
    parroquia: z.string().optional(),
    representanteNombre: z.string().optional(),
    municipio: z.string().optional(),
    representanteCedula: z
      .string()
      .optional()
      .refine((val) => !val || /^[VvEe]-\d{6,8}$/.test(val), {
        message: "Formato inválido. Use V-XXXXXXXX o E-XXXXXXXX",
      }),
    telefono: z.string().optional(),
    direccionFiscal: z.string().optional(),

    // Sección 2: Validación de requisitos
    rnc: z.enum(["Si", "No"]).optional(),
    solvenciaLaboral: z.enum(["Si", "No"]).optional(),
    licenciaMunicipal: z.enum(["Si", "No"]).optional(),
    islr: z.enum(["Si", "No"]).optional(),

    // Sección 3: Capacidad técnica y financiera
    actividadPrincipal: z.string().optional(),
    areaEspecialidad: z.string().optional(),
    anosExperiencia: z.string().optional(),
    patrimonioNeto: z.string().optional(),
    fechaEstadoFinanciero: z.string().optional(),
    nivelContratacion: z.string().optional(),

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
  })
  .superRefine((data, ctx) => {
    const requireField = (
      condition: boolean,
      value: string | undefined,
      path: keyof typeof data,
      msg: string
    ) => {
      if (condition && (!value || value.trim() === "")) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: msg });
      }
    };

    const isJuridica = data.tipoPersona === "JURIDICA";
    const isNatural = data.tipoPersona === "NATURAL";
    const isOrganoEntePublico = data.tipoPersona === "ORGANO_ENTE_PUBLICO";
    const hasTipoPersona = isJuridica || isNatural || isOrganoEntePublico;

    requireField(hasTipoPersona, data.telefono, "telefono", "Teléfono de contacto es requerido");
    requireField(hasTipoPersona, data.estado, "estado", "Seleccione un estado");
    requireField(hasTipoPersona, data.municipio, "municipio", "Seleccione un municipio");
    requireField(hasTipoPersona, data.parroquia, "parroquia", "Seleccione una parroquia");
    requireField(
      hasTipoPersona,
      data.direccionFiscal,
      "direccionFiscal",
      "Dirección fiscal es requerida"
    );
    requireField(
      hasTipoPersona,
      data.areaEspecialidad,
      "areaEspecialidad",
      "Seleccione un área de especialidad"
    );
    requireField(
      hasTipoPersona,
      data.nivelContratacion,
      "nivelContratacion",
      "Seleccione un nivel de contratación"
    );

    requireField(
      isJuridica,
      data.representanteNombre,
      "representanteNombre",
      "Nombre del representante es requerido"
    );
    requireField(
      isJuridica,
      data.representanteCedula,
      "representanteCedula",
      "Cédula del representante es requerida"
    );
    requireField(isJuridica, data.formaJuridica, "formaJuridica", "Seleccione la forma jurídica");
    requireField(
      isJuridica,
      data.datosRegistroMercantil,
      "datosRegistroMercantil",
      "Datos del registro mercantil requeridos"
    );
    requireField(
      isJuridica,
      data.solvenciaLaboral,
      "solvenciaLaboral",
      "Indique si posee solvencia"
    );
    requireField(
      isJuridica,
      data.licenciaMunicipal,
      "licenciaMunicipal",
      "Indique si posee licencia"
    );
    requireField(
      isJuridica,
      data.patrimonioNeto,
      "patrimonioNeto",
      "Patrimonio neto reportado es requerido"
    );
    requireField(
      isJuridica,
      data.fechaEstadoFinanciero,
      "fechaEstadoFinanciero",
      "Fecha es requerida"
    );
    requireField(
      isJuridica,
      data.anosExperiencia,
      "anosExperiencia",
      "Años de experiencia requeridos"
    );

    requireField(
      isNatural,
      data.cedulaNatural,
      "cedulaNatural",
      "Cédula del proveedor es requerida"
    );
    requireField(
      isNatural,
      data.actividadPrincipal,
      "actividadPrincipal",
      "Actividad comercial principal requerida"
    );
    requireField(
      isNatural,
      data.anosExperiencia,
      "anosExperiencia",
      "Años de experiencia requeridos"
    );
    requireField(isNatural, data.islr, "islr", "Indique si posee ISLR");

    requireField(
      isOrganoEntePublico,
      data.nombreAutoridad,
      "nombreAutoridad",
      "Nombre de la máxima autoridad requerido"
    );
    requireField(
      isOrganoEntePublico,
      data.cedulaAutoridad,
      "cedulaAutoridad",
      "Cédula de la máxima autoridad requerida"
    );
    requireField(
      isOrganoEntePublico,
      data.datosDesignacionAutoridad,
      "datosDesignacionAutoridad",
      "Datos de designación de la máxima autoridad requeridos"
    );

    if ((isJuridica || isNatural) && data.rnc === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["rnc"], message: "Indique si posee RNC" });
    }
  });

export type NuevoProveedorFormValues = z.infer<typeof nuevoProveedorSchema>;
