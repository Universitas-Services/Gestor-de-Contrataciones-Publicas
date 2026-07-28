import React from "react";

import { GestionMatrizForm } from "@/components/features-components/GestionExpedientes/evaluacion/GestionMatrizForm";

export default function GestionMatrizPage({
  params,
}: {
  params: Promise<{ id: string; oferenteId: string }>;
}) {
  const { id, oferenteId } = React.use(params);
  return <GestionMatrizForm expedienteId={id} evaluacionId={oferenteId} />;
}
