"use client";

import { FolderOpen, Lock } from "lucide-react";

interface ModuloPlaceholderProps {
  titulo: string;
  descripcion: string;
  locked?: boolean;
}

export function ModuloPlaceholder({ titulo, descripcion, locked = true }: ModuloPlaceholderProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-8">
      {locked ? (
        <Lock className="mb-4 h-10 w-10 text-muted-foreground/50" />
      ) : (
        <FolderOpen className="mb-4 h-10 w-10 text-muted-foreground/50" />
      )}
      <h2 className="mb-2 text-[20px] font-bold text-color-titulos">{titulo}</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">{descripcion}</p>
    </div>
  );
}
