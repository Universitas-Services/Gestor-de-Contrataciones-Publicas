"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { cambiarContrasena } from "@/services/authService";
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/schemas/changePasswordSchema";

// --- Componente ---

export function ChangePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setIsLoading(true);

    try {
      await cambiarContrasena({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success("Contraseña actualizada correctamente");
      router.push("/admin_ente/completar-ente");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al cambiar la contraseña";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0">
      <CardHeader className="text-center pt-6 sm:pt-8 pb-4">
        <CardTitle className="text-[22px] font-bold text-blue-accent tracking-tight font-inter">
          Nueva contraseña
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 font-inter">
          Tu nueva contraseña debe ser segura
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Contraseña Actual */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-[slate-700]">
                    Ingresa tu contraseña anterior
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo de caracteres"
                      className="h-11 bg-slate-50/50 border-slate-200 text-sm placeholder:text-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Nueva Contraseña */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-[slate-700]">
                    Nueva contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo de caracteres"
                      className="h-11 bg-slate-50/50 border-slate-200 text-sm placeholder:text-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Confirmar Contraseña */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-semibold text-[slate-700]">
                    Confirmar nueva contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirma tu nueva contraseña"
                      className="h-11 bg-slate-50/50 border-slate-200 text-sm placeholder:text-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Botón Submit */}
            <Button
              type="submit"
              className="w-full h-10 bg-color-boton-2 hover:bg-heading-secondary text-white font-medium rounded-md mt-4 transition-colors shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? "Actualizando..." : "Actualizar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
