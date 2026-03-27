"use client";

import React from "react";
import type { IEvent } from "./types";
import { EVENT_COLOR_CLASSES } from "./helpers";

interface EventChipProps {
  event: IEvent;
  /** If true, display a dot only (event continues from previous day) */
  continuation?: boolean;
}

export function EventChip({ event, continuation = false }: EventChipProps) {
  const colors = EVENT_COLOR_CLASSES[event.color];

  if (continuation) {
    // For multi-day events beyond the first day: show a thin colored bar
    return (
      <div
        className={`h-5 rounded-sm px-1 text-[10px] font-medium leading-5 truncate border ${colors.bg} ${colors.text} ${colors.border} opacity-75`}
      >
        &nbsp;
      </div>
    );
  }

  return (
    <div
      className={`h-5 rounded-sm px-1.5 text-[10px] font-semibold leading-5 truncate border ${colors.bg} ${colors.text} ${colors.border} cursor-default`}
      title={event.title}
    >
      {event.title}
    </div>
  );
}
