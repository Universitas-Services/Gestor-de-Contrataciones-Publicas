"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  createLlamadoPublicoDefaultValues,
  getLlamadoPublicoFormStorageKey,
  LLAMADO_PUBLICO_DRAFT_LABEL,
  LLAMADO_PUBLICO_SUBMIT_DISABLED_TOOLTIP,
  LLAMADO_PUBLICO_SUBMIT_LABEL,
  LLAMADO_PUBLICO_SUCCESS_DESCRIPTION,
  LLAMADO_PUBLICO_SUCCESS_TITLE,
  LLAMADO_PUBLICO_WIZARD_SUBTITLE,
  LLAMADO_PUBLICO_WIZARD_TITLE,
  type LlamadoPublicoStoredForm,
} from "@/lib/constants/llamadoPublico";
import {
  llamadoPublicoFormSchema,
  type LlamadoPublicoFormInputValues,
} from "@/lib/schemas/llamadoPublicoSchema";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { useFase1InicialState } from "@/components/features-components/GestionExpedientes/fase1/hooks/useFase1InicialState";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LlamadoFormSections } from "./LlamadoFormSections";

export interface LlamadoPublicoFormProps {
  expedienteId: string;
  enteId?: string;
  direccionEnteDefault?: string;
  readOnly?: boolean;
  basePath?: string;
}

function loadStoredForm(
  expedienteId: string,
  defaults: LlamadoPublicoFormInputValues
): LlamadoPublicoStoredForm {
  if (typeof window === "undefined") {
    return { values: defaults, status: "draft" };
  }

  try {
    const raw = window.localStorage.getItem(getLlamadoPublicoFormStorageKey(expedienteId));
    if (!raw) return { values: defaults, status: "draft" };
    const parsed = JSON.parse(raw) as LlamadoPublicoStoredForm;
    if (!parsed?.values) return { values: defaults, status: "draft" };
    return {
      values: { ...defaults, ...parsed.values },
      status: parsed.status === "completed" ? "completed" : "draft",
    };
  } catch {
    return { values: defaults, status: "draft" };
  }
}

function persistForm(expedienteId: string, payload: LlamadoPublicoStoredForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getLlamadoPublicoFormStorageKey(expedienteId),
    JSON.stringify(payload)
  );
}

export function LlamadoPublicoForm({
  expedienteId,
  enteId,
  direccionEnteDefault = "",
  readOnly = false,
  basePath = "/gestion-expedientes",
}: LlamadoPublicoFormProps) {
  const router = useRouter();
  const { completeMicromodule, saveMicromoduleDraft } = useFase1InicialState(expedienteId);
  const defaultValues = useMemo(
    () => createLlamadoPublicoDefaultValues(direccionEnteDefault),
    [direccionEnteDefault]
  );

  const [hydrated, setHydrated] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LlamadoPublicoFormInputValues>({
    resolver: zodResolver(
      llamadoPublicoFormSchema
    ) as unknown as Resolver<LlamadoPublicoFormInputValues>,
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues,
  });

  useEffect(() => {
    const stored = loadStoredForm(expedienteId, defaultValues);
    form.reset(stored.values);
    setHydrated(true);
  }, [defaultValues, expedienteId, form]);

  const values = form.watch();
  const canSubmit = hydrated && !readOnly && llamadoPublicoFormSchema.safeParse(values).success;

  const goToPanel = () => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  };

  const handleSaveDraft = () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      persistForm(expedienteId, { values: form.getValues(), status: "draft" });
      saveMicromoduleDraft("llamado");
      toast.success("Borrador del llamado guardado.");
      goToPanel();
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigure = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      const isValid = await form.trigger(undefined, { shouldFocus: true });
      if (!isValid) return;

      persistForm(expedienteId, { values: form.getValues(), status: "completed" });
      completeMicromodule("llamado");
      setIsConfirmOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full py-6">
        <div className="mx-auto max-w-5xl">
          <Card className="gap-0 overflow-hidden border-border bg-card py-0 shadow-sm">
            <div className="flex items-start gap-3 border-b border-border px-5 py-5 md:px-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
                  {LLAMADO_PUBLICO_WIZARD_TITLE}
                </h1>
                <p className="text-[12px] italic leading-relaxed text-muted-foreground">
                  {LLAMADO_PUBLICO_WIZARD_SUBTITLE}
                </p>
              </div>
            </div>

            <CardContent className="p-0">
              <Form {...form}>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleConfigure();
                  }}
                >
                  <LlamadoFormSections form={form} enteId={enteId} readOnly={readOnly} />

                  <Separator />

                  <div className="flex flex-wrap items-center justify-between gap-3 bg-card px-5 py-4 md:px-8">
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
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSaving || isConfirmOpen}
                          onClick={handleSaveDraft}
                          className="border-border text-muted-foreground hover:bg-muted"
                        >
                          {LLAMADO_PUBLICO_DRAFT_LABEL}
                        </Button>

                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button
                                  type="submit"
                                  disabled={!canSubmit || isSaving || isConfirmOpen}
                                  className="bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
                                >
                                  {isSaving ? "Guardando..." : LLAMADO_PUBLICO_SUBMIT_LABEL}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {!canSubmit ? (
                              <TooltipContent
                                side="top"
                                className="max-w-[260px] text-center text-xs"
                              >
                                {LLAMADO_PUBLICO_SUBMIT_DISABLED_TOOLTIP}
                              </TooltipContent>
                            ) : null}
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </form>
              </Form>
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
          <AlertDialogTitle className="sr-only">{LLAMADO_PUBLICO_SUCCESS_TITLE}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {LLAMADO_PUBLICO_SUCCESS_DESCRIPTION}
          </AlertDialogDescription>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2} />
            </div>

            <h2 className="text-lg font-bold leading-tight text-color-titulos">
              {LLAMADO_PUBLICO_SUCCESS_TITLE}
            </h2>

            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              {LLAMADO_PUBLICO_SUCCESS_DESCRIPTION}
            </p>

            <Button
              type="button"
              onClick={() => {
                setIsConfirmOpen(false);
                goToPanel();
              }}
              className="mt-5 w-full bg-navy text-white hover:bg-navy-hover"
            >
              Volver al panel
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
