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
    <div className="bg-white p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md mx-auto relative border-0">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-8 left-8 text-slate-800 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="text-center mt-6 mb-8">
        <h2 className="text-[26px] font-bold text-[#005282] tracking-tight font-inter">
          Nueva contraseña
        </h2>
        <p className="text-sm text-slate-500 mt-2">Tu nueva contraseña debe ser segura</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Contraseña Actual */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-[#34495E]">
                  Ingresa tu contraseña anterior
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mínimo de caracteres"
                    className="h-11 bg-slate-50/50 border-slate-200 text-sm placeholder:text-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30"
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
                <FormLabel className="text-xs font-semibold text-[#34495E]">
                  Nueva contraseña
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mínimo de caracteres"
                    className="h-11 bg-slate-50/50 border-slate-200 text-sm placeholder:text-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30"
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
                <FormLabel className="text-xs font-semibold text-[#34495E]">
                  Confirmar nueva contraseña
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                    className="h-11 bg-slate-50/50 border-slate-200 text-sm placeholder:text-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30"
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
            className="w-full h-10 bg-[#1B456F] hover:bg-[#273646] text-white font-medium rounded-md mt-6 transition-colors shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
