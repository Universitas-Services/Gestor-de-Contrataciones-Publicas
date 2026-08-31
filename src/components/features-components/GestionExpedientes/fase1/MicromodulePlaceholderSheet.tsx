"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MicromoduleConfig } from "./types/fase1Inicial.types";

const placeholderSchema = z.object({
  notas: z.string().min(1, "Ingrese al menos una nota o descripción provisional."),
});

type PlaceholderFormValues = z.infer<typeof placeholderSchema>;

export interface MicromodulePlaceholderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: MicromoduleConfig | null;
  readOnly?: boolean;
  isCompleted?: boolean;
  onSave: () => void;
}

const inputClass =
  "min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-none placeholder:text-sm placeholder:italic placeholder:text-slate-400 focus:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function MicromodulePlaceholderSheet({
  open,
  onOpenChange,
  config,
  readOnly = false,
  isCompleted = false,
  onSave,
}: MicromodulePlaceholderSheetProps) {
  const form = useForm<PlaceholderFormValues>({
    resolver: zodResolver(placeholderSchema) as unknown as Resolver<PlaceholderFormValues>,
    defaultValues: { notas: "" },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset({ notas: isCompleted ? "Información registrada (placeholder)." : "" });
  }, [open, isCompleted, reset]);

  const onSubmit = () => {
    onSave();
    onOpenChange(false);
  };

  if (!config) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-slate-200 p-0 sm:max-w-lg"
      >
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 bg-navy px-5 py-4 text-left">
          <SheetTitle className="font-inter text-base font-bold text-white">
            {config.title}
          </SheetTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-white/90 transition-opacity hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col overflow-y-auto px-5 py-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <p className="mb-4 text-sm text-slate-500">{config.description}</p>
          <p className="mb-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Formulario provisional. Los campos definitivos se integrarán en una próxima iteración.
          </p>

          <label className="mb-1.5 text-[13px] font-bold text-slate-700">
            Notas / descripción provisional
          </label>
          <textarea
            className={inputClass}
            placeholder="Describa brevemente la información a registrar..."
            disabled={readOnly}
            {...register("notas")}
          />
          {errors.notas?.message ? (
            <p className="mt-1 text-[11px] font-medium text-destructive">{errors.notas.message}</p>
          ) : null}

          <SheetFooter className="mt-auto gap-2 border-t border-slate-100 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="border-slate-300 bg-white font-inter text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={readOnly || isSubmitting}
              className="bg-navy font-inter text-white hover:bg-navy-hover"
            >
              Guardar
              <Check className="ml-1.5 h-4 w-4" />
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
