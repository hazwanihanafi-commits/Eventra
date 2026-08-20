/**
 * Eventra API helper.
 * All requests carry eventId so each organiser only accesses its own event.
 */
const API_URL = import.meta.env.VITE_API_URL || "";

export async function api(action, params = {}, options = {}) {
  const eventId =
    params.eventId ||
    localStorage.getItem("eventra_event_id") ||
    "";

  const query = new URLSearchParams({
    action,
    eventId,
    ...Object.fromEntries(
      Object.entries(params).filter(([k, v]) => k !== "eventId" && v !== undefined)
    ),
  });

  const response = await fetch(`${API_URL}?${query.toString()}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) throw new Error(`Eventra API error: ${response.status}`);
  return response.json();
}
