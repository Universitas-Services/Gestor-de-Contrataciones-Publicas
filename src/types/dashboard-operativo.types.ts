/**
 * Tipo de respuesta del endpoint GET /entes/dashboard/operativo
 */
export interface DashboardOperativoResponse {
  usuarios: {
    total: number;
    ejecutores: number;
    visualizadores: number;
    administradores: number;
  };
  expedientesEnProceso: {
    total: number;
    bienes: number;
    obras: number;
    servicios: number;
  };
  expedientesTerminados: {
    total: number;
    bienes: number;
    obras: number;
    servicios: number;
  };
  proveedores: {
    total: number;
  };
  compliance: {
    total: number;
  };
}
