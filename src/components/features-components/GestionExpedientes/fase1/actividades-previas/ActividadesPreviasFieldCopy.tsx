import { ACTIVIDADES_PREVIAS_FIELD_COPY } from "@/lib/constants/actividadesPrevias";
import { FormDescription } from "@/components/ui/form";

const labelClass = "text-sm font-bold text-slate-700";
const descriptionClass = "text-[11px] italic leading-relaxed text-slate-500";

type FieldCopyKey = keyof typeof ACTIVIDADES_PREVIAS_FIELD_COPY;

interface ActividadesPreviasFieldCopyProps {
  fieldKey: FieldCopyKey;
  labelClassName?: string;
  descriptionClassName?: string;
}

export function ActividadesPreviasFieldCopy({
  fieldKey,
  labelClassName = labelClass,
  descriptionClassName = descriptionClass,
}: ActividadesPreviasFieldCopyProps) {
  const copy = ACTIVIDADES_PREVIAS_FIELD_COPY[fieldKey];

  return (
    <>
      <p className={labelClassName}>{copy.label}</p>
      {copy.legal ? (
        <FormDescription className={descriptionClassName}>{copy.legal}</FormDescription>
      ) : null}
    </>
  );
}
