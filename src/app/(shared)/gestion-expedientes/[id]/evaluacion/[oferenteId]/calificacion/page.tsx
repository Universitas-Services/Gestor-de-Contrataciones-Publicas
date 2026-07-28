import React from "react";

import { GestionCalificacionForm } from "@/components/features-components/GestionExpedientes/evaluacion/GestionCalificacionForm";

export default function GestionCalificacionPage({
  params,
}: {
  params: Promise<{ id: string; oferenteId: string }>;
}) {
  const { id, oferenteId } = React.use(params);
  return <GestionCalificacionForm expedienteId={id} evaluacionId={oferenteId} />;
}
