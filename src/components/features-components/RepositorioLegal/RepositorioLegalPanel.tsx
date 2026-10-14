"use client";

import { FileText, Scale } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  bibliotecaTabTriggerClassName,
  bibliotecaTabsListClassName,
} from "./bibliotecaTabs.styles";
import { ClausulasTab } from "./ClausulasTab";
import { NormativasTab } from "./NormativasTab";

export interface RepositorioLegalPanelProps {
  enteId?: string;
  readOnly?: boolean;
}

export function RepositorioLegalPanel({ enteId, readOnly = false }: RepositorioLegalPanelProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <Tabs defaultValue="normativas" className="w-full gap-0">
          <CardHeader className="space-y-1 p-8 pt-6 pb-5">
            <h1 className="text-3xl font-bold tracking-tight text-heading-dark">
              Repositorio Legal
            </h1>
            <p className="text-sm font-medium italic text-text-muted-dark">
              Consulte la normativa y cláusulas globales, y administre la biblioteca propia del
              ente. Las cláusulas admiten datos entre corchetes del catálogo del sistema.
            </p>
          </CardHeader>

          <div className="border-y border-slate-100 px-8 py-5">
            <TabsList className={bibliotecaTabsListClassName}>
              <TabsTrigger value="normativas" className={bibliotecaTabTriggerClassName}>
                <Scale className="h-4 w-4 shrink-0" />
                <span>Normativas</span>
              </TabsTrigger>
              <TabsTrigger value="clausulas" className={bibliotecaTabTriggerClassName}>
                <FileText className="h-4 w-4 shrink-0" />
                <span>Cláusulas</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-8 pt-8">
            <TabsContent value="normativas" className="mt-0 w-full">
              <NormativasTab enteId={enteId} readOnly={readOnly} />
            </TabsContent>

            <TabsContent value="clausulas" className="mt-0 w-full">
              <ClausulasTab enteId={enteId} readOnly={readOnly} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
