"use client";

import { MessageBubble } from "@/components/features-components/ComplianceExpediente/MessageBubble";
import { AttachDocumentsControl } from "@/components/features-components/ComplianceExpediente/AttachDocumentsControl";
import { OptionPicker } from "@/components/features-components/ComplianceExpediente/OptionPicker";
import { QuestionnaireCard } from "@/components/features-components/ComplianceExpediente/QuestionnaireCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { enviarMensaje } from "@/services/complianceApi";
import type { SesionCompliance, TipoDocumento } from "@/types/compliance.types";
import {
  MODALIDAD_HINTS,
  MODALIDAD_LABELS,
  MODALIDADES,
  TIPOS_CONTRATACION,
  TIPO_CONTRATACION_LABELS,
} from "@/types/compliance.types";
import { Loader2, FolderOpen, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  sesion: SesionCompliance | null;
  busy: boolean;
  readOnly?: boolean;
  filesCount?: number;
  onOpenFiles?: () => void;
  onUpload?: (tipo: TipoDocumento, file: File) => void;
  onSesionUpdate: (sesion: SesionCompliance) => void;
  onError: (msg: string) => void;
  onBusy: (v: boolean) => void;
}

export function ChatPanel({
  sesion,
  busy,
  readOnly,
  filesCount = 0,
  onOpenFiles,
  onUpload,
  onSesionUpdate,
  onError,
  onBusy,
}: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sesion?.historial, busy]);

  async function sendText(texto: string) {
    if (!sesion || !texto.trim() || busy || readOnly) return;
    onBusy(true);
    try {
      const res = await enviarMensaje(sesion.id, texto.trim());
      setDraft("");
      onSesionUpdate(res.sesion);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/sesión no encontrada/i.test(msg)) {
        onError(
          "La sesión se perdió en el servidor (suele pasar si uvicorn recargó). Crea una sesión Nueva o selecciónala de nuevo en la lista."
        );
      } else {
        onError(msg);
      }
    } finally {
      onBusy(false);
    }
  }

  const showModalidadPicker =
    !readOnly &&
    sesion?.estado === "CONFIGURANDO" &&
    Boolean(sesion?.nomenclatura) &&
    !sesion?.modalidad;

  const showTipoPicker =
    !readOnly &&
    sesion?.estado === "CONFIGURANDO" &&
    Boolean(sesion?.nomenclatura) &&
    Boolean(sesion?.modalidad) &&
    !sesion?.tipo_contratacion;

  const rubricaReciente = useMemo(() => {
    if (!sesion || readOnly) return null;
    const docs = sesion.documentos_analizados.filter(
      (d) => d.tipo_coincide !== false && d.preguntas_seguimiento.length > 0
    );
    return docs.length ? docs[docs.length - 1] : null;
  }, [sesion, readOnly]);

  if (!sesion) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-slate-bg/30 px-10 text-center">
        <p className="text-2xl font-semibold text-heading-dark">Centro de auditoría</p>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Selecciona una sesión del listado para comenzar el chat de compliance.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
      {/* Barra fija: siempre visible, fuera del scroll */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border-light bg-white px-5 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <p className="mr-1 truncate text-sm font-semibold text-heading-dark">
            {sesion.nomenclatura || `Sesión ${sesion.id.slice(0, 8)}…`}
          </p>
          <Badge variant="secondary">{sesion.estado}</Badge>
          {sesion.modalidad && (
            <Badge variant="outline" className="border-border-light">
              {MODALIDAD_LABELS[sesion.modalidad]}
            </Badge>
          )}
          {sesion.tipo_contratacion && (
            <Badge variant="outline" className="border-border-light">
              {sesion.tipo_contratacion}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-2 bg-navy text-white hover:bg-navy-hover"
          onClick={onOpenFiles}
          disabled={!onOpenFiles}
        >
          <FolderOpen className="size-4" />
          Archivos
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-semibold">
            {filesCount}
          </span>
        </Button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-6 md:px-10">
          {sesion.historial.length === 0 && (
            <div className="mx-auto mt-6 max-w-lg rounded-xl border border-border-light bg-slate-bg px-8 py-10 text-center">
              <p className="text-xl font-semibold text-heading-dark">Bienvenida</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Bienvenido al Módulo de Compliance de Contrataciones Públicas. Soy el Coordinador de
                Compliance y estoy aquí para guiarte en el proceso de auditoría. Escribe un saludo
                (por ejemplo <em>hola</em>) para comenzar; te pediré la nomenclatura, la modalidad y
                el tipo de contratación.
              </p>
              {onOpenFiles && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 border-border-light gap-2"
                  onClick={onOpenFiles}
                >
                  <FolderOpen className="size-4" />
                  Ver archivos de la sesión
                </Button>
              )}
            </div>
          )}
          {sesion.historial.map((mensaje, idx) => (
            <MessageBubble key={`m-${idx}-${mensaje.timestamp}`} mensaje={mensaje} />
          ))}
          {showModalidadPicker && !busy && (
            <OptionPicker
              title="Elige la modalidad de selección"
              disabled={busy}
              options={MODALIDADES.map((m) => ({
                value: m,
                label: MODALIDAD_LABELS[m],
                hint: MODALIDAD_HINTS[m],
              }))}
              onSelect={(value) => void sendText(value)}
            />
          )}
          {showTipoPicker && !busy && (
            <OptionPicker
              title="Elige el tipo de contratación"
              disabled={busy}
              options={TIPOS_CONTRATACION.map((t) => ({
                value: t,
                label: TIPO_CONTRATACION_LABELS[t],
              }))}
              onSelect={(value) => void sendText(value)}
            />
          )}
          {rubricaReciente && !busy && <QuestionnaireCard documento={rubricaReciente} />}
          {busy && (
            <div className="flex items-center gap-2 self-start text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Pensando con el modelo…
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border-light bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-3">
          {sesion && onUpload && (
            <AttachDocumentsControl
              sesion={sesion}
              busy={busy}
              readOnly={readOnly}
              onUpload={onUpload}
            />
          )}
          {!readOnly ? (
            <>
              <Textarea
                rows={2}
                placeholder={
                  sesion.historial.length === 0
                    ? "Escribe hola para comenzar…"
                    : "Escribe un mensaje al asistente de compliance…"
                }
                value={draft}
                disabled={busy}
                className="min-h-[72px] resize-none"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendText(draft);
                  }
                }}
              />
              <Button
                className="h-12 w-12 shrink-0 self-end bg-navy hover:bg-navy-hover text-white"
                disabled={busy || !draft.trim()}
                onClick={() => void sendText(draft)}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </>
          ) : (
            <p className="flex-1 py-3 text-sm text-muted-foreground">
              Modo solo lectura. Usa el botón Archivos para consultar documentos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
