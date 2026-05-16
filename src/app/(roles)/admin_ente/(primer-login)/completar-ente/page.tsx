import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { CompletarEnteForm } from "@/components/forms/admin_ente/CompletarEnteForm";
import { getUniversitas } from "@/lib/universitas";
import { Estado } from "@universitas/sdk-global";

export const metadata: Metadata = {
  title: "Completar Datos del Ente | Admin Ente",
  description: "Completa la información de tu Ente para continuar",
};

export default async function CompletarEntePage() {
  const user = await getCurrentUser();

  if (!user || !user.enteId) {
    redirect("/login");
  }

  let estadosData: Estado[] = [];
  try {
    const res = await getUniversitas().territorio.getEstados();
    estadosData = res.data;
  } catch (error) {
    console.error("Error fetching estados on server", error);
  }

  return (
    <div className="min-h-screen bg-df-bg">
      {/* Cabecera superior (Logo e indicaciones) */}
      <header className="flex items-center gap-4 py-8 px-6 max-w-full mx-auto">
        <img
          src="/img_app/icono_sin_relleno.png"
          alt="Logo Ente"
          className="h-16 w-auto object-contain"
        />
        <h1 className="text-2xl font-bold text-color-titulos flex-1 text-center pr-16 md:pr-0 font-inter">
          Configuración Inicial del Órgano o Ente Contratante
        </h1>
      </header>

      {/* Contenedor del Formulario */}
      <main className="pb-16 px-4">
        <CompletarEnteForm enteId={user.enteId as string} initialEstados={estadosData} />
      </main>
    </div>
  );
}
