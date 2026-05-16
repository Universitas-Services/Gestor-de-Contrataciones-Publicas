"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ManualButtons } from "@/components/dashboards/admin_ente/ManualButtons";
import { BsFillPeopleFill, BsEye } from "react-icons/bs";
import { IoIosSend, IoMdTime, IoIosPrint, IoIosHammer, IoIosBriefcase } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaRegAddressBook, FaHandPointRight, FaRobot } from "react-icons/fa";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DashboardOperativoResponse } from "@/types/dashboard-operativo.types";

/* ─────────── Props ─────────── */
interface EnteDashboardProps {
  data: DashboardOperativoResponse;
  hideManualButtons?: boolean;
}

/* ─────────── Helpers para calcular porcentajes ─────────── */
function calcPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/* ─────────── Configuración de colores por tipo ─────────── */
const AREA_CONFIG = {
  obras: { label: "Obras", colorClass: "bg-tipo-obras", dotClass: "bg-tipo-obras" },
  bienes: { label: "Bienes", colorClass: "bg-tipo-bienes", dotClass: "bg-tipo-bienes" },
  servicios: { label: "Servicios", colorClass: "bg-tipo-servicios", dotClass: "bg-tipo-servicios" },
} as const;

const TERMINADOS_CONFIG = [
  { key: "bienes" as const, icon: IoIosPrint, label: "Bienes" },
  { key: "obras" as const, icon: IoIosHammer, label: "Obras" },
  { key: "servicios" as const, icon: IoIosBriefcase, label: "Servicios" },
];

/* ─────────── Rutas de navegación ─────────── */
const ROUTES = {
  usuarios: "/admin_ente/gestion-datos/usuarios",
  ejecutores: "/admin_ente/gestion-datos/usuarios?rol=EJECUTOR",
  visualizadores: "/admin_ente/gestion-datos/usuarios?rol=VISUALIZADOR",
  expedientes: "/elaboracion-expediente",
  proveedores: "/registro-proveedores",
  consultorIA: "/consultor-ia",
} as const;

export function EnteDashboard({ data, hideManualButtons = false }: EnteDashboardProps) {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    if (hideManualButtons) return;
    router.push(route);
  };

  const clickableCardClass = hideManualButtons
    ? ""
    : "cursor-pointer transition-shadow hover:shadow-md";

  /* ── Datos derivados: Expedientes en proceso → porcentajes ── */
  const totalEnProceso = data.expedientesEnProceso.total;
  const areasEnProceso = (["obras", "bienes", "servicios"] as const).map((key) => ({
    ...AREA_CONFIG[key],
    percentage: calcPercentage(data.expedientesEnProceso[key], totalEnProceso),
  }));

  /* ── Datos derivados: Expedientes terminados ── */
  const totalTerminados = data.expedientesTerminados.total;
  const expedientesTerminados = TERMINADOS_CONFIG.map((cfg) => ({
    ...cfg,
    cantidad: data.expedientesTerminados[cfg.key],
  }));

  return (
    <Card className="p-8 bg-white shadow-sm border-border-light">
      <div className="space-y-8">
        {/* ── Encabezado: Resumen Operativo + Botones de manual ── */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-heading-dark">
              Resumen Operativo
            </h2>
            <p className="text-sm text-text-muted-dark">
              Seguimiento de procesos de contratación y gestión de expedientes.
            </p>
          </div>
          {!hideManualButtons && <ManualButtons />}
        </div>

        {/* ── Usuarios de la plataforma ── */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-heading-dark">Usuarios de la plataforma</h3>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Total de usuarios */}
            <Card className={clickableCardClass} onClick={() => handleNavigation(ROUTES.usuarios)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de usuarios
                </CardTitle>
                <BsFillPeopleFill className="h-5 w-5 text-icon-people" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-heading-dark">{data.usuarios.total}</p>
              </CardContent>
            </Card>

            {/* Ejecutores */}
            <Card
              className={clickableCardClass}
              onClick={() => handleNavigation(ROUTES.ejecutores)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ejecutores
                </CardTitle>
                <IoIosSend className="h-5 w-5 text-icon-people" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-heading-dark">{data.usuarios.ejecutores}</p>
              </CardContent>
            </Card>

            {/* Visualizadores */}
            <Card
              className={clickableCardClass}
              onClick={() => handleNavigation(ROUTES.visualizadores)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Visualizadores
                </CardTitle>
                <BsEye className="h-5 w-5 text-icon-people" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-heading-dark">
                  {data.usuarios.visualizadores}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Expedientes de selección de contratista ── */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-heading-dark">
            Expedientes de selección de contratista
          </h3>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expedientes en proceso */}
            <Card
              className={clickableCardClass}
              onClick={() => handleNavigation(ROUTES.expedientes)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-lg bg-icon-bg-terminados p-2">
                    <IoMdTime className="h-5 w-5 text-icon-people" />
                  </div>
                  <CardTitle className="text-base font-bold text-heading-dark">
                    Expedientes en proceso
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="border-border-light bg-slate-bg text-heading-secondary text-xs font-semibold"
                >
                  Total: {totalEnProceso}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                {areasEnProceso.map((area) => (
                  <div key={area.label} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${area.dotClass}`} />
                      <span className="text-sm text-muted-foreground">{area.label}</span>
                      <div className="flex-1" />
                      <span className="text-sm font-semibold text-heading-dark">
                        {area.percentage}%
                      </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${area.colorClass} transition-all`}
                        style={{ width: `${area.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Expedientes terminados (derecha) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center rounded-lg bg-icon-bg-terminados p-2">
                    <FaRegAddressBook className="h-5 w-5 text-icon-people" />
                  </div>
                  <CardTitle className="text-base font-bold text-heading-dark">
                    Expedientes terminados
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="border-success bg-success-bg text-success-text text-xs font-semibold"
                >
                  Total: {totalTerminados}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {expedientesTerminados.map((exp) => (
                  <Card
                    key={exp.label}
                    className={`py-3 shadow-none ${!hideManualButtons ? "cursor-pointer transition-colors hover:bg-slate-bg" : ""}`}
                    onClick={() =>
                      handleNavigation(`${ROUTES.expedientes}?tipo=${exp.key.toUpperCase()}`)
                    }
                  >
                    <CardContent className="flex items-center gap-3 py-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-icon-bg-terminados">
                        <exp.icon className="h-4 w-4 text-icon-terminados" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading-dark">{exp.label}</p>
                        <p className="text-xs text-muted-foreground">{exp.cantidad} contratos</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Fila inferior: Expedientes terminados stats + Consultor IA ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Expedientes terminados - estadísticas */}
          <section className="mt-1">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Expedientes Compliance — sin acción aún */}
              <Card className="opacity-80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expedientes Compliance
                  </CardTitle>
                  <IoDocumentTextOutline className="h-5 w-5 text-icon-people" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-heading-dark">{data.compliance.total}</p>
                </CardContent>
              </Card>

              {/* Proveedores Registrados */}
              <Card
                className={clickableCardClass}
                onClick={() => handleNavigation(ROUTES.proveedores)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Proveedores Registrados
                  </CardTitle>
                  <BsFillPeopleFill className="h-5 w-5 text-icon-people" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-heading-dark">{data.proveedores.total}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Consultor IA */}
          <Card className="flex flex-col items-center justify-center bg-card shadow-sm border border-border-light">
            <CardContent className="flex flex-col items-center gap-5 text-center">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-icon-bg-terminados text-heading-dark">
                  <FaHandPointRight className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-heading-dark text-left">
                  Recuerda que tienes a tu disposición tu Consultor IA en Contrataciones Publicas
                </p>
              </div>
              <div className="flex gap-10 justify-center">
                <Button className="gap-2 bg-navy-deep font-semibold text-white hover:bg-navy px-8 py-6 rounded-xl">
                  <HelpCircle className="h-5 w-5" />
                  Ver FAQS
                </Button>
                <Button
                  className="gap-2 bg-navy-deep font-semibold text-white hover:bg-navy px-8 py-6 rounded-xl"
                  onClick={() => router.push(ROUTES.consultorIA)}
                >
                  <FaRobot className="h-5 w-5" />
                  Conversa aquí
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  );
}
