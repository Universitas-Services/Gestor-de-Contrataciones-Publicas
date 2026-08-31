"use client";

import { Scale } from "lucide-react";

import {
  ESPECIFICACIONES_TECNICAS_LINEAMIENTOS_INTRO,
  ESPECIFICACIONES_TECNICAS_SECCION_1,
  ESPECIFICACIONES_TECNICAS_SECCION_2,
} from "@/lib/constants/especificacionesTecnicas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function SectionIndex({
  value,
  title,
  intro,
  items,
}: {
  value: string;
  title: string;
  intro: string;
  items: readonly { title: string; body: string }[];
}) {
  return (
    <AccordionItem value={value} className="border-border">
      <AccordionTrigger className="items-center hover:no-underline">
        <span className="pr-2 text-left text-[12px] font-bold uppercase leading-snug text-navy">
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{intro}</p>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.title} className="text-xs leading-relaxed">
              <span className="font-semibold text-color-titulos">{item.title}</span>{" "}
              <span className="text-muted-foreground">{item.body}</span>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

export function LineamientosPanel() {
  return (
    <div className="space-y-4 p-5 md:p-6">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-bold text-color-titulos">Lineamientos de Redacción</h2>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {ESPECIFICACIONES_TECNICAS_LINEAMIENTOS_INTRO}
      </p>

      <Accordion
        type="single"
        collapsible
        defaultValue="seccion-1"
        className="rounded-lg border border-border bg-card px-3"
      >
        <SectionIndex
          value="seccion-1"
          title={ESPECIFICACIONES_TECNICAS_SECCION_1.title}
          intro={ESPECIFICACIONES_TECNICAS_SECCION_1.intro}
          items={ESPECIFICACIONES_TECNICAS_SECCION_1.items}
        />
        <SectionIndex
          value="seccion-2"
          title={ESPECIFICACIONES_TECNICAS_SECCION_2.title}
          intro={ESPECIFICACIONES_TECNICAS_SECCION_2.intro}
          items={ESPECIFICACIONES_TECNICAS_SECCION_2.items}
        />
      </Accordion>
    </div>
  );
}
