
import { APP_CONFIG, getStoredSession } from "../config";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getSession() {
  return getStoredSession() || {};
}

function getToken() {
  return getSession()?.token || "";
}

function getEventId() {
  const session = getSession();
  return session?.event?.eventId || APP_CONFIG.defaultEventId || "";
}

/* GET REQUEST */

async function getAPI(action, extra = {}) {
  try {
    const params = new URLSearchParams({
      eventId: getEventId(),
      token: getToken(),
      ...extra,
    });

    const response = await fetch(
      `${API_BASE}/${action}?${params.toString()}`
    );

    const text = await response.text();

    if (!text) {
      throw new Error("Empty response from Eventra server.");
    }

    const result = JSON.parse(text);

    if (!result.success) {
      throw new Error(result.message || result.error || "Request failed.");
    }

    return result;
  } catch (error) {
    console.error(`Eventra GET Error [${action}]`, error);

    return {
      success: false,
      message: error.message,
    };
  }
}

/* POST REQUEST */

async function postAPI(action, payload = {}) {
  try {
    const response = await fetch(`${API_BASE}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: getToken(),
        eventId: getEventId(),
        ...payload,
      }),
    });

    const text = await response.text();

    if (!text) {
      throw new Error("Empty response from Eventra server.");
    }

    const result = JSON.parse(text);

    if (!result.success) {
      throw new Error(result.message || result.error || "Request failed.");
    }

    return result;
  } catch (error) {
    console.error(`Eventra POST Error [${action}]`, error);

    return {
      success: false,
      message: error.message,
    };
  }
}

/* AUTH */

export function login(email, password) {
  return postAPI("login", {
    email,
    password,
  });
}

export function logout() {
  return postAPI("logout");
}

/* DASHBOARD */

export function getSummary() {
  return getAPI("stats");
}

/* PARTICIPANTS */

export function getParticipants() {
  return getAPI("list");
}

export function getParticipant(id) {
  return getAPI("participant", { id });
}

export function checkIn(id) {
  return getAPI("checkin", { id });
}

export function sendBadgeEmail(id) {
  return getAPI("sendBadgeEmail", { id });
}

export function sendAllCertificateEmails() {
  return getAPI("sendAllCertificateEmails");
}

/* SUPER ADMIN */

export function getAdminDashboard() {
  return getAPI("adminEvents");
}

export function createEvent(data) {
  return postAPI("createEvent", data);
}

export function createOrganiser(data) {
  return postAPI("createOrganiser", data);
}
