export type ActorTipo =
  | "COMISION_CONTRATACIONES"
  | "UNIDAD_CONTRATANTE"
  | "UNIDAD_USUARIA"
  | "MAXIMA_AUTORIDAD";

export interface Actor {
  id: string;
  nombre: string;
  tipo: ActorTipo;
  estatus: boolean;
  createdAt: string;
  // Estos campos pueden o no venir en el detalle según el endpoint,
  // pero los mantendré opcionales por ahora para no romper la vista de detalles si se usa.
  detalles?: {
    autoridad: {
      nombres: string;
      apellidos: string;
      cargo: string;
      cedula: string;
      resolucion: string;
    };
    delegado: {
      nombre: string;
      cedula: string;
      cargo: string;
    };
  };
}

export interface DirectorioResponse {
  data: Actor[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}
