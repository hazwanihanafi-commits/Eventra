import { APP_CONFIG, getStoredSession } from "../config";

/*
 * Eventra API
 *
 * Browser → Render API → Google Apps Script
 *
 * Do NOT call Google Apps Script directly from the browser.
 */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "/api";


function getToken() {
  const session = getStoredSession();

  return (
    session?.token ||
    localStorage.getItem("eventra_token") ||
    ""
  );
}


function getEventId() {
  const session = getStoredSession();

  return (
    session?.event?.eventId ||
    session?.eventId ||
    APP_CONFIG.defaultEventId ||
    ""
  );
}


/* =========================
   CENTRAL API REQUEST
   ========================= */

async function fetchAPI(action, payload = {}) {
  try {
    const token = getToken();
    const eventId = getEventId();

    const response = await fetch(
      `${API_BASE}/${action}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          action,
          eventId,
          token,
          ...payload,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const result =
      await response.json();

    if (!result.success) {
      throw new Error(
        result.error ||
        result.message ||
        "Eventra request failed."
      );
    }

    return result;

  } catch (error) {
    console.error(
      `Eventra API Error [${action}]:`,
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Unable to connect to Eventra.",
    };
  }
}


/* =========================
   AUTH
   ========================= */

export function login(email, password) {
  return fetchAPI("login", {
    email: String(email || "")
      .trim()
      .toLowerCase(),

    password,
  });
}


/* =========================
   DASHBOARD
   ========================= */

export function getSummary() {
  return fetchAPI("stats");
}


/* =========================
   PARTICIPANTS
   ========================= */

export function getParticipants() {
  return fetchAPI("participants");
}


export function getParticipant(id) {
  return fetchAPI("participant", {
    id: String(id ?? "").trim(),
  });
}


/* =========================
   ATTENDANCE
   ========================= */

export function checkIn(id) {
  return fetchAPI("checkin", {
    id: String(id ?? "").trim(),
  });
}


/* =========================
   BADGE
   ========================= */

export function sendBadgeEmail(id) {
  return fetchAPI("sendBadgeEmail", {
    id: String(id ?? "").trim(),
  });
}


/* =========================
   CERTIFICATE
   ========================= */

export function sendAllCertificateEmails() {
  return fetchAPI(
    "sendAllCertificateEmails"
  );
}


/* =========================
   EVENTRA ADMIN
   ========================= */

export function getAdminDashboard() {
  return fetchAPI("dashboardStats");
}


export function createEvent(data) {
  return fetchAPI(
    "createEventWithOrganiser",
    data
  );
}
