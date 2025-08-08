"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents);
  }, []);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Naptár</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height={700}
        events={events}
      />
    </div>
  );
}