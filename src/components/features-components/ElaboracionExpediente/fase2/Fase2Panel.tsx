"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { BsEye } from "react-icons/bs";
import {
  IoDownloadOutline,
  IoNewspaperOutline,
  IoServer,
  IoDiamondOutline,
  IoDocumentTextOutline,
  IoReceiptOutline,
  IoEyeOutline,
} from "react-icons/io5";
import { FaRegTrashAlt, FaRegClipboard } from "react-icons/fa";
import { BsArrowClockwise } from "react-icons/bs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";

import { type Adquirente, type Oferente } from "@/types/expediente.types";
import {
  registrarAdquirente,
  listarAdquirentes,
  obtenerAdquirente,
  editarAdquirente,
  eliminarAdquirente,
} from "@/services/adquirenteService";
import {
  registrarOferente,
  listarOferentes,
  obtenerOferente,
  editarOferente,
  eliminarOferente,
} from "@/services/oferenteService";
import { registrarProveedorRapido } from "@/services/proveedores.service";
import type { AdquirenteFormValues, OferenteFormValues } from "@/lib/schemas/fase2Schema";
import { AdquirenteSheet } from "./AdquirenteSheet";
import { OferenteSheet } from "./OferenteSheet";
import { ConfirmarEliminacionDialog } from "./ConfirmarEliminacionDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Documentos del Procedimiento (estático) ────────────────────────

interface DocumentoItem {
  id: string;
  nombre: string;
  generado: boolean;
  procesando: boolean;
}

const DOCUMENTOS_INICIALES: DocumentoItem[] = [
  { id: "doc-1", nombre: "Registro de adquirentes del pliego", generado: false, procesando: false },
  { id: "doc-2", nombre: "Actas de recepción de sobre", generado: false, procesando: false },
  { id: "doc-3", nombre: "Acta de apertura de sobre", generado: false, procesando: false },
];

// ─── Componente Principal ───────────────────────────────────────────

interface Fase2PanelProps {
  expedienteId: string;
}

export function Fase2Panel({ expedienteId }: Fase2PanelProps) {
  // ── Estado de Adquirentes ──
  const [adquirentes, setAdquirentes] = useState<Adquirente[]>([]);
  const [adquirenteSheetOpen, setAdquirenteSheetOpen] = useState(false);
  const [adquirenteEditando, setAdquirenteEditando] = useState<Adquirente | null>(null);
  const [deleteAdquirenteOpen, setDeleteAdquirenteOpen] = useState(false);
  const [adquirenteToDelete, setAdquirenteToDelete] = useState<string | null>(null);
  const [loadingAdquirentes, setLoadingAdquirentes] = useState(false);

  // ── Estado de Oferentes ──
  const [oferentes, setOferentes] = useState<Oferente[]>([]);
  const [oferenteSheetOpen, setOferenteSheetOpen] = useState(false);
  const [oferenteEditando, setOferenteEditando] = useState<Oferente | null>(null);
  const [deleteOferenteOpen, setDeleteOferenteOpen] = useState(false);
  const [oferenteToDelete, setOferenteToDelete] = useState<string | null>(null);
  const [loadingOferentes, setLoadingOferentes] = useState(false);

  // ── Modal de proveedor guardado rápidamente ──
  const [showProviderWarning, setShowProviderWarning] = useState(false);
  const [registroRapidoRif, setRegistroRapidoRif] = useState("");

  // ── Estado de Documentos ──
  const [documentos, setDocumentos] = useState<DocumentoItem[]>(DOCUMENTOS_INICIALES);

  // ── Funciones de carga ──
  const loadOferentes = async () => {
    if (!expedienteId) return;
    setLoadingOferentes(true);
    try {
      const data = await listarOferentes(expedienteId);
      const mapped: Oferente[] = data.map((item: any) => ({
        id: item.id,
        nombreEmpresa: item.nombreProveedorOferente,
        rif: item.rifProveedorOferente,
        representanteLegal: item.nombreRepLegalOferente,
        cedula: item.cedulaRepLegalOferente,
        registroMercantil: item.datosRegistroMercantilProveedorOferente || "—",
        cantidadSobres: item.numeroSobresEntregados ? String(item.numeroSobresEntregados) : "0",
        montoOferta: item.montoOfertaBs
          ? new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES" }).format(
              item.montoOfertaBs
            )
          : "—",
      }));
      setOferentes(mapped);
    } catch (error) {
      console.error("Error al cargar oferentes:", error);
      toast.error("No se pudo cargar la lista de oferentes");
    } finally {
      setLoadingOferentes(false);
    }
  };

  const loadAdquirentes = async () => {
    if (!expedienteId) return;
    setLoadingAdquirentes(true);
    try {
      const data = await listarAdquirentes(expedienteId);
      const mapped: Adquirente[] = data.map((item: any) => ({
        id: item.id,
        fecha: item.fechaAdquisicion,
        empresa: item.nombreProveedorAdquiriente,
        domicilioFiscal: item.direccionFiscalProveedorAdquiriente,
        telefono: item.telefonoProveedorAdquiriente,
        correo: item.correoProveedorAdquiriente,
        deposito: item.datosPagoPliego || "—",
      }));
      setAdquirentes(mapped);
    } catch (error) {
      console.error("Error al cargar adquirentes:", error);
      toast.error("No se pudo cargar la lista de adquirentes");
    } finally {
      setLoadingAdquirentes(false);
    }
  };

  // ── Efecto: Cargar datos dinámicos ──
  useEffect(() => {
    loadOferentes();
    loadAdquirentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId]);

  // ── Helpers de formato ──
  function formatDate(iso: string): string {
    if (!iso) return "—";
    const d = new Date(`${iso.split("T")[0]}T12:00:00`);
    return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  // ── Handlers de Adquirentes ──
  const handleAddAdquirente = async (data: AdquirenteFormValues) => {
    try {
      const payload = {
        expedienteId,
        fechaAdquisicion: data.fechaAdquisicion.split("T")[0],
        nombreProveedorAdquiriente: data.nombreEmpresa,
        direccionFiscalProveedorAdquirente: data.domicilioFiscal,
        telefonoProveedorAdquirente: data.telefono,
        correoProveedorAdquirente: data.correo,
        datosPagoPliego: data.referenciaDeposito || "—",
      };

      if (adquirenteEditando) {
        await editarAdquirente(adquirenteEditando.id, {
          ...payload,
          proveedorId: null,
        });
        toast.success("Adquirente actualizado exitosamente");
      } else {
        await registrarAdquirente(payload);
        toast.success("Adquirente registrado exitosamente");
      }

      loadAdquirentes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar adquirente");
    }
  };

  const handleDeleteAdquirente = async () => {
    if (adquirenteToDelete) {
      try {
        await eliminarAdquirente(adquirenteToDelete);
        toast.success("Adquirente eliminado");
        setAdquirenteToDelete(null);
        setDeleteAdquirenteOpen(false);
        loadAdquirentes();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al eliminar adquirente");
      }
    }
  };

  // ── Handlers de Oferentes ──
  const handleAddOferente = async (data: OferenteFormValues, isNewProvider: boolean) => {
    try {
      const sobresNum = parseInt(data.cantidadSobres, 10) || 0;
      const montoNum = parseFloat(data.montoOferta.replace(/\./g, "").replace(",", ".")) || 0;

      const payload = {
        expedienteId,
        rifProveedorOferente: data.rif,
        nombreProveedorOferente: data.nombreEmpresa,
        nombreRepLegalOferente: data.representanteLegal,
        cedulaRepLegalOferente: data.cedulaRepresentante,
        datosRegistroMercantilProveedorOferente: data.registroMercantil || "—",
        numeroSobresEntregados: sobresNum,
        montoOfertaBs: montoNum,
      };

      if (oferenteEditando) {
        await editarOferente(oferenteEditando.id, {
          ...payload,
          proveedorId: null,
        });
        toast.success("Oferente actualizado exitosamente");
      } else {
        // Lógica de registro rápido de proveedor
        if (isNewProvider) {
          try {
            await registrarProveedorRapido({
              rif: data.rif,
              nombre: data.nombreEmpresa,
              nombreRepLegal: data.representanteLegal,
              cedulaRepLegal: data.cedulaRepresentante,
              datosRegistroMercantil: data.registroMercantil || "—",
            });
            // Mostrar modal de advertencia al final
            setRegistroRapidoRif(data.rif);
            setShowProviderWarning(true);
          } catch (rapidoErr: any) {
            // Si el proveedor ya existía pero el usuario no lo clickeó (por error 409 etc),
            // podemos continuar el registro de oferente con tranquilidad.
            console.warn("Aviso al registrar proveedor rápido:", rapidoErr);
          }
        }

        await registrarOferente(payload);
        toast.success("Oferente registrado exitosamente");
      }

      loadOferentes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar oferente");
    }
  };

  const handleDeleteOferente = async () => {
    if (oferenteToDelete) {
      try {
        await eliminarOferente(oferenteToDelete);
        toast.success("Oferente eliminado");
        setOferenteToDelete(null);
        setDeleteOferenteOpen(false);
        loadOferentes();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al eliminar oferente");
      }
    }
  };

  // ── Handler de Documentos (simulado) ──
  const handleGenerarDocumento = (docId: string) => {
    // Simular procesamiento
    setDocumentos((prev) => prev.map((d) => (d.id === docId ? { ...d, procesando: true } : d)));
    setTimeout(() => {
      setDocumentos((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, procesando: false, generado: true } : d))
      );
      toast.success("Documento generado exitosamente");
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Sección Superior: Adquirentes + Documentos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tabla de Adquirentes (2/3) */}
        <Card className="col-span-1 lg:col-span-2 border border-border shadow-sm overflow-hidden flex flex-col p-0 gap-0">
          <CardHeader className="pb-4 pt-4 px-6 flex flex-row items-center justify-between border-b border-border bg-slate-50 m-0">
            <div className="flex items-center gap-3">
              <IoServer className="w-6 h-6 text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Registro de Adquirentes
              </CardTitle>
            </div>
            <Button
              onClick={() => {
                setAdquirenteEditando(null);
                setAdquirenteSheetOpen(true);
              }}
              variant="ghost"
              className="text-navy hover:text-navy-hover hover:bg-slate-100 font-bold text-[13px] p-0"
            >
              + Añadir Adquirentes
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px] w-[15%]">
                    Fecha
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px] w-[45%]">
                    Empresa
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px] w-[25%]">
                    Deposito
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px] w-[15%]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAdquirentes ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground italic py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                        <p>Cargando adquirentes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : adquirentes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground italic py-12"
                    >
                      No hay adquirentes registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  adquirentes.map((adq) => (
                    <TableRow key={adq.id} className="border-b border-border hover:bg-slate-50/50">
                      <TableCell className="text-[13px] font-semibold text-color-subtitulos text-center py-3 px-2 whitespace-normal break-words leading-tight">
                        {formatDate(adq.fecha)}
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold text-color-titulos text-center py-3 px-2 whitespace-normal break-all leading-tight">
                        {adq.empresa}
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold text-color-titulos text-center py-3 px-2 tabular-nums whitespace-normal break-all leading-tight">
                        {adq.deposito}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="text-slate-500 hover:text-navy transition-colors"
                            onClick={async () => {
                              try {
                                const detallado = await obtenerAdquirente(adq.id);
                                setAdquirenteEditando({
                                  id: detallado.id,
                                  fecha: detallado.fechaAdquisicion,
                                  empresa: detallado.nombreProveedorAdquiriente,
                                  domicilioFiscal: detallado.direccionFiscalProveedorAdquirente,
                                  telefono: detallado.telefonoProveedorAdquirente,
                                  correo: detallado.correoProveedorAdquirente,
                                  deposito:
                                    detallado.datosPagoPliego && detallado.datosPagoPliego !== "—"
                                      ? detallado.datosPagoPliego
                                      : "",
                                });
                                setAdquirenteSheetOpen(true);
                              } catch (e) {
                                toast.error("Error al obtener detalles del adquirente");
                              }
                            }}
                          >
                            <BsEye className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => {
                              setAdquirenteToDelete(adq.id);
                              setDeleteAdquirenteOpen(true);
                            }}
                          >
                            <FaRegTrashAlt className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="px-6 py-4 bg-slate-50 border-t border-border mt-auto">
              <Pagination className="justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      &lt;
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive
                      className="h-8 w-8 p-0 bg-navy text-white hover:bg-navy-hover border-transparent rounded-md"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      3
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      4
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      &gt;
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        {/* Documentos del Procedimiento (1/3) */}
        <Card className="border border-border shadow-sm flex flex-col pt-6">
          <CardHeader className="pb-6 pt-0 px-6">
            <div className="flex items-center gap-4">
              <IoDocumentTextOutline className="w-6 h-6 text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Documentos del Procedimiento
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex-1 flex flex-col">
            <div className="space-y-8 mt-2">
              {documentos.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-[46px] h-[46px] rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                      {doc.id === "doc-1" || doc.id === "doc-3" ? (
                        <IoReceiptOutline className="w-[22px] h-[22px] text-slate-700" />
                      ) : (
                        <FaRegClipboard className="w-[20px] h-[20px] text-slate-700" />
                      )}
                    </div>
                    <p className="text-[14px] font-bold text-color-titulos leading-tight max-w-[130px]">
                      {doc.nombre}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {doc.procesando ? (
                      <div className="flex items-center justify-center w-[22px] h-[22px]">
                        <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        {/* Visualizar */}
                        <button
                          className="text-[#334155] hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={!doc.generado}
                        >
                          <IoEyeOutline className="w-[26px] h-[26px]" />
                        </button>

                        {/* Descargar */}
                        <button
                          className="text-[#334155] hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={!doc.generado}
                        >
                          <IoDownloadOutline className="w-[24px] h-[24px]" />
                        </button>

                        {/* Generar / Regenerar */}
                        <button
                          className="text-[#334155] hover:text-navy transition-colors"
                          onClick={() => handleGenerarDocumento(doc.id)}
                        >
                          {doc.generado ? (
                            <BsArrowClockwise className="w-[20px] h-[20px]" />
                          ) : (
                            <IoNewspaperOutline className="w-[24px] h-[24px]" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sección Inferior: Oferentes ── */}
      <Card className="border border-border shadow-sm overflow-hidden flex flex-col p-0 gap-0">
        <CardHeader className="pb-4 pt-4 px-6 flex flex-row items-center justify-between border-b border-border bg-slate-50 m-0">
          <div className="flex items-center gap-3">
            <IoDiamondOutline className="w-6 h-6 text-color-titulos" />
            <CardTitle className="text-[17px] font-bold text-color-titulos">
              Registro de Oferentes
            </CardTitle>
          </div>
          <Button
            onClick={() => {
              setOferenteEditando(null);
              setOferenteSheetOpen(true);
            }}
            variant="ghost"
            className="text-navy hover:text-navy-hover hover:bg-slate-100 font-bold text-[13px] p-0"
          >
            + Añadir Oferentes
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[18%]">
                  Empresa
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[12%]">
                  RIF
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[15%]">
                  Rep. Legal
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[11%]">
                  Cédula
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[19%]">
                  Reg. Mercantil
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[15%]">
                  Monto oferta
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 text-center h-10 text-[11px] w-[10%]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingOferentes ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground italic py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                      <p>Cargando oferentes...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : oferentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground italic py-12">
                    No hay oferentes registrados.
                  </TableCell>
                </TableRow>
              ) : (
                oferentes.map((ofe) => (
                  <TableRow key={ofe.id} className="border-b border-border hover:bg-slate-50/50">
                    <TableCell className="text-[10px] font-semibold text-color-titulos py-3 px-2 text-center whitespace-normal break-all leading-tight">
                      {ofe.nombreEmpresa}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-subtitulos font-mono py-3 px-2 text-center leading-tight break-all">
                      {ofe.rif}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-subtitulos py-3 px-2 text-center whitespace-normal break-all leading-tight">
                      {ofe.representanteLegal}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-subtitulos font-mono py-3 px-2 text-center leading-tight break-all">
                      {ofe.cedula}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-subtitulos py-3 px-2 text-center whitespace-normal break-all leading-tight">
                      {ofe.registroMercantil}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-titulos py-3 px-2 tabular-nums text-center whitespace-normal break-all leading-tight">
                      {ofe.montoOferta}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="text-slate-500 hover:text-navy transition-colors"
                          onClick={async () => {
                            try {
                              const detallado = await obtenerOferente(ofe.id);
                              setOferenteEditando({
                                id: detallado.id,
                                nombreEmpresa: detallado.nombreProveedorOferente,
                                rif: detallado.rifProveedorOferente,
                                representanteLegal: detallado.nombreRepLegalOferente,
                                cedula: detallado.cedulaRepLegalOferente,
                                registroMercantil:
                                  detallado.datosRegistroMercantilProveedorOferente || "—",
                                cantidadSobres: detallado.numeroSobresEntregados
                                  ? String(detallado.numeroSobresEntregados)
                                  : "0",
                                montoOferta: String(detallado.montoOfertaBs),
                              });
                              setOferenteSheetOpen(true);
                            } catch (e) {
                              toast.error("Error al obtener detalles del oferente");
                            }
                          }}
                        >
                          <BsEye className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600 transition-colors"
                          onClick={() => {
                            setOferenteToDelete(ofe.id);
                            setDeleteOferenteOpen(true);
                          }}
                        >
                          <FaRegTrashAlt className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="px-6 py-4 bg-slate-50 border-t border-border mt-auto">
            <Pagination className="justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    &lt;
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                    className="h-8 w-8 p-0 bg-navy text-white hover:bg-navy-hover border-transparent rounded-md"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    4
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    &gt;
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* ── Sheets ── */}
      <AdquirenteSheet
        open={adquirenteSheetOpen}
        onOpenChange={setAdquirenteSheetOpen}
        mode={adquirenteEditando ? "editar" : "crear"}
        defaultValues={
          adquirenteEditando
            ? {
                fechaAdquisicion: adquirenteEditando.fecha,
                nombreEmpresa: adquirenteEditando.empresa,
                domicilioFiscal: adquirenteEditando.domicilioFiscal,
                telefono: adquirenteEditando.telefono,
                correo: adquirenteEditando.correo,
                referenciaDeposito: adquirenteEditando.deposito,
              }
            : undefined
        }
        onSubmit={handleAddAdquirente}
      />

      <OferenteSheet
        open={oferenteSheetOpen}
        onOpenChange={setOferenteSheetOpen}
        mode={oferenteEditando ? "editar" : "crear"}
        defaultValues={
          oferenteEditando
            ? {
                rif: oferenteEditando.rif,
                nombreEmpresa: oferenteEditando.nombreEmpresa,
                representanteLegal: oferenteEditando.representanteLegal,
                cedulaRepresentante: oferenteEditando.cedula,
                registroMercantil: oferenteEditando.registroMercantil,
                cantidadSobres: oferenteEditando.cantidadSobres,
                montoOferta: oferenteEditando.montoOferta,
              }
            : undefined
        }
        onSubmit={handleAddOferente}
      />

      {/* ── Diálogos de eliminación ── */}
      <ConfirmarEliminacionDialog
        open={deleteAdquirenteOpen}
        onOpenChange={setDeleteAdquirenteOpen}
        onConfirm={handleDeleteAdquirente}
        tipo="adquirente"
      />

      <ConfirmarEliminacionDialog
        open={deleteOferenteOpen}
        onOpenChange={setDeleteOferenteOpen}
        onConfirm={handleDeleteOferente}
        tipo="oferente"
      />

      {/* Modal especial de Registro Rápido */}
      <Dialog open={showProviderWarning} onOpenChange={setShowProviderWarning}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-navy font-bold">Registro Rápido Exitoso</DialogTitle>
            <DialogDescription className="text-slate-500 mt-3 pt-2">
              Se ha detectado que el RIF <strong className="text-navy">{registroRapidoRif}</strong>{" "}
              no existía en nuestro sistema. Lo hemos añadido a la base de datos de{" "}
              <strong>Proveedores</strong> de forma rápida para poder registrar la oferta con éxito.
              <br />
              <br />
              Por favor, recuerde dirigirse posteriormente al{" "}
              <strong className="text-navy">Módulo de Proveedores</strong> para completar
              exhaustivamente el perfil de esta empresa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowProviderWarning(false)}
              className="bg-navy hover:bg-navy/90 text-white font-bold w-full"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
