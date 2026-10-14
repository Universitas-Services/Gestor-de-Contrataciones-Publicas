"use client";

import type { MensajeChat, Modalidad } from "@/types/compliance.types";
import {
  MODALIDAD_LABELS,
  MODALIDADES,
  TIPOS_CONTRATACION,
  TIPO_CONTRATACION_LABELS,
  sanitizeAssistantText,
  type TipoContratacion,
} from "@/types/compliance.types";
import { cn } from "@/lib/utils";

interface Props {
  mensaje: MensajeChat;
}

function displayContent(rol: MensajeChat["rol"], raw: string): string {
  if (rol === "assistant") return sanitizeAssistantText(raw);
  const trimmed = raw.trim();
  if ((MODALIDADES as string[]).includes(trimmed)) {
    return MODALIDAD_LABELS[trimmed as Modalidad];
  }
  if ((TIPOS_CONTRATACION as string[]).includes(trimmed)) {
    return TIPO_CONTRATACION_LABELS[trimmed as TipoContratacion];
  }
  return raw;
}

export function MessageBubble({ mensaje }: Props) {
  const isUser = mensaje.rol === "user";
  const isSystem = mensaje.rol === "system";
  const contenido = displayContent(mensaje.rol, mensaje.contenido);

  if (isSystem) {
    return (
      <div className="self-center px-2 py-1 text-center text-xs text-muted-foreground">
        {contenido}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-[85%] rounded-xl border px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap",
        isUser
          ? "self-end border-navy/20 bg-navy/5 text-heading-dark"
          : "self-start border-border-light bg-slate-bg text-heading-dark"
      )}
    >
      <span className="mb-1.5 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {isUser ? "Tú" : "Asistente"}
      </span>
      {contenido}
    </div>
  );
}
