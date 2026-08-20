const env = import.meta.env;

const EVENTRA_API_URL =
  env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbwA6KrYSpGe4JakvrJP_avfLZ0o87SoL87XBk7ZSdY4H4rfoSXic1RUlor9tGhDrE-M1w/exec";

export const APP_CONFIG = {
  name: "Eventra",

  tagline:
    "Smart Event Registration & Management Platform",

  /*
   * IMPORTANT
   * Eventra now uses the Google Apps Script backend.
   */
  apiUrl: EVENTRA_API_URL,

  /*
   * API authentication
   */
  authMode: "api",

  /*
   * No single event is hard-coded.
   * The event is determined from the logged-in user.
   */
  defaultEventId:
    env.VITE_EVENT_ID || "",

  version:
    env.VITE_APP_VERSION || "3.0.0",

  developer:
    env.VITE_DEVELOPER || "Eventra Team",
};


/* =========================
   DEFAULT EVENT
   ========================= */

export const DEFAULT_EVENT = {
  eventId:
    APP_CONFIG.defaultEventId,

  eventName:
    env.VITE_EVENT_NAME ||
    "Your Event",

  organisation:
    env.VITE_EVENT_ORGANISATION ||
    "Your Organisation",

  eventDate:
    env.VITE_EVENT_DATE ||
    "",

  logoUrl:
    env.VITE_EVENT_LOGO ||
    "",

  primaryColor:
    env.VITE_PRIMARY_COLOR ||
    "#4B0082",

  secondaryColor:
    env.VITE_SECONDARY_COLOR ||
    "#7C3AED",

  adminName:
    env.VITE_ADMIN_NAME ||
    "Event Administrator",
};


/* =========================
   SESSION
   ========================= */

export function getStoredSession() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "eventra_session"
      ) || "null"
    );
  } catch {
    return null;
  }
}


export function saveSession(session) {
  localStorage.setItem(
    "eventra_session",
    JSON.stringify(session)
  );

  /*
   * Also store token separately.
   * This makes it easier for other
   * Eventra modules to access it.
   */
  if (session?.token) {
    localStorage.setItem(
      "eventra_token",
      session.token
    );
  }
}


export function clearSession() {
  localStorage.removeItem(
    "eventra_session"
  );

  localStorage.removeItem(
    "eventra_token"
  );

  localStorage.removeItem(
    "token"
  );
}
