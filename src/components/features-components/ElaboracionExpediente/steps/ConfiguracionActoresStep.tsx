"use client";

import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUTORIDADES_MOCK,
  COMISIONES_MOCK,
  UNIDADES_USUARIAS_MOCK,
} from "@/lib/mocks/expedientesMock";

interface ConfiguracionActoresStepProps {
  onBack: () => void;
  onFinish: () => void;
}

export function ConfiguracionActoresStep({ onBack, onFinish }: ConfiguracionActoresStepProps) {
  const [autoridad, setAutoridad] = useState<string>("");
  const [comision, setComision] = useState<string>("");
  const [unidadUsuaria, setUnidadUsuaria] = useState<string>("");
  const [fechaLlamado, setFechaLlamado] = useState<Date | undefined>(undefined);

  return (
    <div className="space-y-0">
      {/* Máxima Autoridad */}
      <div className="mb-8">
        <label className="text-heading-dark font-bold font-inter text-base block mb-2">
          Seleccione la Máxima Autoridad (o Delegado) que suscribe los actos del procedimiento
        </label>
        <Select value={autoridad} onValueChange={setAutoridad}>
          <SelectTrigger className="w-full md:w-2/3 lg:w-1/2 h-10 bg-white border-slate-300 rounded-md text-sm font-inter text-slate-400">
            <SelectValue placeholder="Selecciona opciones" />
          </SelectTrigger>
          <SelectContent>
            {AUTORIDADES_MOCK.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="font-inter">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comisión de Contrataciones */}
      <div className="mb-8">
        <label className="text-heading-dark font-bold font-inter text-base block mb-2">
          Seleccione la Comisión de Contrataciones encargada del procedimiento
        </label>
        <Select value={comision} onValueChange={setComision}>
          <SelectTrigger className="w-full md:w-2/3 lg:w-1/2 h-10 bg-white border-slate-300 rounded-md text-sm font-inter text-slate-400">
            <SelectValue placeholder="Selecciona opciones" />
          </SelectTrigger>
          <SelectContent>
            {COMISIONES_MOCK.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="font-inter">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Unidad Usuaria */}
      <div className="mb-8">
        <label className="text-heading-dark font-bold font-inter text-base block mb-2">
          Seleccione la Unidad Usuaria solicitante
        </label>
        <Select value={unidadUsuaria} onValueChange={setUnidadUsuaria}>
          <SelectTrigger className="w-full md:w-2/3 lg:w-1/2 h-10 bg-white border-slate-300 rounded-md text-sm font-inter text-slate-400">
            <SelectValue placeholder="Selecciona opciones" />
          </SelectTrigger>
          <SelectContent>
            {UNIDADES_USUARIAS_MOCK.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="font-inter">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fecha del Llamado */}
      <div className="mb-8">
        <label className="text-heading-dark font-bold font-inter text-base block mb-1">
          Indique la fecha del Llamado a participar (Fecha de inicio del cronograma)
        </label>
        <p className="text-slate-500 italic text-sm mt-0.5 mb-3 font-inter">
          Artículos 79, 95 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[260px] h-10 justify-start text-left font-normal border-slate-300 rounded-md ${
                !fechaLlamado ? "text-slate-400" : "text-heading-dark"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
              {fechaLlamado ? format(fechaLlamado, "PPP", { locale: es }) : "Seleccione una fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fechaLlamado}
              onSelect={setFechaLlamado}
              locale={es}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Atrás
        </Button>
        <Button
          type="button"
          onClick={onFinish}
          className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );
}
