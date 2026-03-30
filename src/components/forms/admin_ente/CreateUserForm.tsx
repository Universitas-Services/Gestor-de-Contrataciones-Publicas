"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { userSchema, type UserFormValues } from "@/lib/schemas/userSchema";
import { crearUsuarioEnte } from "@/services/enteService";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserFormProps {
  enteId: string;
}

export function CreateUserForm({ enteId }: CreateUserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      rol: undefined,
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Creando usuario...");

    try {
      await crearUsuarioEnte(enteId, {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        password: values.password,
        rol: values.rol,
      });

      toast.success("Usuario creado exitosamente", { id: toastId });
      router.push("/admin_ente/gestion-datos/usuarios");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear el usuario";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-slate-200">
      <CardHeader className="pl-10 pt-5 pb-6 border-b border-slate-100">
        <CardTitle className="text-3xl font-bold text-color-titulos">Crear nuevo usuario</CardTitle>
        <CardDescription className="text-sm text-slate-500 font-medium italic leading-relaxed">
          Registre los datos del nuevo usuario, genere sus credenciales de acceso y asigne el rol
          que desempeñará dentro de la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pl-15">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-color-titulos font-bold text-base mb-0">
                      Nombre del usuario
                    </FormLabel>
                    <p className="text-sm text-slate-400 italic">Ejemplo: Pedro José</p>
                    <FormControl>
                      <Input
                        {...field}
                        className="max-w-xl border-slate-200 focus:border-slate-400 focus:ring-0"
                        disabled={isSubmitting}
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
                    <FormLabel className="text-color-titulos font-bold text-base mb-0">
                      Apellido del usuario
                    </FormLabel>
                    <p className="text-sm text-slate-400 italic">Ejemplo: Rodríguez Hernández</p>
                    <FormControl>
                      <Input
                        {...field}
                        className="max-w-xl border-slate-200 focus:border-slate-400 focus:ring-0"
                        disabled={isSubmitting}
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
                    <FormLabel className="text-color-titulos font-bold text-base mb-0">
                      Correo electrónico
                    </FormLabel>
                    <p className="text-sm text-slate-400 italic">Ejemplo: ejemplo@dominio.com</p>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="max-w-xl border-slate-200 focus:border-slate-400 focus:ring-0"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contraseña */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-color-titulos font-bold text-base mb-0">
                      Contraseña temporal
                    </FormLabel>
                    <p className="text-sm text-slate-400 italic">
                      Validación: Mínimo 8 caracteres, debe incluir una mayúscula y un carácter
                      especial <br />
                      Ejemplo: A123456*
                    </p>
                    <FormControl>
                      <div className="relative max-w-xl">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="w-full border-slate-200 focus:border-slate-400 focus:ring-0 pr-10"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
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
                    <FormLabel className="text-color-titulos font-bold text-base">
                      Asignar Rol en la plataforma
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="border-slate-200 focus:border-slate-400 focus:ring-0 min-w-32 cursor-pointer">
                          <SelectValue placeholder="Asignar Rol" />
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
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-color-boton-2 hover:bg-color-boton-2-hover px-12 h-11 text-base rounded-md cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
