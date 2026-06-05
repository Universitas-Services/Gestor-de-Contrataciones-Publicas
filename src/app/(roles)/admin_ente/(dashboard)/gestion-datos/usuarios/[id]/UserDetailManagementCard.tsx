"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader2, Save, SquarePen, Trash2, UserPen, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  changeUserPasswordSchema,
  type ChangeUserPasswordFormValues,
} from "@/lib/schemas/changeUserPasswordSchema";
import { userSchema } from "@/lib/schemas/userSchema";
import { cambiarContrasenaDeUsuario } from "@/services/authService";
import {
  actualizarUsuarioEnte,
  eliminarUsuarioEnte,
  obtenerMiEnteId,
  obtenerUsuarioOperativo,
} from "@/services/enteService";
import type { User } from "@/types/user-management.types";

const updateSchema = userSchema.omit({ password: true });

type UpdateFormValues = z.infer<typeof updateSchema>;
type UserManagementTab = "profile" | "password" | "danger";

const managementTabTriggerClassName =
  "!flex-none !h-11 !w-full cursor-pointer rounded-full border border-transparent bg-transparent px-5 text-sm font-semibold text-slate-400 shadow-none transition-all duration-200 ease-in-out after:hidden" +
  " hover:border-slate-200 hover:bg-white/70 hover:text-slate-700 hover:shadow-sm" +
  " data-[state=active]:border-color-boton-1/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-color-boton-1/10 data-[state=active]:to-color-boton-1/5 data-[state=active]:text-color-boton-1 data-[state=active]:shadow-[0_2px_12px_rgba(15,23,42,0.08)]";

interface UserDetailManagementCardProps {
  adminEmail: string;
  adminName?: string | null;
  userId: string;
}

function getProfileDefaults(user: User): UpdateFormValues {
  return {
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    rol: user.rol as "EJECUTOR" | "VISUALIZADOR",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function UserDetailManagementCard({
  adminEmail,
  adminName,
  userId,
}: UserDetailManagementCardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserManagementTab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const profileForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      rol: undefined,
    },
  });

  const passwordForm = useForm<ChangeUserPasswordFormValues>({
    resolver: zodResolver(changeUserPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    mode: "onChange",
  });

  const adminDisplayName = useMemo(() => {
    const normalizedName = adminName?.trim();
    return normalizedName ? normalizedName : adminEmail;
  }, [adminEmail, adminName]);

  const managedUserName = useMemo(() => {
    if (!userData) {
      return "este usuario";
    }

    return `${userData.nombre} ${userData.apellido}`.trim();
  }, [userData]);

  const fetchUser = useCallback(async () => {
    try {
      const data = await obtenerUsuarioOperativo(userId);
      setUserData(data);
      profileForm.reset(getProfileDefaults(data));
    } catch (error) {
      toast.error("Error al cargar los datos del usuario");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [profileForm, userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const onSubmitProfile = async (values: UpdateFormValues) => {
    setIsProfileSubmitting(true);
    const toastId = toast.loading("Actualizando usuario...");

    try {
      const enteId = await obtenerMiEnteId();
      if (!enteId) {
        throw new Error("No se pudo determinar el ID del Ente.");
      }

      await actualizarUsuarioEnte(enteId, userId, values);
      await fetchUser();
      setIsEditing(false);
      toast.success("Usuario actualizado correctamente", { id: toastId });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Error al actualizar el usuario"), { id: toastId });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const onSubmitPassword = async (values: ChangeUserPasswordFormValues) => {
    setIsPasswordSubmitting(true);
    const toastId = toast.loading("Actualizando contrasena del usuario...");

    try {
      await cambiarContrasenaDeUsuario({
        targetUserId: userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
      });

      toast.success("Contrasena del usuario actualizada correctamente", { id: toastId });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Error al cambiar la contrasena del usuario"), {
        id: toastId,
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Eliminando usuario...");

    try {
      const enteId = await obtenerMiEnteId();
      if (!enteId) {
        throw new Error("No se pudo determinar el ID del Ente.");
      }

      await eliminarUsuarioEnte(enteId, userId);
      toast.success("Usuario eliminado correctamente", { id: toastId });

      setTimeout(() => {
        router.push("/admin_ente/gestion-datos/usuarios");
      }, 1500);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Error al eliminar el usuario"), { id: toastId });
      setIsDeleting(false);
    }
  };

  const handleCancelEditing = () => {
    if (userData) {
      profileForm.reset(getProfileDefaults(userData));
    }

    setIsEditing(false);
  };

  const handleTabChange = (value: string) => {
    const nextTab = value as UserManagementTab;

    if (activeTab === "profile" && nextTab !== "profile" && isEditing) {
      handleCancelEditing();
    }

    setActiveTab(nextTab);
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full gap-0">
          <CardHeader className="p-8 pt-6 pb-5">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-color-titulos">
                Gestion de usuarios
              </h1>
              <p className="text-sm font-medium italic text-color-subtitulos">
                Administra los datos y el rol asignado a{" "}
                <span className="font-bold not-italic text-color-titulos">{managedUserName}</span>
              </p>
            </div>
          </CardHeader>

          <div className="border-y border-slate-100 px-8 py-5">
            <TabsList className="grid h-auto w-full grid-cols-1 items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 p-1.5 shadow-inner sm:min-h-14 sm:grid-cols-3">
              <TabsTrigger value="profile" className={managementTabTriggerClassName}>
                <UserPen className="h-4 w-4 shrink-0" />
                <span>Ver/Editar usuario</span>
              </TabsTrigger>
              <TabsTrigger value="password" className={managementTabTriggerClassName}>
                <KeyRound className="h-4 w-4 shrink-0" />
                <span>Cambiar contrasena</span>
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className={
                  managementTabTriggerClassName +
                  " hover:border-red-200 hover:bg-red-50/50 hover:text-red-500 data-[state=active]:border-red-200/60 data-[state=active]:from-red-50 data-[state=active]:to-red-50/30 data-[state=active]:text-red-600 data-[state=active]:shadow-[0_2px_12px_rgba(239,68,68,0.08)]"
                }
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span>Eliminar cuenta</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-8 pt-8">
            <TabsContent value="profile" className="mt-0">
              <div>
                <Card className="overflow-hidden rounded-[1.75rem] border-slate-200/80 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <CardContent className="space-y-8 p-8">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-color-titulos">
                        Informacion del perfil
                      </h2>
                      <p className="text-sm italic text-color-subtitulos">
                        Visualiza y actualiza la informacion basica del usuario en la plataforma.
                      </p>
                    </div>

                    <Form {...profileForm}>
                      <form className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="nombre"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-bold text-slate-700">
                                Nombre
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing || isProfileSubmitting}
                                  className={`h-11 border-slate-200 focus:border-color-boton-1 focus:ring-0 ${
                                    !isEditing
                                      ? "cursor-not-allowed bg-slate-100/50 text-slate-500"
                                      : "bg-white shadow-sm"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="apellido"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-bold text-slate-700">
                                Apellido
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing || isProfileSubmitting}
                                  className={`h-11 border-slate-200 focus:border-color-boton-1 focus:ring-0 ${
                                    !isEditing
                                      ? "cursor-not-allowed bg-slate-100/50 text-slate-500"
                                      : "bg-white shadow-sm"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-bold text-slate-700">
                                Correo electronico
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing || isProfileSubmitting}
                                  className={`h-11 border-slate-200 focus:border-color-boton-1 focus:ring-0 ${
                                    !isEditing
                                      ? "cursor-not-allowed bg-slate-100/50 text-slate-500"
                                      : "bg-white shadow-sm"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="rol"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-bold text-slate-700">
                                Rol asignado
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                disabled={!isEditing || isProfileSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={`h-11 border-slate-200 focus:border-color-boton-1 focus:ring-0 ${
                                      !isEditing
                                        ? "cursor-not-allowed bg-slate-100/50 text-slate-500"
                                        : "bg-white shadow-sm"
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

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="rounded-xl bg-color-boton-1 px-6 shadow-sm hover:bg-color-boton-hover"
                        >
                          Editar usuario
                          <SquarePen className="h-4 w-4" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancelEditing}
                            className="rounded-xl border-slate-200 bg-white"
                            disabled={isProfileSubmitting}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button
                            onClick={profileForm.handleSubmit(onSubmitProfile)}
                            className="rounded-xl bg-green-600 px-6 shadow-sm hover:bg-green-700"
                            disabled={isProfileSubmitting}
                          >
                            {isProfileSubmitting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Guardar cambios
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="password" className="mt-0">
              <Card className="overflow-hidden rounded-[1.75rem] border-slate-200/80 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                <CardContent className="space-y-8 p-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-color-titulos">Cambiar contrasena</h2>
                    <p className="text-sm italic text-color-subtitulos">
                      Valida la contrasena actual del administrador y define una nueva contrasena
                      para {managedUserName}.
                    </p>
                  </div>

                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onSubmitPassword, () => {
                        toast.warning(
                          "Completa correctamente todos los campos antes de continuar.",
                          {
                            style: {
                              background: "#fffbeb",
                              border: "1px solid #f59e0b",
                              color: "#92400e",
                            },
                          }
                        );
                      })}
                      className="space-y-6"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-bold text-slate-700">
                              Contrasena actual de {adminDisplayName}
                            </FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  type={showCurrentPassword ? "text" : "password"}
                                  disabled={isPasswordSubmitting}
                                  placeholder="Ingresa tu contrasena actual"
                                  className="h-11 border-slate-200 bg-white pr-10 shadow-sm focus:border-color-boton-1 focus:ring-0"
                                />
                              </FormControl>
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword((current) => !current)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                disabled={isPasswordSubmitting}
                                aria-label={
                                  showCurrentPassword
                                    ? "Ocultar contrasena actual"
                                    : "Mostrar contrasena actual"
                                }
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="size-5" />
                                ) : (
                                  <Eye className="size-5" />
                                )}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-bold text-slate-700">
                              Nueva contrasena para {managedUserName}
                            </FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  type={showNewPassword ? "text" : "password"}
                                  disabled={isPasswordSubmitting}
                                  placeholder="Crea una contrasena segura"
                                  className="h-11 border-slate-200 bg-white pr-10 shadow-sm focus:border-color-boton-1 focus:ring-0"
                                />
                              </FormControl>
                              <button
                                type="button"
                                onClick={() => setShowNewPassword((current) => !current)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                                disabled={isPasswordSubmitting}
                                aria-label={
                                  showNewPassword
                                    ? "Ocultar nueva contrasena"
                                    : "Mostrar nueva contrasena"
                                }
                              >
                                {showNewPassword ? (
                                  <EyeOff className="size-5" />
                                ) : (
                                  <Eye className="size-5" />
                                )}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end border-t border-slate-100 pt-6">
                        <Button
                          type="submit"
                          className="rounded-xl bg-color-boton-1 px-6 shadow-sm hover:bg-color-boton-hover"
                          disabled={isPasswordSubmitting}
                        >
                          {isPasswordSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Actualizar contrasena
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger" className="mt-0">
              <Card className="overflow-hidden rounded-[1.75rem] border border-red-100 bg-gradient-to-b from-white to-red-50/40 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                <CardHeader className="border-b border-red-100 p-8 pt-6 pb-3">
                  <h2 className="text-2xl font-bold text-red-600">Zona de peligro</h2>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <p className="font-medium text-slate-600">
                    Esta accion es irreversible y eliminara permanentemente al usuario y sus datos
                    asociados.
                  </p>

                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      className="h-11 rounded-xl bg-red-600 px-8 font-bold shadow-sm hover:bg-red-700"
                      onClick={() => setShowConfirmDelete(true)}
                      disabled={isDeleting}
                    >
                      Eliminar cuenta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </CardContent>
        </Tabs>

        <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">
                Estas seguro de eliminar la cuenta?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Esta accion no se puede deshacer. El usuario ya no tendra acceso a la plataforma.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg border-slate-200">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-6 text-white hover:bg-red-700"
              >
                Eliminar definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}
