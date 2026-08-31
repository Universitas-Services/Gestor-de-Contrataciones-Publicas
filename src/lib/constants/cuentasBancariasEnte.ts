export type TipoCuentaBancaria = "corriente" | "ahorro";

export interface CuentaBancariaEnte {
  id: string;
  bancoPagoPliego: string;
  cuentaPagoPliego: string;
  titularPagoPliego: string;
  rifPagoPliego: string;
  tipoCuentaPagoPliego: TipoCuentaBancaria;
  createdAt: string;
}

export interface CuentaBancariaEnteFormValues {
  bancoPagoPliego: string;
  cuentaPagoPliego: string;
  titularPagoPliego: string;
  rifPagoPliego: string;
  tipoCuentaPagoPliego: TipoCuentaBancaria;
}

export const TIPO_CUENTA_OPTIONS: { value: TipoCuentaBancaria; label: string }[] = [
  { value: "corriente", label: "Corriente" },
  { value: "ahorro", label: "Ahorro" },
];

export const CUENTAS_BANCARIAS_SECTION_TITLE = "Cuentas bancarias";
export const CUENTAS_BANCARIAS_ADD_LABEL = "Agregar nueva cuenta";
export const CUENTAS_BANCARIAS_MODAL_TITLE =
  "Indique los datos bancarios para registrar su cuenta.";
export const CUENTAS_BANCARIAS_SAVE_LABEL = "Guardar";
export const CUENTAS_BANCARIAS_EMPTY_TITLE = "Sin cuentas registradas";
export const CUENTAS_BANCARIAS_EMPTY_DESCRIPTION = "Agregue al menos una cuenta bancaria del ente.";

export const CUENTA_BANCARIA_FIELD_COPY = {
  bancoPagoPliego: {
    label: "Indique el nombre del Banco.",
    example: "Ejemplo: Banco de Venezuela",
  },
  cuentaPagoPliego: {
    label: "Indique el número de la cuenta.",
    example: "Ejemplo: 0102-0123-45-1234567890",
  },
  titularPagoPliego: {
    label: "Indique el nombre del Titular de la cuenta.",
    example: "Ejemplo: Gobernación del Estado Lara",
  },
  rifPagoPliego: {
    label: "Indique el RIF del Titular de la cuenta.",
    example: "Ejemplo: G-00000000-0",
  },
  tipoCuentaPagoPliego: {
    label: "Indique el tipo de cuenta bancaria.",
    example: "Corriente o Ahorro",
  },
} as const;

export const BANCO_PAGO_PLIEGO_MAX = 100;
export const CUENTA_PAGO_PLIEGO_MAX = 20;
export const TITULAR_PAGO_PLIEGO_MAX = 100;
export const RIF_PAGO_PLIEGO_MAX = 100;

export function getCuentasBancariasEnteStorageKey(enteId: string): string {
  return `ente-cuentas-bancarias:${enteId}`;
}

export function createEmptyCuentaBancariaFormValues(): CuentaBancariaEnteFormValues {
  return {
    bancoPagoPliego: "",
    cuentaPagoPliego: "",
    titularPagoPliego: "",
    rifPagoPliego: "",
    tipoCuentaPagoPliego: "corriente",
  };
}

export function labelTipoCuenta(tipo: TipoCuentaBancaria): string {
  return TIPO_CUENTA_OPTIONS.find((o) => o.value === tipo)?.label ?? tipo;
}

export function createCuentaBancariaId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cuenta-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadCuentasBancariasEnte(enteId: string): CuentaBancariaEnte[] {
  if (typeof window === "undefined" || !enteId) return [];
  try {
    const raw = window.localStorage.getItem(getCuentasBancariasEnteStorageKey(enteId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CuentaBancariaEnte =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as CuentaBancariaEnte).id === "string" &&
        typeof (item as CuentaBancariaEnte).bancoPagoPliego === "string" &&
        typeof (item as CuentaBancariaEnte).cuentaPagoPliego === "string"
    );
  } catch {
    return [];
  }
}

export function formatCuentaBancariaOptionLabel(cuenta: CuentaBancariaEnte): string {
  return `${cuenta.bancoPagoPliego} · ${cuenta.cuentaPagoPliego} · ${labelTipoCuenta(cuenta.tipoCuentaPagoPliego)}`;
}

export const LLAMADO_CUENTA_SELECT_LABEL =
  "Seleccione una cuenta bancaria del ente para completar automáticamente los datos de pago.";
export const LLAMADO_CUENTA_SELECT_EMPTY =
  "No hay cuentas bancarias registradas. Agréguelas en el Perfil del Ente.";
export const LLAMADO_CUENTA_SELECT_PLACEHOLDER = "Elegir cuenta bancaria…";
