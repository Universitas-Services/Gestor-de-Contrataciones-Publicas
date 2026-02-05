"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <ShieldAlert className="h-24 w-24 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Acceso Denegado</h1>
          <h2 className="text-xl font-semibold text-muted-foreground">Error 403</h2>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta página. Por favor, contacta al administrador del
            sistema si crees que esto es un error.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">Ir al Inicio</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver Atrás
          </Button>
        </div>
      </div>
    </div>
  );
}
