"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";

import type { ClausulaBase, ClausulaEnModelo } from "@/lib/constants/modeloContrato";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "./RichTextEditor";

export type ClausulaEditorMode = "edit" | "create" | "review";

export interface ClausulaEditorSavePayload {
  titulo: string;
  cuerpoHtml: string;
  saveToBiblioteca: boolean;
}

interface ClausulaEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ClausulaEditorMode;
  clause: ClausulaBase | ClausulaEnModelo | null;
  readOnly?: boolean;
  onSave: (payload: ClausulaEditorSavePayload) => void;
}

export function ClausulaEditorDialog({
  open,
  onOpenChange,
  mode,
  clause,
  readOnly = false,
  onSave,
}: ClausulaEditorDialogProps) {
  const [titulo, setTitulo] = useState("");
  const [cuerpoHtml, setCuerpoHtml] = useState("");
  const [saveToBiblioteca, setSaveToBiblioteca] = useState(false);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setTitulo(clause?.titulo ?? "");
      setCuerpoHtml(clause?.cuerpoHtml ?? "<p></p>");
      setSaveToBiblioteca(false);
    });
  }, [clause, open]);

  const variables = clause?.variablesSugeridas ?? [];
  const isAddFlow = mode === "create" || mode === "review";
  const titleLabel =
    mode === "create"
      ? "Crear cláusula personalizada"
      : mode === "review"
        ? "Revisar y agregar cláusula"
        : "Editar cláusula";
  const saveLabel = isAddFlow ? "Agregar al Contrato" : "Guardar cláusula";
  const editorKey =
    ("instanceId" in (clause ?? {}) && (clause as ClausulaEnModelo).instanceId) ||
    clause?.id ||
    mode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden border-0 bg-card p-0 shadow-xl sm:max-w-3xl"
      >
        <DialogHeader className="shrink-0 space-y-1 bg-navy px-5 py-4 text-left">
          <DialogTitle className="text-base font-bold text-white">{titleLabel}</DialogTitle>
          {clause?.basamentoLegal ? (
            <p className="text-[11px] italic text-white/80">{clause.basamentoLegal}</p>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-color-titulos">Título de la cláusula</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={readOnly}
              className="font-semibold uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-end justify-between gap-2">
              <Label className="text-sm font-bold text-color-titulos">Redacción</Label>
              {variables.length > 0 ? (
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-navy">
                  Variables dinámicas activas
                </span>
              ) : null}
            </div>
            {variables.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {variables.map((variable) => (
                  <code
                    key={variable}
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-navy"
                  >
                    {`{${variable}}`}
                  </code>
                ))}
              </div>
            ) : null}
            <RichTextEditor
              key={editorKey}
              value={cuerpoHtml}
              onChange={setCuerpoHtml}
              disabled={readOnly}
            />
          </div>

          {!readOnly ? (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Checkbox
                id="save-biblioteca"
                checked={saveToBiblioteca}
                onCheckedChange={(checked) => setSaveToBiblioteca(checked === true)}
              />
              <Label htmlFor="save-biblioteca" className="cursor-pointer text-sm leading-snug">
                Guardar esta versión en la Biblioteca del Ente para futuros contratos.
              </Label>
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancelar
          </Button>
          {!readOnly ? (
            <Button
              type="button"
              disabled={!titulo.trim()}
              onClick={() =>
                onSave({
                  titulo: titulo.trim(),
                  cuerpoHtml,
                  saveToBiblioteca,
                })
              }
              className="bg-navy text-white hover:bg-navy-hover"
            >
              {isAddFlow ? (
                <Plus className="mr-1.5 h-4 w-4" />
              ) : (
                <Check className="mr-1.5 h-4 w-4" />
              )}
              {saveLabel}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
