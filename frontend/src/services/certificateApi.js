import { APP_CONFIG, getStoredSession } from "../config";

function buildUrl(action, id = "") {
  const session = getStoredSession();
  const eventId = session?.event?.eventId || APP_CONFIG.defaultEventId;
  const params = new URLSearchParams({ action, eventId });
  if (id) params.set("id", id);
  return `${APP_CONFIG.apiUrl}?${params.toString()}`;
}

async function request(action, id = "") {
  const session = getStoredSession();
  const headers = session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  const response = await fetch(buildUrl(action, id), { headers });
  return response.json();
}

export function generateCertificate(id) { return request("generateCertificate", id); }
export function sendCertificate(id) { return request("sendCertificateEmail", id); }
