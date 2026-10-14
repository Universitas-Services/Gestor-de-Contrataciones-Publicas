"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SlotChecklist, TipoDocumento } from "@/types/compliance.types";
import { TIPO_DOCUMENTO_LABELS } from "@/types/compliance.types";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  slots: SlotChecklist[];
  disabled?: boolean;
  uploading?: boolean;
  onUpload: (tipo: TipoDocumento, file: File) => void;
}

export function DocumentUpload({ slots, disabled, uploading, onUpload }: Props) {
  const [tipo, setTipo] = useState<TipoDocumento | "">("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Cargar documento (cualquier slot)</p>
      <div className="flex flex-col gap-2">
        <Select
          value={tipo || undefined}
          onValueChange={(v) => setTipo(v as TipoDocumento)}
          disabled={disabled || uploading}
        >
          <SelectTrigger className="w-full border-border-light">
            <SelectValue placeholder="Tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            {slots.map((s) => (
              <SelectItem key={s.tipo_documento} value={s.tipo_documento}>
                {s.auditado ? "✓ " : ""}
                {s.descripcion || TIPO_DOCUMENTO_LABELS[s.tipo_documento] || s.tipo_documento}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && tipo) {
              onUpload(tipo, file);
              e.target.value = "";
            }
          }}
        />
        <Button
          disabled={disabled || uploading || !tipo}
          className="w-full bg-navy hover:bg-navy-hover text-white"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Analizar
        </Button>
      </div>
    </div>
  );
}
