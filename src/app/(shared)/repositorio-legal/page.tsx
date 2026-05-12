import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { LegalCarousel } from "./LegalCarousel";
import { FaBalanceScale } from "react-icons/fa";

export default async function RepositorioLegalPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--color-conocenos-bg)] p-6 md:p-10 flex flex-col">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
        {/* ── Header card ── */}
        <div className="rounded-xl bg-white border border-gray-200/70 shadow-sm p-6 md:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[var(--color-navy)] font-bold">
            <FaBalanceScale size={18} />
            <span className="uppercase tracking-wider text-xs">Base de Conocimiento</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-[28px] font-bold text-[var(--color-navy-deep)] leading-tight">
              Repositorio Legal
            </h1>
            <p className="text-[15px] italic text-gray-500 leading-relaxed max-w-3xl">
              Acceda a nuestro Repositorio Legal para consultar las leyes orgánicas, leyes
              especiales y decretos nacionales que rigen las contrataciones públicas en Venezuela.
            </p>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div className="relative overflow-visible">
          <LegalCarousel />
        </div>
      </div>
    </div>
  );
}
