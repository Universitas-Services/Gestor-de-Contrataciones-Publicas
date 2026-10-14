"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { resolveHeaderTitle } from "@/lib/header-title";
import { useHeaderTitleOverride } from "./HeaderTitleContext";
import type { UserRole } from "@/types/role.types";

interface HeaderTitleProps {
  userRole: UserRole;
}

/** text-xl / leading-snug — medición siempre a este tamaño para evitar oscilación. */
const MEASURE_FONT_SIZE = "1.25rem";
const MEASURE_LINE_HEIGHT = "1.375";

export function HeaderTitle({ userRole }: HeaderTitleProps) {
  const pathname = usePathname();
  const { overrideTitle } = useHeaderTitleOverride();
  const title = overrideTitle ?? resolveHeaderTitle(pathname, userRole);
  const titleRef = useRef<HTMLParagraphElement | null>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  useLayoutEffect(() => {
    const element = titleRef.current;

    if (!element) {
      return;
    }

    const measureTitle = () => {
      // Medir siempre con el tamaño grande; si no, text-base ↔ text-xl oscila en títulos largos.
      element.style.fontSize = MEASURE_FONT_SIZE;
      element.style.lineHeight = MEASURE_LINE_HEIGHT;

      const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);
      const wraps = Number.isFinite(lineHeight)
        ? element.scrollHeight > lineHeight + 2
        : element.scrollHeight > 24;

      element.style.fontSize = "";
      element.style.lineHeight = "";

      setIsWrapped((prev) => (prev === wraps ? prev : wraps));
    };

    measureTitle();

    const resizeObserver = new ResizeObserver(() => {
      measureTitle();
    });

    resizeObserver.observe(element);
    window.addEventListener("resize", measureTitle);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureTitle);
    };
  }, [title]);

  return (
    <div className="hidden min-w-0 items-center justify-center px-4 md:flex">
      <p
        ref={titleRef}
        title={title}
        className={cn(
          "line-clamp-2 max-w-136 text-center font-semibold text-color-titulos text-balance",
          isWrapped ? "text-base leading-tight" : "text-xl leading-snug"
        )}
      >
        {title}
      </p>
    </div>
  );
}
