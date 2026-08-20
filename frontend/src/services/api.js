import { APP_CONFIG, getStoredSession } from "../config";

function buildUrl(action, extra = {}) {
  const session = getStoredSession();
  const eventId = session?.event?.eventId || APP_CONFIG.defaultEventId;
  const params = new URLSearchParams({ action, eventId, token: session?.token || "", ...extra });
  return `${APP_CONFIG.apiUrl}?${params.toString()}`;
}

async function fetchAPI(url, options = {}) {
  try {
    const session = getStoredSession();
    const headers = { ...(options.headers || {}) };
    if (session?.token) headers.Authorization = `Bearer ${session.token}`;
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
}

export function getSummary() { return fetchAPI(buildUrl("stats")); }
export function getParticipants() { return fetchAPI(buildUrl("list", { t: Date.now() })); }
export function getParticipant(id) {
  const value = String(id ?? "").trim();
  const session = getStoredSession();
  const eventId = session?.event?.eventId || APP_CONFIG.defaultEventId;
  const params = new URLSearchParams({ id: value, eventId });
  if (APP_CONFIG.authMode !== "legacy") params.set("action", "participant");
  return fetchAPI(`${APP_CONFIG.apiUrl}?${params.toString()}`);
}
export function checkIn(id) { return fetchAPI(buildUrl("checkin", { id: String(id ?? "").trim() })); }
export function sendBadgeEmail(id) { return fetchAPI(buildUrl("sendBadgeEmail", { id })); }
export function sendAllCertificateEmails() { return fetchAPI(buildUrl("sendAllCertificateEmails")); }
