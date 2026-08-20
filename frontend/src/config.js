const env = import.meta.env;

export const APP_CONFIG = {
  name: "Eventra",
  tagline: "Smart Event Registration & Management Platform",
  apiUrl: env.VITE_API_URL || "",
  authMode: env.VITE_AUTH_MODE || "event",
  defaultEventId: env.VITE_EVENT_ID || "",
  version: env.VITE_APP_VERSION || "3.0.0",
  developer: env.VITE_DEVELOPER || "Eventra Team",
};

export const DEFAULT_EVENT = {
  eventId: APP_CONFIG.defaultEventId,
  eventName: env.VITE_EVENT_NAME || "Your Event",
  organisation: env.VITE_EVENT_ORGANISATION || "Your Organisation",
  eventDate: env.VITE_EVENT_DATE || "",
  logoUrl: env.VITE_EVENT_LOGO || "",
  primaryColor: env.VITE_PRIMARY_COLOR || "#4B0082",
  secondaryColor: env.VITE_SECONDARY_COLOR || "#7C3AED",
  adminName: env.VITE_ADMIN_NAME || "Event Administrator",
};

export function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem("eventra_session") || "null");
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem("eventra_session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("eventra_session");
}
