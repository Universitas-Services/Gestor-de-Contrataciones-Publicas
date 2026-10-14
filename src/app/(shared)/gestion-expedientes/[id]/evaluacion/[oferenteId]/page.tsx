"use client";

import React from "react";

import { EvaluacionOferentePage } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/EvaluacionOferentePage";

export default function GestionEvaluacionOferenteHubPage({
  params,
}: {
  params: Promise<{ id: string; oferenteId: string }>;
}) {
  const { id, oferenteId } = React.use(params);
  return <EvaluacionOferentePage expedienteId={id} evaluacionId={oferenteId} />;
}
