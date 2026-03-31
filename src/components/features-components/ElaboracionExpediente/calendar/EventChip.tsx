"use client";

import React from "react";
import type { IEvent } from "./types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface EventChipProps {
  event: IEvent;
  /** The specific day (cell) this chip is being rendered in */
  day: Date;
  /** This day is the first day of the event (actual startDate) */
  isStart: boolean;
  /** This day is the last day of the event (actual endDate) */
  isEnd: boolean;
  /**
   * The bar is resuming after a weekend gap — show start visual styling
   * (left rounding) but NO text label (not the real first day).
   */
  isResuming: boolean;
  /**
   * The bar is pausing before a weekend — treat as a visual "end"
   * (right rounding, solid right border) but the event continues next week.
   */
  isPausing: boolean;
}

/**
 * Horizontal event bar (pill) in a calendar cell.
 *
 * Key visual rules:
 *  - Left accent (3px solid) + rounded left corners only on [isStart || isResuming]
 *  - Right: dashed if bar continues tomorrow (not isEnd && not isPausing), else soft solid
 *  - Gradient bg on start-of-segment cells, flat lighter bg on mid cells
 *  - Text label only on the true start day (isStart)
 *  - Extends slightly past cell right border on continuation cells (margin-right: -1px)
 *    so adjacent bars merge visually and the border seam disappears
 *
 * Colors use CSS custom properties from :root in globals.css:
 *   var(--cal-disponibilidad), var(--cal-evaluacion), etc.
 * color-mix() provides semi-transparency without hardcoding values.
 */
export function EventChip({ event, day, isStart, isEnd, isResuming, isPausing }: EventChipProps) {
  const c = `var(--${event.colorVar})`;

  // ── Left side: start of a visual segment ────────────────────────────
  const visualStart = isStart || isResuming;

  // ── Right side: end of a visual segment ─────────────────────────────
  const visualEnd = isEnd || isPausing;

  // Border radius
  const rl = visualStart ? "4px" : "0px";
  const rr = visualEnd ? "4px" : "0px";

  // Background: richer gradient on segment-start; flat light on mid-run
  const background = visualStart
    ? `linear-gradient(to right, color-mix(in oklch, ${c} 30%, white), color-mix(in oklch, ${c} 9%, white))`
    : `color-mix(in oklch, ${c} 11%, white)`;

  // Left border: solid accent on segment starts, transparent elsewhere
  const borderLeft = visualStart ? `3px solid ${c}` : `1px solid transparent`;

  // Right border: dashed if the bar continues into next workday, soft if ending segment
  const borderRight = visualEnd
    ? `1px solid color-mix(in oklch, ${c} 28%, transparent)`
    : `2px dashed color-mix(in oklch, ${c} 42%, transparent)`;

  const style: React.CSSProperties = {
    borderRadius: `${rl} ${rr} ${rr} ${rl}`,
    background,
    borderLeft,
    borderTop: `1px solid color-mix(in oklch, ${c} 25%, transparent)`,
    borderBottom: `1px solid color-mix(in oklch, ${c} 25%, transparent)`,
    borderRight,
    color: `color-mix(in oklch, ${c} 78%, oklch(0.12 0 0))`,
    // Bleed into cell border on mid segments to erase the seam
    marginRight: !visualEnd ? "-2px" : undefined,
    width: !visualEnd ? "calc(100% + 2px)" : "100%",
    position: "relative",
    zIndex: 1,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          style={style}
          className="h-[18px] leading-[18px] px-1.5 text-[9px] font-semibold truncate cursor-pointer hover:opacity-80 transition-opacity"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "application/json",
              JSON.stringify({ eventId: event.id, draggedFromDate: day.toISOString() })
            );
            e.dataTransfer.effectAllowed = "move";
          }}
        >
          {/* Label only on the true first day of the event */}
          {isStart ? event.title : "\u00a0"}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-heading-dark text-white border-0 shadow-lg text-xs font-medium px-3 py-1.5 rounded-md"
      >
        {event.title}
      </TooltipContent>
    </Tooltip>
  );
}
