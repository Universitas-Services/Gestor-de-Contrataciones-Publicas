"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, FileCheck2 } from "lucide-react";
import { toast } from "sonner";

import {
  ESPECIFICACIONES_TECNICAS_ACCEPT,
  ESPECIFICACIONES_TECNICAS_MAX_BYTES,
  ESPECIFICACIONES_TECNICAS_UPLOAD_DESCRIPTION,
  ESPECIFICACIONES_TECNICAS_UPLOAD_TITLE,
  type EspecificacionesTecnicasStoredMeta,
} from "@/lib/constants/especificacionesTecnicas";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface EspecificacionesUploadZoneProps {
  value: EspecificacionesTecnicasStoredMeta | null;
  onChange: (meta: EspecificacionesTecnicasStoredMeta | null) => void;
  disabled?: boolean;
}

function isAcceptedFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  const hasValidExtension = ESPECIFICACIONES_TECNICAS_ACCEPT.extensions.some((ext) =>
    lowerName.endsWith(ext)
  );
  const hasValidMime =
    !file.type ||
    (ESPECIFICACIONES_TECNICAS_ACCEPT.mimeTypes as readonly string[]).includes(file.type);

  return hasValidExtension && hasValidMime;
}

function toStoredMeta(file: File): EspecificacionesTecnicasStoredMeta {
  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
  };
}

export function EspecificacionesUploadZone({
  value,
  onChange,
  disabled = false,
}: EspecificacionesUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File | undefined) => {
      if (!file || disabled) return;

      if (!isAcceptedFile(file)) {
        toast.error("Solo se permiten archivos PDF o DOCX.");
        return;
      }

      if (file.size > ESPECIFICACIONES_TECNICAS_MAX_BYTES) {
        toast.error("El archivo no debe superar los 10 MB.");
        return;
      }

      onChange(toStoredMeta(file));
    },
    [disabled, onChange]
  );

  const handleOpenPicker = () => {
    if (disabled || value) return;
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-stretch gap-4 p-5 md:p-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-color-titulos">
          {ESPECIFICACIONES_TECNICAS_UPLOAD_TITLE}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {ESPECIFICACIONES_TECNICAS_UPLOAD_DESCRIPTION}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={ESPECIFICACIONES_TECNICAS_ACCEPT.acceptAttr}
        disabled={disabled}
        onChange={(event) => {
          processFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <div
        role={value || disabled ? undefined : "button"}
        tabIndex={value || disabled ? undefined : 0}
        aria-disabled={disabled || undefined}
        onClick={handleOpenPicker}
        onKeyDown={(event) => {
          if (value || disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenPicker();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (disabled || value) return;
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (disabled || value) return;
          processFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-6 transition-colors",
          value
            ? "cursor-default border-success bg-success-bg"
            : "cursor-pointer border-border bg-card hover:border-navy hover:bg-muted/40",
          isDragging && !value ? "border-navy bg-muted/40" : "",
          disabled ? "cursor-not-allowed opacity-60" : ""
        )}
      >
        {value ? (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-success">
              <FileCheck2 className="h-8 w-8" />
            </div>
            <p className="w-full truncate px-2 text-center text-sm font-bold text-color-titulos">
              {value.fileName}
            </p>
            <p className="text-xs font-semibold text-success-text">Archivo cargado exitosamente</p>
            {!disabled ? (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-muted-foreground underline hover:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(null);
                }}
              >
                Quitar archivo
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-navy">
              <CloudUpload className="h-8 w-8" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-bold text-foreground">Arrastre su archivo aquí</p>
              <p className="text-xs text-muted-foreground">
                o haga clic para explorar en su equipo
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="border-border bg-muted text-muted-foreground">
                PDF
              </Badge>
              <Badge variant="secondary" className="border-border bg-muted text-muted-foreground">
                DOCX
              </Badge>
              <Badge variant="secondary" className="border-border bg-muted text-muted-foreground">
                Máx. 10MB
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
