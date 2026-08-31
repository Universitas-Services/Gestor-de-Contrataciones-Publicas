"use client";

import { AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type FormCalloutVariant = "info" | "warning" | "controlInterno";

interface FormCalloutProps {
  variant: FormCalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<
  FormCalloutVariant,
  { container: string; icon: string; title?: string; text: string }
> = {
  info: {
    container: "border border-blue-100 bg-blue-50",
    icon: "text-blue-500",
    text: "text-xs text-blue-800",
  },
  warning: {
    container: "border-l-4 border-amber-500 bg-amber-50",
    icon: "text-amber-600",
    text: "text-sm font-semibold text-amber-800",
  },
  controlInterno: {
    container: "border-l-4 border-orange-500 bg-orange-50 rounded-r-lg",
    icon: "text-orange-700",
    title: "text-sm font-bold text-orange-900",
    text: "text-xs leading-relaxed text-orange-800",
  },
};

export function FormCallout({ variant, title, children, className }: FormCalloutProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = variant === "info" ? Info : AlertTriangle;

  return (
    <div className={cn("flex items-start gap-3 rounded-lg p-4", styles.container, className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.icon)} />
      <div className="min-w-0">
        {title ? <h4 className={cn("mb-1", styles.title)}>{title}</h4> : null}
        <div className={styles.text}>{children}</div>
      </div>
    </div>
  );
}
