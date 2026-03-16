import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { BsArrowBarLeft } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import { ConsultorChat } from "./ConsultorChat";
import { ROLE_ROUTES } from "@/lib/constants/routes";

// Este será posteriormente un Server/Client Component hibrido o puramente Client

export default async function ConsultorIAPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin_ente" || !user.enteId) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] rounded-xl bg-[#EFF2F5] p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-full">
        {/* Cabecera Interactiva */}
        <div className="mb-6 flex items-center h-16 w-full">
          <Link
            href={ROLE_ROUTES.admin_ente.dashboard}
            className="flex items-center text-[#1B456F] hover:text-[#123050] transition-colors"
          >
            <BsArrowBarLeft className="mr-3 h-7 w-7" />
            <h1 className="text-2xl font-bold">Consultor IA</h1>
          </Link>
        </div>

        {/* Tarjeta Contenedora Principal */}
        <ConsultorChat userName={user.name} />
      </div>
    </div>
  );
}
