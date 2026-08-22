"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ChatPanel } from "@/components/features-components/ComplianceExpediente/ChatPanel";
import { FilesSheet } from "@/components/features-components/ComplianceExpediente/FilesSheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { obtenerSesion, subirDocumento } from "@/services/complianceApi";
import type { SesionCompliance, TipoDocumento } from "@/types/compliance.types";

interface Props {
  sesionId: string;
  readOnly?: boolean;
}

/** Altura del área útil: header + padding layout + breadcrumbs */
const SESSION_SHELL_HEIGHT = "h-[calc(100vh-10.5rem)]";

export function ComplianceSessionView({ sesionId, readOnly = false }: Props) {
  const [sesion, setSesion] = useState<SesionCompliance | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filesOpen, setFilesOpen] = useState(false);

  const loadSesion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await obtenerSesion(sesionId);
      setSesion(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la sesión");
      setSesion(null);
    } finally {
      setLoading(false);
    }
  }, [sesionId]);

  useEffect(() => {
    void loadSesion();
  }, [loadSesion]);

  function onSesionUpdate(next: SesionCompliance) {
    setSesion(next);
  }

  const filesCount = useMemo(() => {
    if (!sesion) return 0;
    return sesion.documentos_analizados.length + (sesion.dictamenes_juridicos?.length ?? 0);
  }, [sesion]);

  async function handleUpload(tipo: TipoDocumento, file: File) {
    if (!sesion || readOnly) return;
    setBusy(true);
    try {
      const res = await subirDocumento(sesion.id, tipo, file);
      const updated: SesionCompliance = {
        ...sesion,
        documento_en_cuestionario: null,
        documentos_analizados: [
          ...sesion.documentos_analizados.filter((d) => d.id !== res.documento.id),
          res.documento,
        ],
        checklist_slots: sesion.checklist_slots.map((s) =>
          s.tipo_documento === tipo && res.documento.tipo_coincide !== false
            ? { ...s, auditado: true }
            : s
        ),
        historial: [
          ...sesion.historial,
          {
            rol: "user",
            contenido: `Subí ${file.name} como ${tipo}`,
            timestamp: new Date().toISOString(),
          },
          {
            rol: "assistant",
            contenido: res.mensaje,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      onSesionUpdate(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div
        className={`flex ${SESSION_SHELL_HEIGHT} items-center justify-center gap-2 text-muted-foreground`}
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando sesión…
      </div>
    );
  }

  if (!sesion && error) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-border-light bg-white p-8 text-center">
        <p className="text-lg font-semibold text-heading-dark">No se pudo abrir la sesión</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button asChild className="bg-navy hover:bg-navy-hover text-white">
          <Link href="/compliance-expediente">Ir al listado</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex ${SESSION_SHELL_HEIGHT} w-full min-h-0 flex-col gap-3 overflow-hidden`}>
      {error && (
        <Alert variant="destructive" className="shrink-0 border-danger text-danger">
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-danger hover:text-danger"
              onClick={() => setError(null)}
            >
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border-light bg-white shadow-sm">
        <ChatPanel
          sesion={sesion}
          busy={busy}
          readOnly={readOnly}
          filesCount={filesCount}
          onOpenFiles={() => setFilesOpen(true)}
          onUpload={handleUpload}
          onSesionUpdate={onSesionUpdate}
          onError={setError}
          onBusy={setBusy}
        />
      </div>

      <FilesSheet
        open={filesOpen}
        onOpenChange={setFilesOpen}
        sesion={sesion}
        busy={busy}
        readOnly={readOnly}
        onSesionUpdate={onSesionUpdate}
        onError={setError}
        onBusy={setBusy}
      />
    </div>
  );
}
