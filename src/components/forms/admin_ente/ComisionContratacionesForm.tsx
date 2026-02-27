"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  comisionContratacionesSchema,
  miembroSchema,
  TIPO_MIEMBRO_OPTIONS,
  AREA_REPRESENTACION_OPTIONS,
  type ComisionContratacionesFormValues,
  type MiembroFormValues,
} from "@/lib/schemas/comisionContratacionesSchema";
import { registrarComisionContrataciones } from "@/services/comisionContratacionesService";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Trash2, UserPlus } from "lucide-react";

export function ComisionContratacionesForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [miembros, setMiembros] = useState<MiembroFormValues[]>([]);

  // Estado local para los campos del Sheet (nuevo miembro)
  const [nuevoMiembro, setNuevoMiembro] = useState<MiembroFormValues>({
    nombreCompletoMiembro: "",
    cedulaMiembro: "",
    tipoMiembro: "" as MiembroFormValues["tipoMiembro"],
    areaRepresentacion: "" as MiembroFormValues["areaRepresentacion"],
  });
  const [miembroErrors, setMiembroErrors] = useState<
    Partial<Record<keyof MiembroFormValues, string>>
  >({});

  const form = useForm<ComisionContratacionesFormValues>({
    resolver: zodResolver(comisionContratacionesSchema),
    defaultValues: {
      denominacionComision: "",
      datosDesignacionComision: "",
      comisionCertificada: false,
      miembros: [],
    },
    mode: "onChange",
  });

  // ── Manejo de miembros ──

  const handleAgregarMiembro = () => {
    // Validar con el miembroSchema
    const result = miembroSchema.safeParse(nuevoMiembro);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof MiembroFormValues, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof MiembroFormValues;
        fieldErrors[field] = issue.message;
      });
      setMiembroErrors(fieldErrors);
      return;
    }

    // Agregar al array y sincronizar con el form
    const updatedMiembros = [...miembros, result.data];
    setMiembros(updatedMiembros);
    form.setValue("miembros", updatedMiembros, { shouldValidate: true });

    // Limpiar y cerrar
    setNuevoMiembro({
      nombreCompletoMiembro: "",
      cedulaMiembro: "",
      tipoMiembro: "" as MiembroFormValues["tipoMiembro"],
      areaRepresentacion: "" as MiembroFormValues["areaRepresentacion"],
    });
    setMiembroErrors({});
    setSheetOpen(false);
  };

  const handleEliminarMiembro = (index: number) => {
    const updatedMiembros = miembros.filter((_, i) => i !== index);
    setMiembros(updatedMiembros);
    form.setValue("miembros", updatedMiembros, { shouldValidate: true });
  };

  // ── Submit ──

  const onSubmit = async (values: ComisionContratacionesFormValues) => {
    setIsLoading(true);
    try {
      await registrarComisionContrataciones(values);
      toast.success("Comisión creada exitosamente.");
      form.reset();
      setMiembros([]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al registrar la Comisión de Contrataciones";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Denominación de la Comisión ── */}
        <FormField
          control={form.control}
          name="denominacionComision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Denominación de la Comisión</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Comisión Permanente de Contrataciones" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Datos de Designación ── */}
        <FormField
          control={form.control}
          name="datosDesignacionComision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datos de Designación de la Comisión</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Resolución Nro. 005" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Comisión Certificada (Sí / No) ── */}
        <FormField
          control={form.control}
          name="comisionCertificada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comisión Certificada</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === true ? "default" : "outline"}
                    className="min-w-[80px]"
                    onClick={() => field.onChange(true)}
                  >
                    Sí
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === false ? "default" : "outline"}
                    className="min-w-[80px]"
                    onClick={() => field.onChange(false)}
                  >
                    No
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Sección de Miembros ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">Miembros de la Comisión</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSheetOpen(true)}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Agregar Miembro
            </Button>
          </div>

          {/* Tabla de miembros */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Área de Representación</TableHead>
                  <TableHead className="w-[60px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {miembros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No se han agregado miembros aún.
                    </TableCell>
                  </TableRow>
                ) : (
                  miembros.map((miembro, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{miembro.nombreCompletoMiembro}</TableCell>
                      <TableCell>{miembro.cedulaMiembro}</TableCell>
                      <TableCell>{miembro.tipoMiembro}</TableCell>
                      <TableCell>{miembro.areaRepresentacion}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleEliminarMiembro(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mensaje de error si no hay miembros */}
          {form.formState.errors.miembros && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.miembros.message}
            </p>
          )}
        </div>

        {/* ── Botón de Submit ── */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!form.formState.isValid || isLoading}
            className="min-w-[220px]"
          >
            {isLoading ? "Creando..." : "Crear Comisión"}
          </Button>
        </div>
      </form>

      {/* ── Sheet para agregar miembro ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Agregar Miembro</SheetTitle>
            <SheetDescription>Ingrese los datos del miembro de la comisión.</SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 py-2">
            {/* Nombre Completo */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Nombre Completo del Miembro
              </label>
              <Input
                placeholder="Ej. Carlos Sánchez"
                value={nuevoMiembro.nombreCompletoMiembro}
                onChange={(e) =>
                  setNuevoMiembro({
                    ...nuevoMiembro,
                    nombreCompletoMiembro: e.target.value,
                  })
                }
              />
              {miembroErrors.nombreCompletoMiembro && (
                <p className="text-sm text-destructive">{miembroErrors.nombreCompletoMiembro}</p>
              )}
            </div>

            {/* Cédula */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Cédula del Miembro</label>
              <Input
                placeholder="Ej. V-98765432"
                value={nuevoMiembro.cedulaMiembro}
                onChange={(e) =>
                  setNuevoMiembro({
                    ...nuevoMiembro,
                    cedulaMiembro: e.target.value,
                  })
                }
              />
              {miembroErrors.cedulaMiembro && (
                <p className="text-sm text-destructive">{miembroErrors.cedulaMiembro}</p>
              )}
            </div>

            {/* Tipo de Miembro */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Tipo de Miembro</label>
              <Select
                value={nuevoMiembro.tipoMiembro || undefined}
                onValueChange={(value) =>
                  setNuevoMiembro({
                    ...nuevoMiembro,
                    tipoMiembro: value as MiembroFormValues["tipoMiembro"],
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_MIEMBRO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {miembroErrors.tipoMiembro && (
                <p className="text-sm text-destructive">{miembroErrors.tipoMiembro}</p>
              )}
            </div>

            {/* Área de Representación */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Área de Representación</label>
              <Select
                value={nuevoMiembro.areaRepresentacion || undefined}
                onValueChange={(value) =>
                  setNuevoMiembro({
                    ...nuevoMiembro,
                    areaRepresentacion: value as MiembroFormValues["areaRepresentacion"],
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un área" />
                </SelectTrigger>
                <SelectContent>
                  {AREA_REPRESENTACION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {miembroErrors.areaRepresentacion && (
                <p className="text-sm text-destructive">{miembroErrors.areaRepresentacion}</p>
              )}
            </div>
          </div>

          <SheetFooter>
            <Button type="button" onClick={handleAgregarMiembro}>
              Agregar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Form>
  );
}
