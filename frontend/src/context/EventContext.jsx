import { createContext, useContext, useMemo } from "react";
import { DEFAULT_EVENT } from "../config";
import { useAuth } from "./AuthContext";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const { session } = useAuth();
  const event = session?.event || DEFAULT_EVENT;

  const value = useMemo(() => ({
    event,
    eventId: event?.eventId || DEFAULT_EVENT.eventId,
  }), [event]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent must be used inside EventProvider");
  return context;
}
