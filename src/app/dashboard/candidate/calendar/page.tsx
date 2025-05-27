"use client";

import { useAuthContext } from "@/context/AuthStore";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import EventsCalendar from "@/components/calendar/EventsCalendar";
import { EventImpl } from "@fullcalendar/core/internal";
import EventPopOver from "@/components/calendar/EventPopOver";

interface Event {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  description?: string;
}

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [openPopOver, setOpenPopOver] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { user } = useAuthContext();
  const interviews = useQuery(
    api.candidates.getUpcomingInterviews,
    user ? { userId: user._id } : "skip"
  );

  const onClosePopOver = () => {
    setOpenPopOver(false);
    setSelectedEvent(null);
    setAnchorEl(null);
  };

  useEffect(() => {
    if (interviews) {
      const formattedEvents = interviews.map((interview) => ({
        id: interview._id,
        title: interview.title,
        start: new Date(interview.scheduledAt!),
        description: interview.description || "No description",
      }));
      setEvents(formattedEvents);
    }
  }, [interviews]);

  return (
    <>
      <EventsCalendar
        events={events}
        setOpenPopOver={setOpenPopOver}
        setSelectedEvent={setSelectedEvent}
        setAnchorEl={setAnchorEl}
      />

      {selectedEvent && anchorEl && (
        <EventPopOver
          event={selectedEvent}
          open={openPopOver}
          onOpenChange={onClosePopOver}
          anchorEl={anchorEl} // Pass the anchor element to the popover
          userRole={user?.role || "candidate"} // Assuming user role is available
        />
      )}
    </>
  );
}
