import React, { useEffect, useState } from "react";
import "./SuperAdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbwA6KrYSpGe4JakvrJP_avfLZ0o87SoL87XBk7ZSdY4H4rfoSXic1RUlor9tGhDrE-M1w/exec";

function getToken() {
  return (
    localStorage.getItem("eventra_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

async function api(action, payload = {}) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      token: getToken(),
      ...payload,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalOrganisers: 0,
  });
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    eventName: "",
    organisation: "",
    eventId: "",
    eventDate: "",
    organiserName: "",
    organiserEmail: "",
    organiserPassword: "",
  });

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await api("dashboardStats");
      setStats(data.stats);
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function updateField(e) {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  }

  async function createEvent(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = await api("createEventWithOrganiser", form);

      setMessage(
        `Event ${data.event.eventId} created successfully. Organiser account: ${data.organiser.email}`
      );

      setForm({
        eventName: "",
        organisation: "",
        eventId: "",
        eventDate: "",
        organiserName: "",
        organiserEmail: "",
        organiserPassword: "",
      });

      setShowForm(false);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="eventra-admin">
      <div className="eventra-admin-header">
        <div>
          <div className="eventra-kicker">EVENTRA</div>
          <h1>Super Admin Dashboard</h1>
          <p>Manage conferences, organisers and event workspaces.</p>
        </div>

        <button
          className="eventra-primary-btn"
          onClick={() => {
            setShowForm((value) => !value);
            setMessage("");
            setError("");
          }}
        >
          + Create New Event
        </button>
      </div>

      {message && <div className="eventra-alert success">{message}</div>}
      {error && <div className="eventra-alert error">{error}</div>}

      <div className="eventra-stat-grid">
        <div className="eventra-stat-card">
          <span>Total Events</span>
          <strong>{stats.totalEvents}</strong>
        </div>

        <div className="eventra-stat-card">
          <span>Active Events</span>
          <strong>{stats.activeEvents}</strong>
        </div>

        <div className="eventra-stat-card">
          <span>Organisers</span>
          <strong>{stats.totalOrganisers}</strong>
        </div>
      </div>

      {showForm && (
        <form className="eventra-form-card" onSubmit={createEvent}>
          <div className="eventra-form-heading">
            <h2>Create New Event</h2>
            <p>
              Eventra will create the event workspace and organiser account
              automatically.
            </p>
          </div>

          <div className="eventra-form-grid">
            <label>
              Event Name
              <input
                name="eventName"
                value={form.eventName}
                onChange={updateField}
                placeholder="International Conference 2027"
                required
              />
            </label>

            <label>
              Organisation
              <input
                name="organisation"
                value={form.organisation}
                onChange={updateField}
                placeholder="Universiti / Organisation"
                required
              />
            </label>

            <label>
              Event ID
              <input
                name="eventId"
                value={form.eventId}
                onChange={updateField}
                placeholder="ABC2027"
                required
              />
            </label>

            <label>
              Event Date
              <input
                name="eventDate"
                value={form.eventDate}
                onChange={updateField}
                placeholder="15–17 March 2027"
                required
              />
            </label>

            <label>
              Organiser Name
              <input
                name="organiserName"
                value={form.organiserName}
                onChange={updateField}
                placeholder="Conference Secretariat"
                required
              />
            </label>

            <label>
              Organiser Email
              <input
                type="email"
                name="organiserEmail"
                value={form.organiserEmail}
                onChange={updateField}
                placeholder="organiser@university.edu"
                required
              />
            </label>

            <label className="full">
              Temporary Password
              <input
                type="password"
                name="organiserPassword"
                value={form.organiserPassword}
                onChange={updateField}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
            </label>
          </div>

          <div className="eventra-form-actions">
            <button
              type="button"
              className="eventra-secondary-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="eventra-primary-btn"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Event & Organiser"}
            </button>
          </div>
        </form>
      )}

      <div className="eventra-section">
        <div className="eventra-section-title">
          <h2>Events</h2>
          <button onClick={loadDashboard} className="eventra-refresh-btn">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="eventra-empty">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="eventra-empty">
            No events yet. Create your first event.
          </div>
        ) : (
          <div className="eventra-table-wrap">
            <table className="eventra-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event</th>
                  <th>Organisation</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Workspace</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.eventId}>
                    <td>
                      <strong>{event.eventId}</strong>
                    </td>
                    <td>{event.eventName}</td>
                    <td>{event.organisation}</td>
                    <td>{event.eventDate}</td>
                    <td>
                      <span className="eventra-status">
                        {event.status || "ACTIVE"}
                      </span>
                    </td>
                    <td>
                      {event.spreadsheetId ? (
                        <span className="eventra-linked">Linked</span>
                      ) : (
                        <span className="eventra-unlinked">Not linked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
