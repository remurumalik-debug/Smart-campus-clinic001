"use client";

import { useEffect, useRef, useCallback } from "react";

export interface SlotEvent {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  action: "booked" | "cancelled" | "updated";
}

export function useSlotUpdates(
  doctorId: string,
  appointmentDate: string,
  onSlotChanged: (event: SlotEvent) => void
) {
  const callbackRef = useRef(onSlotChanged);
  callbackRef.current = onSlotChanged;

  const active = !!doctorId && !!appointmentDate;

  useEffect(() => {
    if (!active) return;

    const controller = new AbortController();
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource("/api/notifications/stream");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.kind === "appointment" && data.payload) {
            const p = data.payload as SlotEvent;
            if (p.doctorId === doctorId && p.appointmentDate === appointmentDate) {
              callbackRef.current(p);
            }
          }
        } catch {
          // silent
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    };

    connect();

    return () => {
      controller.abort();
      eventSource?.close();
    };
  }, [active, doctorId, appointmentDate]);
}
