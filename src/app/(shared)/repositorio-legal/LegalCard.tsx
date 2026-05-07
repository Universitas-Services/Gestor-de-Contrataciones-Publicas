"use client";

import { ExternalLink } from "lucide-react";
import { IoIosAttach, IoIosBriefcase, IoIosClipboard } from "react-icons/io";
import { BsJournalBookmark } from "react-icons/bs";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export type LegalDocType =
  | "Ley Orgánica"
  | "Ley Ordinaria"
  | "Norma General"
  | "Resolución"
  | "Reglamento"
  | "Ley Especial"
  | "Ley Constitucional";

export interface LegalCardData {
  title: string;
  label: LegalDocType;
  description: string;
  publishDate: string;
  gacetaNumber: string;
  gacetaLink: string;
  downloadLink: string;
}

// ── Theme config per type ──────────────────────────────────────────────────────
const TYPE_CONFIG: Record<LegalDocType, { bgVar: string; Icon: React.ElementType }> = {
  "Ley Orgánica": {
    bgVar: "var(--color-legal-organica)",
    Icon: IoIosAttach,
  },
  "Ley Ordinaria": {
    bgVar: "var(--color-legal-ordinaria)",
    Icon: BsJournalBookmark,
  },
  "Norma General": {
    bgVar: "var(--color-legal-norma)",
    Icon: IoIosBriefcase,
  },
  Resolución: {
    bgVar: "var(--color-legal-resolucion)",
    Icon: IoIosClipboard,
  },
  Reglamento: {
    bgVar: "var(--color-legal-reglamento)",
    Icon: IoIosBriefcase,
  },
  "Ley Especial": {
    bgVar: "var(--color-legal-especial)",
    Icon: BsJournalBookmark,
  },
  "Ley Constitucional": {
    bgVar: "var(--color-legal-constitucional)",
    Icon: IoIosAttach,
  },
};

// ── Component ──────────────────────────────────────────────────────────────────
interface LegalCardProps {
  data: LegalCardData;
  className?: string;
}

export function LegalCard({ data, className }: LegalCardProps) {
  const { title, label, description, publishDate, gacetaNumber, gacetaLink, downloadLink } = data;
  const { bgVar, Icon } = TYPE_CONFIG[label] ?? TYPE_CONFIG["Ley Orgánica"];

  return (
    <div
      className={cn(
        "flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-5 justify-between transition-all hover:shadow-md hover:-translate-y-0.5 duration-300",
        className
      )}
    >
      {/* ── Top section ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Icon + Badge */}
        <div className="flex justify-between items-start">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 shadow-sm shrink-0"
            style={{ backgroundColor: bgVar }}
          >
            <Icon size={20} />
          </div>
          <div
            className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-gray-700/80 uppercase tracking-widest"
            style={{ backgroundColor: bgVar }}
          >
            {label}
          </div>
        </div>

        {/* Title + Description */}
        <div className="space-y-2">
          <h3 className="text-[#003d52] text-base leading-snug font-bold">{title}</h3>
          <p className="text-[11.5px] italic text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* ── Bottom section ───────────────────────────────────────── */}
      <div className="mt-4 space-y-4">
        <div className="w-full h-[1px] bg-gray-100" />

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-gray-400 font-medium">Fecha publicación</span>
            <span className="text-[#003d52] font-extrabold">{publishDate}</span>
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-gray-400 font-bold uppercase tracking-wide text-[10px]">
              Gaceta Oficial
            </span>
            <a
              href={gacetaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 transition-colors uppercase"
            >
              {gacetaNumber}
              <ExternalLink size={8} />
            </a>
          </div>
        </div>

        {/* Download button */}
        <a
          href={downloadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center h-10 bg-[#003d52] hover:bg-[#002f40] text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#003d52]/10 text-sm"
        >
          Descargar
        </a>
      </div>
    </div>
  );
}
