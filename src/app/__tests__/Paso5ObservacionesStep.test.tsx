import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import { fase1FormSchema, type Fase1FormInputValues } from "@/lib/schemas/fase1Schema";
import { Form } from "@/components/ui/form";
import { Paso5ObservacionesStep } from "@/components/features-components/ElaboracionExpediente/fase-1/steps/Paso5ObservacionesStep";

function buildValidDefaults(): Fase1FormInputValues {
  return {
    datosActoAutorizacionInicio: "Acto 001",
    fechaActaInicio: "2026-06-05",
    detallesTecnicosCalidad: "Detalle tecnico valido",
    alcanceCantidadesObra: "Alcance valido",
    justificacionVentajas: "Justificacion valida",
    origenCrsRegistro: true,
    diasValidezOferta: "30",
    autoridadAclaratorias: "Autoridad competente",
    normativaLegal: ["Normativa aplicable"],
    diasVigenciaGarantiaExtension: "15",
    objetivosEspecificos1: "Objetivo 1",
    objetivosEspecificos2: "Objetivo 2",
    objetivosEspecificos3: "Objetivo 3",
    direccionRetiroPliego: "Direccion del ente",
    horarioRetiroPliego: "08:00 AM a 04:00 PM",
    pliegoGratuito: true,
    costoPliegoBs: "",
    bancoPagoPliego: "",
    cuentaPagoPliego: "",
    titularPagoPliego: "",
    horaActoRecepAper: "08:00 AM",
    condicionPlurianual: undefined,
    viabilidadContratoMarco: undefined,
    justificacionContratoMarco: "",
  };
}

function Paso5TestHarness() {
  const form = useForm<Fase1FormInputValues>({
    resolver: zodResolver(fase1FormSchema),
    mode: "onTouched",
    defaultValues: buildValidDefaults(),
  });

  return (
    <Form {...form}>
      <form>
        <Paso5ObservacionesStep form={form} />
        <button
          type="button"
          onClick={() =>
            void form.trigger(
              ["condicionPlurianual", "viabilidadContratoMarco", "justificacionContratoMarco"],
              { shouldFocus: true }
            )
          }
        >
          Validar
        </button>
      </form>
    </Form>
  );
}

describe("Paso5ObservacionesStep", () => {
  it("muestra el aviso cuando la contratacion es plurianual", async () => {
    const user = userEvent.setup();

    render(<Paso5TestHarness />);

    await user.click(screen.getAllByRole("button", { name: "Si" })[0]);

    expect(
      screen.getByText(
        "Recuerde reflejar esta condición en el cronograma o en las condiciones del procedimiento."
      )
    ).toBeInTheDocument();
  });

  it("vuelve obligatoria la justificacion cuando se selecciona contrato marco", async () => {
    const user = userEvent.setup();

    render(<Paso5TestHarness />);

    await user.click(screen.getAllByRole("button", { name: "Si" })[1]);

    expect(
      screen.getByPlaceholderText("Ingrese la evaluación correspondiente")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Validar" }));

    expect(
      await screen.findByText("La evaluacion sobre el contrato marco es requerida")
    ).toBeInTheDocument();
  });
});
