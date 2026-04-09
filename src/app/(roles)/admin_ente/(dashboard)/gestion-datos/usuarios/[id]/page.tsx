"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Loader2, Save, X, SquarePen } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { obtenerUsuarioOperativo, actualizarUsuarioOperativo } from "@/services/enteService";
import { userSchema } from "@/lib/schemas/userSchema";
import type { User } from "@/types/user-management.types";

// Esquema para actualización (omitiendo la contraseña)
const updateSchema = userSchema.omit({ password: true });
type UpdateFormValues = z.infer<typeof updateSchema>;

export default function DetalleUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      rol: undefined,
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await obtenerUsuarioOperativo(id);
        setUserData(data);
        form.reset({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          rol: data.rol as "EJECUTOR" | "VISUALIZADOR",
        });
      } catch (error) {
        toast.error("Error al cargar los datos del usuario");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, form]);

  const onSubmit = async (values: UpdateFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Actualizando usuario...");

    try {
      const updatedUser = await actualizarUsuarioOperativo(id, values);
      setUserData(updatedUser);
      setIsEditing(false);
      toast.success("Usuario actualizado correctamente", { id: toastId });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error al actualizar el usuario", { id: toastId });
      } else {
        toast.error("Error al actualizar el usuario", { id: toastId });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-5xl mx-auto">
      {/* Botón Volver (fuera de la card para limpieza visual) */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          asChild
          className="p-0 h-auto hover:bg-transparent text-slate-500 hover:text-slate-800"
        >
          <Link href="/admin_ente/gestion-datos/usuarios" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Volver al panel
          </Link>
        </Button>
      </div>

      {/* Card Principal Unificada */}
      <Card className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-8 pt-6 pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-color-titulos tracking-tight">
                Gestión de usuarios
              </h1>
              <p className="text-sm text-color-subtitulos font-medium italic">
                Administra los datos y el rol asignado a{" "}
                <span className="text-color-titulos font-bold not-italic">
                  {userData?.nombre} {userData?.apellido}
                </span>
              </p>
            </div>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-color-boton-1 hover:bg-color-boton-hover cursor-pointer rounded-lg px-6"
              >
                Editar usuario
                <SquarePen className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                  className="rounded-lg border-slate-200"
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  className="bg-green-600 hover:bg-green-700 rounded-lg px-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar cambios
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <hr className="mx-8 border-slate-100" />

        <CardContent className="p-8 pt-6 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-color-titulos">Información del perfil</h2>
            <p className="text-sm text-color-subtitulos italic">
              Visualiza y actualiza la información básica del usuario en la plataforma.
            </p>
          </div>

          <Form {...form}>
            <form className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700 font-bold text-sm">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing || isSubmitting}
                        className={`h-10 border-slate-200 focus:border-slate-400 focus:ring-0 ${
                          !isEditing ? "bg-slate-50 text-slate-600 cursor-not-allowed" : "bg-white"
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Apellido */}
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700 font-bold text-sm">Apellido</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing || isSubmitting}
                        className={`h-10 border-slate-200 focus:border-slate-400 focus:ring-0 ${
                          !isEditing ? "bg-slate-50 text-slate-600 cursor-not-allowed" : "bg-white"
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Correo */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700 font-bold text-sm">
                      Correo electrónico
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing || isSubmitting}
                        className={`h-10 border-slate-200 focus:border-slate-400 focus:ring-0 ${
                          !isEditing ? "bg-slate-50 text-slate-600 cursor-not-allowed" : "bg-white"
                        }`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rol */}
              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-700 font-bold text-sm">Rol asignado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!isEditing || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`h-10 border-slate-200 focus:border-slate-400 focus:ring-0 ${
                            !isEditing
                              ? "bg-slate-50 text-slate-600 cursor-not-allowed"
                              : "bg-white"
                          }`}
                        >
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EJECUTOR">Ejecutor</SelectItem>
                        <SelectItem value="VISUALIZADOR">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {/* Botón Eliminar cuenta - Integrado en la card */}
          <div className="flex justify-end pt-4">
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 rounded-lg px-8 h-10 font-bold shadow-sm"
              onClick={() => toast.info("Funcionalidad de eliminación en desarrollo")}
              disabled={isSubmitting}
            >
              Eliminar cuenta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
