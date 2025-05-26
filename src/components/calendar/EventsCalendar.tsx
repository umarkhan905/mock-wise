"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventImpl } from "@fullcalendar/core/internal";

interface Event {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  description?: string;
}

interface Props {
  events: Event[];
  setOpenPopOver: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedEvent: React.Dispatch<React.SetStateAction<EventImpl | null>>;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}

export default function EventsCalendar({
  events,
  setOpenPopOver,
  setSelectedEvent,
  setAnchorEl,
}: Props) {
  return (
    <FullCalendar
      events={events}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      selectable
      editable
      height="auto"
      eventClick={(info) => {
        setSelectedEvent(info.event);
        setAnchorEl(info.el);
        setOpenPopOver(true);
      }}
      dayHeaderClassNames={
        "bg-primary text-white font-normal text-sm p-2! min-h-10!"
      }
    />
  );
}
