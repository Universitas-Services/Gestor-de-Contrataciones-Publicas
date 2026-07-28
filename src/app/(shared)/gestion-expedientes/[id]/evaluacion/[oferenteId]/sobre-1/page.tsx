"use client";

import React from "react";

import { GestionSobre1Form } from "@/components/features-components/GestionExpedientes/evaluacion/GestionSobre1Form";

export default function GestionSobre1Page({
  params,
}: {
  params: Promise<{ id: string; oferenteId: string }>;
}) {
  const { id, oferenteId } = React.use(params);
  return <GestionSobre1Form expedienteId={id} evaluacionId={oferenteId} />;
}
