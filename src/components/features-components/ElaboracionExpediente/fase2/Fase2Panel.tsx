"use client";

import React, { useState } from "react";
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
import type { AdquirenteFormValues, OferenteFormValues } from "@/lib/schemas/fase2Schema";
import { AdquirenteSheet } from "./AdquirenteSheet";
import { OferenteSheet } from "./OferenteSheet";
import { ConfirmarEliminacionDialog } from "./ConfirmarEliminacionDialog";

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

export function Fase2Panel() {
  // ── Estado de Adquirentes ──
  const [adquirentes, setAdquirentes] = useState<Adquirente[]>([]);
  const [adquirenteSheetOpen, setAdquirenteSheetOpen] = useState(false);
  const [adquirenteEditando, setAdquirenteEditando] = useState<Adquirente | null>(null);
  const [deleteAdquirenteOpen, setDeleteAdquirenteOpen] = useState(false);
  const [adquirenteToDelete, setAdquirenteToDelete] = useState<string | null>(null);

  // ── Estado de Oferentes ──
  const [oferentes, setOferentes] = useState<Oferente[]>([]);
  const [oferenteSheetOpen, setOferenteSheetOpen] = useState(false);
  const [oferenteEditando, setOferenteEditando] = useState<Oferente | null>(null);
  const [deleteOferenteOpen, setDeleteOferenteOpen] = useState(false);
  const [oferenteToDelete, setOferenteToDelete] = useState<string | null>(null);

  // ── Estado de Documentos ──
  const [documentos, setDocumentos] = useState<DocumentoItem[]>(DOCUMENTOS_INICIALES);

  // ── Helpers de formato ──
  function formatDate(iso: string): string {
    if (!iso) return "—";
    const d = new Date(`${iso.split("T")[0]}T12:00:00`);
    return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  // ── Handlers de Adquirentes ──
  const handleAddAdquirente = (data: AdquirenteFormValues) => {
    const newAdq: Adquirente = {
      id: `adq-${Date.now()}`,
      fecha: data.fechaAdquisicion.split("T")[0],
      empresa: data.nombreEmpresa,
      domicilioFiscal: data.domicilioFiscal,
      telefono: data.telefono,
      correo: data.correo,
      deposito: data.referenciaDeposito || "—",
    };
    setAdquirentes((prev) => [...prev, newAdq]);
  };

  const handleDeleteAdquirente = () => {
    if (adquirenteToDelete) {
      setAdquirentes((prev) => prev.filter((a) => a.id !== adquirenteToDelete));
      toast.success("Adquirente eliminado");
      setAdquirenteToDelete(null);
      setDeleteAdquirenteOpen(false);
    }
  };

  // ── Handlers de Oferentes ──
  const handleAddOferente = (data: OferenteFormValues) => {
    const newOfe: Oferente = {
      id: `ofe-${Date.now()}`,
      nombreEmpresa: data.nombreEmpresa,
      rif: data.rif,
      representanteLegal: data.representanteLegal,
      cedula: data.cedulaRepresentante,
      registroMercantil: data.registroMercantil || "—",
      montoOferta: data.montoOferta,
    };
    setOferentes((prev) => [...prev, newOfe]);
  };

  const handleDeleteOferente = () => {
    if (oferenteToDelete) {
      setOferentes((prev) => prev.filter((o) => o.id !== oferenteToDelete));
      toast.success("Oferente eliminado");
      setOferenteToDelete(null);
      setDeleteOferenteOpen(false);
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
          <CardContent className="p-0 flex-1 flex flex-col">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px]">
                    Fecha
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px]">
                    Empresa
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px]">
                    Deposito
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adquirentes.length === 0 ? (
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
                      <TableCell className="text-[15px] font-semibold text-color-subtitulos text-center py-4">
                        {formatDate(adq.fecha)}
                      </TableCell>
                      <TableCell className="text-[15px] font-semibold text-color-titulos text-center py-4">
                        {adq.empresa}
                      </TableCell>
                      <TableCell className="text-[15px] font-semibold text-color-titulos text-center py-4 tabular-nums">
                        {adq.deposito}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="text-slate-500 hover:text-navy transition-colors"
                            onClick={() => {
                              setAdquirenteEditando(adq);
                              setAdquirenteSheetOpen(true);
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-color-titulos font-bold h-12 text-[15px]">
                  Nombre empresa
                </TableHead>
                <TableHead className="text-color-titulos font-bold h-12 text-[15px]">RIF</TableHead>
                <TableHead className="text-color-titulos font-bold h-12 text-[15px]">
                  Representante Legal
                </TableHead>
                <TableHead className="text-color-titulos font-bold h-12 text-[15px]">
                  Cédula
                </TableHead>
                <TableHead className="text-color-titulos font-bold h-12 text-[15px]">
                  Registro Mercantil
                </TableHead>
                <TableHead className="text-color-titulos font-bold h-12 text-[15px]">
                  Monto oferta
                </TableHead>
                <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oferentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground italic py-12">
                    No hay oferentes registrados.
                  </TableCell>
                </TableRow>
              ) : (
                oferentes.map((ofe) => (
                  <TableRow key={ofe.id} className="border-b border-border hover:bg-slate-50/50">
                    <TableCell className="text-[14px] font-semibold text-color-titulos py-4">
                      {ofe.nombreEmpresa}
                    </TableCell>
                    <TableCell className="text-[14px] font-semibold text-color-subtitulos font-mono py-4">
                      {ofe.rif}
                    </TableCell>
                    <TableCell className="text-[14px] font-semibold text-color-subtitulos py-4">
                      {ofe.representanteLegal}
                    </TableCell>
                    <TableCell className="text-[14px] font-semibold text-color-subtitulos font-mono py-4">
                      {ofe.cedula}
                    </TableCell>
                    <TableCell className="text-[14px] font-semibold text-color-subtitulos py-4">
                      {ofe.registroMercantil}
                    </TableCell>
                    <TableCell className="text-[14px] font-semibold text-color-titulos py-4 tabular-nums">
                      {ofe.montoOferta}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="text-slate-500 hover:text-navy transition-colors"
                          onClick={() => {
                            setOferenteEditando(ofe);
                            setOferenteSheetOpen(true);
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
    </div>
  );
}
