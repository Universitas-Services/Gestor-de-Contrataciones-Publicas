import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { obtenerEnte } from "@/services/enteService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ROLE_ROUTES } from "@/lib/constants/routes";
import { Building2 } from "lucide-react";
import Image from "next/image";
import { ManualActions } from "./ManualActions";

export default async function PerfilEntePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin_ente" || !user.enteId) {
    // Si no tiene ente vinculado, redirigir al dashboard u otra página de escape
    redirect("/login");
  }

  // Obtener los datos del backend
  const enteInfo = await obtenerEnte(user.enteId);

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-xl bg-[#DFEAF1] p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-center gap-4">
          <Image
            src="/img_app/icono_sin_relleno.png"
            alt="Logo Sistema Integrado"
            width={40}
            height={40}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold text-[#1B456F]">Información general del Ente</h1>
        </div>

        {/* Contenedor Principal Blanco */}
        <div className="rounded-xl bg-white p-8 shadow-sm">
          {/* Tarjeta Superior */}
          <Card className="mb-8 border-none shadow-sm ring-1 ring-slate-100">
            <CardContent className="flex items-center gap-6 p-6">
              <div className="flex h-32 w-48 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                {enteInfo.logoUrl ? (
                  <img
                    src={enteInfo.logoUrl}
                    alt={`Logo de ${enteInfo.nombre}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="h-16 w-16 text-slate-300" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="text-xl font-bold text-[#1B456F]">{enteInfo.nombre}</h2>
                <p className="text-sm font-medium text-slate-600">{enteInfo.rif}</p>
                <p className="mt-1 text-xs italic text-slate-500">
                  {enteInfo.organoAdscripcion || "Sin órgano de adscripción asociado"}
                </p>
              </div>
              <Button asChild className="w-32 bg-[#1B456F] font-semibold hover:bg-[#123050]">
                <Link href={ROLE_ROUTES.admin_ente.completarEnte}>Editar</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Columna Izquierda */}
            <div className="flex flex-col gap-8">
              {/* Datos de Identificación */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-[#1B456F] border-b pb-2">
                  Datos de Identificación
                </h3>
                <div className="rounded-lg border bg-white p-5 pr-10 shadow-sm space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#1B456F] font-bold text-xs">
                      Nombre del Órgano o Ente Contratante.
                    </Label>
                    <Input
                      value={enteInfo.nombre}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">Acrónimo o siglas</Label>
                      <Input
                        value={enteInfo.siglas}
                        readOnly
                        className="bg-slate-50 text-slate-500 font-medium italic h-8"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">RIF</Label>
                      <Input
                        value={enteInfo.rif}
                        readOnly
                        className="bg-slate-50 text-slate-500 font-medium italic h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#1B456F] font-bold text-xs">
                      Órgano de Adscripción
                    </Label>
                    <Input
                      value={enteInfo.organoAdscripcion || ""}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8"
                    />
                  </div>
                </div>
              </section>

              {/* Estructura Organizativa */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-[#1B456F] border-b pb-2">
                  Estructura Organizativa (Unidades responsables)
                </h3>
                <div className="rounded-lg border bg-white p-5 pr-10 shadow-sm space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#1B456F] font-bold text-xs">Unidad contratante</Label>
                    <Input
                      value={enteInfo.nombreUnidadContratante}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#1B456F] font-bold text-xs">
                      Gestión Administrativa y Financiera
                    </Label>
                    <Input
                      value={enteInfo.nombreUnidadAdminFinanciera}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#1B456F] font-bold text-xs">
                      Responsable de Sistemas y Tecnología
                    </Label>
                    <Input
                      value={enteInfo.nombreUnidadTecnologia}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Columna Derecha */}
            <div className="flex flex-col gap-8">
              {/* Ubicación Geográfica */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-[#1B456F] border-b pb-2">
                  Ubicación Geográfica
                </h3>
                <div className="rounded-lg border bg-white p-5 pr-10 shadow-sm space-y-4">
                  <div className="space-y-1.5 pl-4">
                    <Label className="text-[#1B456F] font-bold text-xs">Estado</Label>
                    <Input
                      value={enteInfo.estado}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8 w-2/3"
                    />
                  </div>
                  <div className="space-y-1.5 pl-4">
                    <Label className="text-[#1B456F] font-bold text-xs">Municipio</Label>
                    <Input
                      value={enteInfo.municipio}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8 w-2/3"
                    />
                  </div>
                  <div className="space-y-1.5 pl-4">
                    <Label className="text-[#1B456F] font-bold text-xs">Parroquia</Label>
                    <Input
                      value={enteInfo.parroquia}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8 w-2/3"
                    />
                  </div>
                  <div className="space-y-1.5 pl-4 mt-8">
                    <Label className="text-[#1B456F] font-bold text-xs">Dirección Fiscal</Label>
                    <Input
                      value={enteInfo.direccionFiscal}
                      readOnly
                      className="bg-slate-50 text-slate-500 font-medium italic h-8 w-11/12"
                    />
                  </div>
                </div>
              </section>

              {/* Botones Manuales */}
              <ManualActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
