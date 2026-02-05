"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
          <h2 className="text-3xl font-bold">Página No Encontrada</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
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
