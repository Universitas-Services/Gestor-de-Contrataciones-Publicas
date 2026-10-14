"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  bibliotecaClausulaFormSchema,
  type BibliotecaClausulaFormValues,
} from "@/lib/schemas/bibliotecaClausulaSchema";
import {
  listarBibliotecaTokens,
  previewBibliotecaTokens,
  validarBibliotecaTokens,
} from "@/services/bibliotecaTokensService";
import type {
  BibliotecaToken,
  PreviewTokensModo,
  PreviewTokensResponse,
} from "@/types/bibliotecaLegal.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClausulaBibliotecaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "crear" | "editar";
  initialTitulo?: string;
  initialCuerpo?: string;
  saving?: boolean;
  onSubmit: (values: BibliotecaClausulaFormValues) => Promise<void> | void;
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Si el cuerpo no parece HTML, lo envuelve en <p> para alinear con el API. */
function ensureHtmlCuerpo(cuerpo: string): string {
  const trimmed = cuerpo.trim();
  if (!trimmed) return "<p></p>";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  const escaped = trimmed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<p>${escaped.replace(/\n/g, "<br/>")}</p>`;
}

export function ClausulaBibliotecaDialog({
  open,
  onOpenChange,
  mode,
  initialTitulo = "",
  initialCuerpo = "",
  saving = false,
  onSubmit,
}: ClausulaBibliotecaDialogProps) {
  const cuerpoRef = useRef<HTMLTextAreaElement | null>(null);
  const [tokens, setTokens] = useState<BibliotecaToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [tokenErrors, setTokenErrors] = useState<string[]>([]);
  const [previewModo, setPreviewModo] = useState<Exclude<PreviewTokensModo, "VALOR">>("ETIQUETA");
  const [preview, setPreview] = useState<PreviewTokensResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const form = useForm<BibliotecaClausulaFormValues>({
    resolver: zodResolver(bibliotecaClausulaFormSchema),
    defaultValues: {
      titulo: initialTitulo,
      cuerpo: stripHtmlToText(initialCuerpo) || initialCuerpo,
    },
  });

  const { ref: registerCuerpoRef, ...cuerpoRegister } = form.register("cuerpo");

  useEffect(() => {
    if (!open) return;
    form.reset({
      titulo: initialTitulo,
      cuerpo: stripHtmlToText(initialCuerpo) || initialCuerpo,
    });
    setTokenErrors([]);
    setPreview(null);
  }, [open, initialTitulo, initialCuerpo, form]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingTokens(true);
    void (async () => {
      try {
        const res = await listarBibliotecaTokens();
        if (!cancelled) setTokens(res.data ?? []);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "No se pudo cargar el catálogo de tokens"
          );
        }
      } finally {
        if (!cancelled) setLoadingTokens(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const cuerpoValue = form.watch("cuerpo");

  const tokensDisponibles = useMemo(
    () =>
      [...tokens].sort((a, b) =>
        a.etiqueta.localeCompare(b.etiqueta, "es", { sensitivity: "base" })
      ),
    [tokens]
  );

  const insertToken = (insertar: string) => {
    const el = cuerpoRef.current;
    const current = form.getValues("cuerpo") ?? "";
    if (!el) {
      form.setValue("cuerpo", `${current}${insertar}`, { shouldValidate: true, shouldDirty: true });
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${insertar}${current.slice(end)}`;
    form.setValue("cuerpo", next, { shouldValidate: true, shouldDirty: true });
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + insertar.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const handlePreview = async () => {
    const texto = form.getValues("cuerpo")?.trim();
    if (!texto) {
      toast.error("Escriba el cuerpo de la cláusula para previsualizar.");
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await previewBibliotecaTokens({ texto, modo: previewModo });
      setPreview(res);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al previsualizar");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setTokenErrors([]);
    try {
      const validation = await validarBibliotecaTokens({ texto: values.cuerpo });
      if (!validation.valido) {
        setTokenErrors(validation.errores?.length ? validation.errores : ["Hay tokens inválidos."]);
        toast.error("Corrija los datos entre corchetes antes de guardar.");
        return;
      }
      await onSubmit({
        titulo: values.titulo,
        cuerpo: ensureHtmlCuerpo(values.cuerpo),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al validar o guardar");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>{mode === "crear" ? "Agregar cláusula" : "Editar cláusula"}</DialogTitle>
          <DialogDescription>
            Use datos entre corchetes del catálogo, por ejemplo{" "}
            <code className="text-xs">[OBJETO DEL CONTRATO]</code>.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden pt-2"
        >
          <ScrollArea className="max-h-[min(60vh,560px)] pr-3">
            <div className="space-y-4 pb-2">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" disabled={saving} {...form.register("titulo")} />
                {form.formState.errors.titulo ? (
                  <p className="text-sm text-destructive">{form.formState.errors.titulo.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Datos insertables</Label>
                {loadingTokens ? (
                  <p className="text-xs text-muted-foreground">Cargando catálogo…</p>
                ) : tokensDisponibles.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No hay tokens disponibles.</p>
                ) : (
                  <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-border bg-muted/20 p-2">
                    {tokensDisponibles.map((t) => (
                      <button
                        key={t.etiqueta}
                        type="button"
                        disabled={saving}
                        title={t.descripcion}
                        onClick={() => insertToken(t.insertar)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                        {t.etiqueta}
                        <Badge variant="outline" className="ml-0.5 h-4 px-1 text-[9px] font-normal">
                          {t.disponibleDesde === "ADJUDICACION" ? "F4" : "F1"}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuerpo">Cuerpo</Label>
                <Textarea
                  id="cuerpo"
                  rows={10}
                  disabled={saving}
                  className="min-h-[180px] resize-y font-mono text-sm"
                  {...cuerpoRegister}
                  ref={(el) => {
                    registerCuerpoRef(el);
                    cuerpoRef.current = el;
                  }}
                />
                {form.formState.errors.cuerpo ? (
                  <p className="text-sm text-destructive">{form.formState.errors.cuerpo.message}</p>
                ) : null}
                {tokenErrors.length > 0 ? (
                  <ul className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {tokenErrors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Modo de preview</Label>
                    <Select
                      value={previewModo}
                      onValueChange={(v) => setPreviewModo(v as "ETIQUETA" | "LINEA")}
                    >
                      <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETIQUETA">ETIQUETA</SelectItem>
                        <SelectItem value="LINEA">LINEA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={previewLoading || !cuerpoValue?.trim()}
                    onClick={() => void handlePreview()}
                  >
                    <Eye className="h-4 w-4" />
                    {previewLoading ? "Previsualizando…" : "Previsualizar"}
                  </Button>
                </div>
                {preview ? (
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Resultado ({preview.modo})
                    </p>
                    <p className="rounded-md border border-border bg-background p-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {preview.texto}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : mode === "crear" ? "Agregar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
