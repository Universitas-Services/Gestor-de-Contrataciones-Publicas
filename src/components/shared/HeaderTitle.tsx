"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { resolveHeaderTitle } from "@/lib/header-title";
import type { UserRole } from "@/types/role.types";

interface HeaderTitleProps {
  userRole: UserRole;
}

export function HeaderTitle({ userRole }: HeaderTitleProps) {
  const pathname = usePathname();
  const title = resolveHeaderTitle(pathname, userRole);
  const titleRef = useRef<HTMLParagraphElement | null>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  useLayoutEffect(() => {
    const element = titleRef.current;

    if (!element) {
      return;
    }

    const measureTitle = () => {
      const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);

      if (!Number.isFinite(lineHeight)) {
        setIsWrapped(element.scrollHeight > 24);
        return;
      }

      setIsWrapped(element.scrollHeight > lineHeight + 2);
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
          "line-clamp-2 max-w-136 text-center font-semibold text-color-titulos text-balance transition-[font-size,line-height] duration-150",
          isWrapped ? "text-base leading-tight" : "text-xl leading-snug"
        )}
      >
        {title}
      </p>
    </div>
  );
}
