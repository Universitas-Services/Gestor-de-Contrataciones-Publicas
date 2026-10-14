import { ASPECTOS_GENERALES_FIELD_COPY } from "@/lib/constants/aspectosGenerales";
import { FormDescription } from "@/components/ui/form";

const labelClass = "text-sm font-bold text-color-titulos";
const descriptionClass = "text-[11px] italic leading-relaxed text-muted-foreground";

type FieldCopyKey = keyof typeof ASPECTOS_GENERALES_FIELD_COPY;

interface AspectosGeneralesFieldCopyProps {
  fieldKey: FieldCopyKey;
  labelClassName?: string;
  descriptionClassName?: string;
}

export function AspectosGeneralesFieldCopy({
  fieldKey,
  labelClassName = labelClass,
  descriptionClassName = descriptionClass,
}: AspectosGeneralesFieldCopyProps) {
  const copy = ASPECTOS_GENERALES_FIELD_COPY[fieldKey];

  return (
    <>
      <p className={labelClassName}>{copy.label}</p>
      {"legal" in copy && copy.legal ? (
        <FormDescription className={descriptionClassName}>{copy.legal}</FormDescription>
      ) : null}
    </>
  );
}
