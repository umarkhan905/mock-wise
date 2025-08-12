import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EventImpl } from "@fullcalendar/core/internal";
import { CalendarIcon, ClockIcon, X } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Roles } from "@/types/globals";

interface Props {
  event: EventImpl | null;
  open: boolean;
  anchorEl: HTMLElement | null;
  userRole: Roles;
  onOpenChange: (open: boolean) => void;
}

export default function EventPopOver({
  event,
  open,
  anchorEl,
  userRole,
  onOpenChange,
}: Props) {
  const start = event?.start
    ? new Date(event.start).toLocaleString()
    : "Not specified";
  const end = event?.end
    ? new Date(event.end).toLocaleString()
    : "Not specified";

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div
          className="absolute"
          style={{
            position: "absolute",
            top: (anchorEl?.getBoundingClientRect().top ?? 0) + window.scrollY,
            left:
              (anchorEl?.getBoundingClientRect().left ?? 0) + window.scrollX,
            width: 0,
            height: 0,
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-3 relative">
        {/* close button */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          className="absolute top-2 right-2 hover:bg-primary/10 hover:text-white"
          onClick={() => onOpenChange(false)}
        >
          <span className="sr-only">Close</span>
          <X className="size-5" />
        </Button>

        <div className="text-xl font-semibold text-primary">
          {event?.title ?? "Untitled Event"}
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>{start}</span>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <ClockIcon className="w-4 h-4 mr-2" />
          <span>Ends: {end}</span>
        </div>

        <div className="text-sm text-muted-foreground mt-2 line-clamp-4">
          {event?.extendedProps?.description ??
            "No additional details for this event."}
        </div>

        <Button className="w-full min-h-10 text-white" asChild>
          <Link href={`/dashboard/${userRole}/interviews/${event?.id}/details`}>
            View Details
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
