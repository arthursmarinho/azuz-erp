"use client";

import {
  getClientDisplayName,
  getEventCardAccent,
  getEventHoverLabel,
} from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/services/types";

interface CalendarEventStatusMenuProps {
  event: CalendarEvent;
  onOpenDetails: (event: CalendarEvent) => void;
  className?: string;
  compact?: boolean;
  detail?: string;
}

export function CalendarEventStatusMenu({
  event,
  onOpenDetails,
  className,
  compact = true,
  detail,
}: CalendarEventStatusMenuProps) {
  const clientName = event.client
    ? getClientDisplayName(event.client, event.title)
    : null;
  const accent = getEventCardAccent(event);
  const hoverLabel = getEventHoverLabel(event);

  return (
    <button
      type="button"
      className={cn(
        "flex min-w-0 flex-col rounded border border-l-[3px] px-1.5 py-1 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--atria-primary)]/20",
        className,
      )}
      style={{
        backgroundColor: accent.backgroundColor,
        borderColor: accent.borderColor,
        borderLeftColor: accent.borderLeftColor,
      }}
      title={hoverLabel}
      onClick={(e) => {
        e.stopPropagation();
        onOpenDetails(event);
      }}
    >
      {compact ? (
        clientName ? (
          <>
            <span className="truncate text-[10px] font-bold text-[var(--atria-primary)]">
              {clientName}
            </span>
            <span className="truncate text-[10px] text-[var(--atria-primary)]/75">
              {event.title}
            </span>
          </>
        ) : (
          <span className="truncate text-[10px] font-bold text-[var(--atria-primary)]">
            {event.title}
          </span>
        )
      ) : (
        <div className="min-w-0">
          {clientName ? (
            <>
              <p
                className="truncate text-xs font-bold text-[var(--atria-primary)]"
                title={clientName}
              >
                {clientName}
              </p>
              <p
                className="truncate text-xs text-[var(--atria-primary)]/75"
                title={event.title}
              >
                {event.title}
              </p>
            </>
          ) : (
            <p
              className="truncate text-xs font-bold text-[var(--atria-primary)]"
              title={event.title}
            >
              {event.title}
            </p>
          )}
        </div>
      )}
      {detail && (
        <p className="mt-1 text-[10px] text-[var(--atria-primary)]/50">
          {detail}
        </p>
      )}
    </button>
  );
}
