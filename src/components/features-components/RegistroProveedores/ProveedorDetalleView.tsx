"use client";

import {
  Download,
  Edit,
  ImageIcon,
  Phone,
  Mail,
  FileText,
  MapPin,
  Building2,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ProveedorDetalleView({ id: _id }: { id: string }) {
  // Simularemos la recolección de los datos de DB basados en el mockup
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* HEADER CARD */}
      <Card className="p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Logo Placeholder */}
          <div className="w-28 h-28 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-10 h-10 text-white" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-navy">Constructora Sambil C.A</h1>
              <Badge
                variant="outline"
                className="bg-[#bbf7d0] text-[#16a34a] border-[#86efac] font-bold px-3 py-0.5 rounded-full"
              >
                Activo
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-500 italic mb-1">G-00000000-0</p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> +58 212-951-1111
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> contacto@sambil.com
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="border-color-boton-2 text-color-boton-2 hover:bg-df-bg h-11 px-6 font-semibold w-full md:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
          <Button className="bg-color-boton-2 hover:bg-navy-hover text-white h-11 px-6 font-semibold w-full md:w-auto">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </Card>

      {/* BODY (2 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LADO IZQUIERDO (Información y Pestañas) lg:col-span-2 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full h-auto p-0 bg-transparent border-b border-color-boton-2/20 justify-start rounded-none mb-6 gap-2 md:gap-8 flex-wrap">
              <TabsTrigger
                value="general"
                className="data-[state=active]:border-b-2 data-[state=active]:border-color-boton-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-3 text-sm md:text-base font-bold text-slate-500 data-[state=active]:text-color-boton-2 px-1"
              >
                Información general
              </TabsTrigger>
              <TabsTrigger
                value="representante"
                className="data-[state=active]:border-b-2 data-[state=active]:border-color-boton-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-3 text-sm md:text-base font-bold text-slate-500 data-[state=active]:text-color-boton-2 px-1"
              >
                Representante
              </TabsTrigger>
              <TabsTrigger
                value="validacion"
                className="data-[state=active]:border-b-2 data-[state=active]:border-color-boton-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-3 text-sm md:text-base font-bold text-slate-500 data-[state=active]:text-color-boton-2 px-1"
              >
                Validación
              </TabsTrigger>
              <TabsTrigger
                value="capacidad"
                className="data-[state=active]:border-b-2 data-[state=active]:border-color-boton-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none py-3 text-sm md:text-base font-bold text-slate-500 data-[state=active]:text-color-boton-2 px-1"
              >
                Capacidad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-0 outline-none flex flex-col gap-8">
              {/* Sección 1: Datos de la empresa */}
              <Card className="p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 bg-white">
                <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-color-boton-2" />
                  Datos de la empresa
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Nombre legal</label>
                    <div className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 flex items-center px-3 text-sm text-slate-500 italic truncate cursor-not-allowed">
                      Constructora Sambil C.A.
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Tipo de persona</label>
                    <div className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 flex items-center px-3 text-sm text-slate-500 italic truncate cursor-not-allowed">
                      Jurídica Privada
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Forma jurídica</label>
                    <div className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 flex items-center px-3 text-sm text-slate-500 italic truncate cursor-not-allowed">
                      Compañía Anónima
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Fecha de fundación</label>
                    <div className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 flex items-center px-3 text-sm text-slate-500 italic truncate cursor-not-allowed">
                      05/11/1958
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Estado/municipio</label>
                    <div className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 flex items-center px-3 text-sm text-slate-500 italic truncate cursor-not-allowed">
                      Miranda/Chacao
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Parroquia</label>
                    <div className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 flex items-center px-3 text-sm text-slate-500 italic truncate cursor-not-allowed">
                      Chacao
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-800">Dirección fiscal</label>
                    <div className="h-10 w-full xl:w-3/4 rounded-md border border-slate-200 bg-slate-50 flex items-center px-3 text-sm text-slate-500 italic truncate cursor-not-allowed">
                      Dirección: Av. Libertador, Centro Comercial Sambil, Chacao, Miranda, Caracas.
                    </div>
                  </div>
                </div>

                {/* Subsección Representante in-box (según Mockup parece colgado abajo, o es un titulo con iconito) */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
                  <User2 className="w-5 h-5 text-slate-800" />
                  <h3 className="text-base font-bold text-slate-800">Representante legal</h3>
                </div>

                <div className="mt-4 flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 w-full md:w-3/4">
                  <Avatar className="w-12 h-12 border shadow-sm">
                    <AvatarFallback className="bg-df-bg text-color-boton-2 font-bold text-sm">
                      SCL
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-base">Salomón Cohen Levy.</span>
                    <span className="text-sm text-slate-500 font-medium">V-1.234.567.8</span>
                  </div>
                </div>
              </Card>

              {/* Sección 2: Capacidad técnica y financiera */}
              <Card className="p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 bg-white">
                <h2 className="text-xl font-extrabold text-slate-800 mb-6">
                  Capacidad técnica y financiera
                </h2>

                {/* 3 cards horizontales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Actividad comercial
                    </span>
                    <strong className="text-base text-navy mt-1">Construcción civil</strong>
                    <span className="text-xs text-slate-400 italic mt-1">Especialidad: Obras</span>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Años de experiencia
                    </span>
                    <strong className="text-base text-navy mt-1">65 años</strong>
                    <span className="text-xs text-slate-400 italic mt-1">Fundada en 1958</span>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Nivel de contratación
                    </span>
                    <strong className="text-base text-navy mt-1 mb-2">ALTA</strong>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-color-boton-2 h-full w-[85%] rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Resumen vs Validaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Izq */}
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 mb-4">Resumen Financiero</h3>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500 italic">
                        Habilitado para contrataciones
                      </span>
                      <span className="text-sm font-bold text-slate-800">31/12/2027</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-sm text-slate-500 italic">Patrimonio neto</span>
                      <span className="text-sm font-bold text-green-600">12,450,000.00</span>
                    </div>
                  </div>

                  {/* Der */}
                  <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 mb-4">Validaciones del sistema</h3>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500 italic">Registro RNC</span>
                      <Badge className="bg-[#bbf7d0] hover:bg-[#bbf7d0] text-[#16a34a] px-3 py-0 border border-[#86efac]">
                        vigente
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500 italic">Solvencia laboral</span>
                      <Badge className="bg-[#bbf7d0] hover:bg-[#bbf7d0] text-[#16a34a] px-3 py-0 border border-[#86efac]">
                        vigente
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-sm text-slate-500 italic">Licencia municipal</span>
                      <Badge className="bg-[#ffedd5] hover:bg-[#ffedd5] text-[#d97706] px-3 py-0 border border-[#fcd34d]">
                        vencido
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Agrega tabs content vacios en caso de querer navegar a ellos luego */}
            <TabsContent
              value="representante"
              className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl"
            >
              Contenido de Representante (En Base de Datos)
            </TabsContent>
            <TabsContent
              value="validacion"
              className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl"
            >
              Contenido de Validación (En Base de Datos)
            </TabsContent>
            <TabsContent
              value="capacidad"
              className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl"
            >
              Contenido de Capacidad (En Base de Datos)
            </TabsContent>
          </Tabs>
        </div>

        {/* LADO DERECHO (Widgets) lg:col-span-1 */}
        <div className="lg:col-span-1 flex flex-col gap-6 w-full">
          <h2 className="text-lg font-extrabold text-slate-800">Estado de aprobación</h2>
          <Card className="p-5 rounded-xl border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-800">Proveedor verificado</span>
                <span className="text-xs text-slate-500 italic">
                  Habilitado para contrataciones
                </span>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#84cc16]" />
            </div>
            <div className="text-[11px] text-slate-400 italic pt-4 border-t border-slate-100 text-center">
              Aprobación de proveedor en fecha 02/03/2026
            </div>
          </Card>

          <h2 className="text-lg font-extrabold text-slate-800 mt-2">Documentos</h2>
          <div className="flex flex-col gap-3">
            {/* Doc Item 1 */}
            <Card className="p-3.5 rounded-xl border-slate-200 shadow-sm flex items-center gap-3 hover:border-color-boton-2 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-df-bg transition-colors">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-color-boton-2" />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs font-bold text-slate-800 truncate">
                  Acta_Constitutiva_Actualizado_2024.pdf
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  PDF RIF • 1.2 MB • Cargado hace 2 min
                </span>
              </div>
            </Card>

            {/* Doc Item 2 */}
            <Card className="p-3.5 rounded-xl border-slate-200 shadow-sm flex items-center gap-3 hover:border-color-boton-2 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-df-bg transition-colors">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-color-boton-2" />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs font-bold text-slate-800 truncate">
                  RIF_Actualizado_2024.pdf
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  PDF RIF • 1.2 MB • Cargado hace 2 min
                </span>
              </div>
            </Card>

            {/* Doc Item 3 */}
            <Card className="p-3.5 rounded-xl border-slate-200 shadow-sm flex items-center gap-3 hover:border-color-boton-2 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-df-bg transition-colors">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-color-boton-2" />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs font-bold text-slate-800 truncate">
                  Certificado_RCN_2024.pdf
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  PDF RIF • 1.2 MB • Cargado hace 2 min
                </span>
              </div>
            </Card>

            {/* Doc Item 4 */}
            <Card className="p-3.5 rounded-xl border-slate-200 shadow-sm flex items-center gap-3 hover:border-color-boton-2 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-df-bg transition-colors">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-color-boton-2" />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs font-bold text-slate-800 truncate">
                  Solvencia_Laboral_2024.pdf
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  PDF RIF • 1.2 MB • Cargado hace 2 min
                </span>
              </div>
            </Card>
          </div>

          <h2 className="text-lg font-extrabold text-slate-800 mt-2">Ubicaciones</h2>
          <Card className="p-5 rounded-xl border-slate-200 shadow-sm">
            {/* Image Placeholder */}
            <div className="w-full h-40 bg-slate-200 rounded-lg flex items-center justify-center mb-4 text-slate-500">
              <MapPin className="w-8 h-8 opacity-70" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-800 text-sm">Ubicación Principal</span>
              <span className="text-xs text-slate-500 italic">
                Caracas, distrito capital Venezuela
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
