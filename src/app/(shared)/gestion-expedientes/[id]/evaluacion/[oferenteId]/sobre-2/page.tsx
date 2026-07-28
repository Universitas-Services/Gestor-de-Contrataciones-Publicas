"use client";

import React from "react";

import { GestionSobre2ChecklistForm } from "@/components/features-components/GestionExpedientes/evaluacion/GestionSobre2ChecklistForm";

export default function GestionSobre2Page({
  params,
}: {
  params: Promise<{ id: string; oferenteId: string }>;
}) {
  const { id, oferenteId } = React.use(params);
  return <GestionSobre2ChecklistForm expedienteId={id} evaluacionId={oferenteId} />;
}
