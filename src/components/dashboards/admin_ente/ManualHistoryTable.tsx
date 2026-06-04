"use client";

import { useState, useEffect, useCallback } from "react";
import { BsEye } from "react-icons/bs";
import { IoDownloadOutline } from "react-icons/io5";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  obtenerHistorialManuales,
  previewManualPorId,
  descargarManualPorId,
  type HistorialManualItem,
} from "@/services/manualService";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";

export function ManualHistoryTable() {
  const [historial, setHistorial] = useState<HistorialManualItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [urlArchivo, setUrlArchivo] = useState<string | null>(null);
  const [tituloManual, setTituloManual] = useState<string | null>(null);

  const isBusy = previewingId !== null || downloadingId !== null;

  /* ── Cargar historial ── */
  const fetchHistorial = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const result = await obtenerHistorialManuales(1, 4);
      setHistorial(result.data ?? []);
    } catch {
      // Silenciar — no bloquear la UI
      setHistorial([]);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  /* ── Escuchar evento de generación para refrescar ── */
  useEffect(() => {
    const handleManualChange = () => {
      fetchHistorial();
    };

    window.addEventListener("manual-modificado", handleManualChange);
    return () => {
      window.removeEventListener("manual-modificado", handleManualChange);
    };
  }, [fetchHistorial]);

  /* ── Handlers ── */
  const handlePreview = async (item: HistorialManualItem) => {
    setPreviewingId(item.id);
    setIsPreviewOpen(true);
    try {
      const result = await previewManualPorId(item.id);
      setUrlArchivo(result.urlArchivo);
      setTituloManual(`${item.tituloManual} v${item.versionDocumento} (Vista Previa)`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualización";
      toast.error(message);
      setIsPreviewOpen(false);
    } finally {
      setPreviewingId(null);
    }
  };

  const handleDescargar = async (item: HistorialManualItem) => {
    setDownloadingId(item.id);
    try {
      const { data, fileName } = await descargarManualPorId(item.id);
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${item.tituloManual} v${item.versionDocumento} descargado exitosamente`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al descargar el manual";
      toast.error(message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreviewClose = (open: boolean) => {
    setIsPreviewOpen(open);
    if (!open) {
      setUrlArchivo(null);
      setTituloManual(null);
    }
  };

  /* ── Helpers ── */
  const getFecha = (item: HistorialManualItem): string => {
    if (item.snapshotDatos?.fechaGeneracion) {
      return item.snapshotDatos.fechaGeneracion;
    }
    // Fallback: formatear createdAt
    try {
      return new Date(item.createdAt).toLocaleDateString("es-VE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return item.createdAt;
    }
  };

  /* ── Render ── */
  return (
    <>
      <div className="w-full overflow-hidden">
        <table className="w-full text-left text-[12.5px] text-slate-600 table-fixed">
          <colgroup>
            <col className="w-[50%]" />
            <col className="w-[30%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-3 py-2.5 text-center">Nombre</th>
              <th className="px-3 py-2.5 text-center">Fecha</th>
              <th className="px-3 py-2.5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoadingData ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Cargando historial...</span>
                  </div>
                </td>
              </tr>
            ) : historial.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center">
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">Sin historial de manuales</span>
                  </div>
                </td>
              </tr>
            ) : (
              historial.map((item) => {
                const isVigente = item.esVersionVigente;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/50 ${
                      isVigente
                        ? "bg-manual-historial-row hover:bg-manual-historial-row/90 font-medium text-emerald-950"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-2 text-center align-middle">
                      <div className="flex items-center justify-center gap-2 text-center w-full">
                        <FileText
                          className={`h-5 w-5 shrink-0 ${isVigente ? "text-emerald-600" : "text-slate-400"}`}
                        />
                        <span className="break-words whitespace-normal leading-normal">
                          {item.tituloManual} v{item.versionDocumento}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-3 py-2 text-xs text-center break-words whitespace-normal ${
                        isVigente ? "text-emerald-800/80" : "text-slate-400"
                      }`}
                    >
                      {getFecha(item)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handlePreview(item)}
                          disabled={isBusy}
                          title="Previsualizar"
                          className={`${
                            isVigente
                              ? "text-emerald-700 hover:text-emerald-950"
                              : "text-slate-500 hover:text-navy"
                          } transition-colors cursor-pointer disabled:opacity-50`}
                        >
                          {previewingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <BsEye className="w-4.5 h-4.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDescargar(item)}
                          disabled={isBusy}
                          title="Descargar"
                          className={`${
                            isVigente
                              ? "text-emerald-700 hover:text-emerald-950"
                              : "text-slate-500 hover:text-navy"
                          } transition-colors cursor-pointer disabled:opacity-50`}
                        >
                          {downloadingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <IoDownloadOutline className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ManualPreviewDialog
        open={isPreviewOpen}
        onOpenChange={handlePreviewClose}
        urlArchivo={urlArchivo}
        tituloManual={tituloManual}
        isLoading={previewingId !== null}
      />
    </>
  );
}
