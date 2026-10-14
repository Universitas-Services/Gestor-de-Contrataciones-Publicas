"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  ESPECIFICACIONES_TECNICAS_SUCCESS_DESCRIPTION,
  ESPECIFICACIONES_TECNICAS_SUCCESS_RESPONSIBILITY,
  ESPECIFICACIONES_TECNICAS_SUCCESS_TITLE,
  ESPECIFICACIONES_TECNICAS_WIZARD_SUBTITLE,
  ESPECIFICACIONES_TECNICAS_WIZARD_TITLE,
  type EspecificacionesTecnicasStoredMeta,
} from "@/lib/constants/especificacionesTecnicas";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { formatMicromoduloErrorMessage } from "@/lib/utils/fase1ApiError";
import { especificacionesTecnicasFromApi } from "@/lib/utils/fase1MicromodulosMapper";
import {
  eliminarEspecificacionesTecnicas,
  obtenerEspecificacionesTecnicas,
  subirEspecificacionesTecnicas,
} from "@/services/fase1MicromodulosService";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EspecificacionesUploadZone } from "./EspecificacionesUploadZone";
import { LineamientosPanel } from "./LineamientosPanel";

export interface EspecificacionesTecnicasFormProps {
  expedienteId: string;
  readOnly?: boolean;
  basePath?: string;
}

export function EspecificacionesTecnicasForm({
  expedienteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: EspecificacionesTecnicasFormProps) {
  const router = useRouter();
  const [fileMeta, setFileMeta] = useState<EspecificacionesTecnicasStoredMeta | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void obtenerEspecificacionesTecnicas(expedienteId)
      .then((response) => {
        if (cancelled) return;
        setFileMeta(especificacionesTecnicasFromApi(response));
      })
      .catch(() => {
        if (!cancelled) setFileMeta(null);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [expedienteId]);

  const goToPanel = () => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  };

  const handleMetaChange = async (meta: EspecificacionesTecnicasStoredMeta | null) => {
    if (readOnly) return;

    if (!meta) {
      if (fileMeta?.url && !pendingFile) {
        try {
          await eliminarEspecificacionesTecnicas(expedienteId);
        } catch (error) {
          toast.error(formatMicromoduloErrorMessage(error));
          return;
        }
      }
      setFileMeta(null);
      setPendingFile(null);
      return;
    }

    setFileMeta(meta);
  };

  const handleFileSelected = (file: File) => {
    setPendingFile(file);
    setFileMeta({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleSave = async () => {
    if (readOnly || !fileMeta) return;
    setIsSaving(true);
    try {
      if (pendingFile) {
        const formData = new FormData();
        formData.append("file", pendingFile);
        const response = await subirEspecificacionesTecnicas(expedienteId, formData);
        setFileMeta(
          especificacionesTecnicasFromApi(response) ?? {
            fileName: pendingFile.name,
            fileSize: pendingFile.size,
            mimeType: pendingFile.type || "application/octet-stream",
            uploadedAt: new Date().toISOString(),
          }
        );
        setPendingFile(null);
      }
      setIsConfirmOpen(true);
    } catch (error) {
      toast.error(formatMicromoduloErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = Boolean(fileMeta) && !readOnly && hydrated;

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando especificaciones…
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full py-6">
        <div className="mx-auto max-w-5xl">
          <Card className="gap-0 overflow-hidden border-border bg-card py-0 shadow-sm">
            <div className="flex items-start gap-3 border-b border-border px-5 py-5 md:px-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
                  {ESPECIFICACIONES_TECNICAS_WIZARD_TITLE}
                </h1>
                <p className="text-[12px] italic leading-relaxed text-muted-foreground">
                  {ESPECIFICACIONES_TECNICAS_WIZARD_SUBTITLE}
                </p>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="grid grid-cols-1 items-start md:grid-cols-2">
                <div className="border-b border-border md:max-h-[calc(100vh-280px)] md:overflow-y-auto md:border-b-0 md:border-r">
                  <LineamientosPanel />
                </div>
                <div className="self-start md:sticky md:top-24">
                  <EspecificacionesUploadZone
                    value={fileMeta}
                    onChange={handleMetaChange}
                    onFileSelected={handleFileSelected}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4 bg-card px-5 py-4 md:px-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPanel}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>

                {readOnly ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPanel}
                    className="border-border text-muted-foreground hover:bg-muted"
                  >
                    Volver al panel
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={!canSave || isSaving || isConfirmOpen}
                    onClick={() => void handleSave()}
                    className="bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
                  >
                    {isSaving ? "Guardando..." : "Guardar y continuar"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsConfirmOpen(false);
            goToPanel();
          }
        }}
      >
        <AlertDialogContent className="max-w-[340px] rounded-xl border-border bg-card p-6 shadow-lg">
          <AlertDialogTitle className="sr-only">
            {ESPECIFICACIONES_TECNICAS_SUCCESS_TITLE}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {ESPECIFICACIONES_TECNICAS_SUCCESS_DESCRIPTION}{" "}
            {ESPECIFICACIONES_TECNICAS_SUCCESS_RESPONSIBILITY}
          </AlertDialogDescription>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2} />
            </div>

            <h2 className="text-lg font-bold leading-tight text-color-titulos">
              {ESPECIFICACIONES_TECNICAS_SUCCESS_TITLE}
            </h2>

            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              {ESPECIFICACIONES_TECNICAS_SUCCESS_DESCRIPTION}
            </p>

            <p className="mt-2 max-w-[280px] text-xs font-semibold leading-relaxed text-amber-dark">
              {ESPECIFICACIONES_TECNICAS_SUCCESS_RESPONSIBILITY}
            </p>

            <Button
              type="button"
              onClick={() => {
                setIsConfirmOpen(false);
                goToPanel();
              }}
              className="mt-5 h-9 w-full max-w-[220px] bg-navy text-xs font-bold text-white hover:bg-navy-hover"
            >
              Volver al panel
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
