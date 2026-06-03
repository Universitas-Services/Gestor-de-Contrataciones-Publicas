"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  Download,
  Loader2,
  FileText,
  RefreshCw,
  ChevronDown,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { previewManual, descargarManual, generarManual } from "@/services/manualService";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import { useManualRequisitos } from "@/hooks/use-manual-requisitos";

interface ManualButtonsProps {
  orientation?: "horizontal" | "vertical";
}

export function ManualButtons({ orientation = "horizontal" }: ManualButtonsProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [urlArchivo, setUrlArchivo] = useState<string | null>(null);
  const [tituloManual, setTituloManual] = useState<string | null>(null);

  const { estado, isLoading: isLoadingRequisitos, refetch } = useManualRequisitos();

  const isBusy = isPreviewing || isDownloading || isGenerating;

  const handlePreview = async () => {
    setIsPreviewing(true);
    setIsPreviewOpen(true);
    try {
      const result = await previewManual();
      setUrlArchivo(result.urlArchivo);
      setTituloManual(result.tituloManual);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualización";
      toast.error(message);
      setIsPreviewOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handlePreviewClose = (open: boolean) => {
    setIsPreviewOpen(open);
    if (!open) {
      setUrlArchivo(null);
      setTituloManual(null);
    }
  };

  const handleDescargar = async () => {
    setIsDownloading(true);
    try {
      const { data, fileName } = await descargarManual();

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

      toast.success("Manual descargado exitosamente");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al descargar el manual";
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerar = async () => {
    if (!estado?.puedeGenerarManual) return;

    setIsGenerating(true);
    try {
      await generarManual();
      toast.success("Manual generado exitosamente");
      window.dispatchEvent(new CustomEvent("manual-modificado"));
      refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al generar el manual";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const puedeGenerar = estado?.puedeGenerarManual ?? false;
  const requisitosFaltantes = estado?.requisitosFaltantes ?? [];
  const isVertical = orientation === "vertical";

  /* ────── Botón de generar deshabilitado con tooltip ────── */
  const generarMenuItem = (
    <DropdownMenuItem
      disabled={!puedeGenerar || isBusy}
      onClick={handleGenerar}
      className={`gap-3 px-3 py-2.5 text-sm font-medium ${
        puedeGenerar
          ? "text-emerald-700 focus:text-emerald-700 focus:bg-emerald-50"
          : "text-muted-foreground opacity-60 cursor-not-allowed"
      }`}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : puedeGenerar ? (
        <Sparkles className="h-4 w-4" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
      <span>Generar / Actualizar</span>
    </DropdownMenuItem>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={isVertical ? "default" : "sm"}
            className={`${
              isVertical
                ? "w-52 h-11 bg-color-boton-2 hover:bg-navy-deep shadow-md hover:shadow-lg"
                : "px-4 bg-color-boton-2 hover:bg-navy-deep shadow-sm hover:shadow-md"
            } gap-2 font-semibold text-white transition-all duration-200`}
          >
            <FileText className="h-4 w-4" />
            Manual
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={isVertical ? "center" : "end"}
          className="w-56 rounded-xl border border-border/50 bg-popover/98 p-1.5 shadow-xl backdrop-blur"
          sideOffset={6}
        >
          {/* Previsualizar */}
          <DropdownMenuItem
            disabled={isBusy}
            onClick={handlePreview}
            className="gap-3 px-3 py-2.5 text-sm font-medium text-foreground focus:bg-slate-50 rounded-lg"
          >
            {isPreviewing ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <Eye className="h-4 w-4 text-blue-600" />
            )}
            <span>Previsualizar manual</span>
          </DropdownMenuItem>

          {/* Descargar */}
          <DropdownMenuItem
            disabled={isBusy}
            onClick={handleDescargar}
            className="gap-3 px-3 py-2.5 text-sm font-medium text-foreground focus:bg-slate-50 rounded-lg"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            ) : (
              <Download className="h-4 w-4 text-indigo-600" />
            )}
            <span>Descargar manual</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          {/* Generar / Actualizar — con tooltip si está deshabilitado */}
          {!puedeGenerar && requisitosFaltantes.length > 0 ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>{generarMenuItem}</div>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="max-w-64 rounded-lg border bg-white px-3 py-2 text-xs shadow-lg"
                >
                  <p className="mb-1 font-semibold text-foreground">Requisitos faltantes:</p>
                  <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                    {requisitosFaltantes.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            generarMenuItem
          )}

          {/* Indicador de carga de requisitos */}
          {isLoadingRequisitos && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Verificando requisitos...
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ManualPreviewDialog
        open={isPreviewOpen}
        onOpenChange={handlePreviewClose}
        urlArchivo={urlArchivo}
        tituloManual={tituloManual}
        isLoading={isPreviewing}
      />
    </>
  );
}
