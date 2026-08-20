import React, { useEffect, useState } from "react";
import "./SuperAdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbwA6KrYSpGe4JakvrJP_avfLZ0o87SoL87XBk7ZSdY4H4rfoSXic1RUlor9tGhDrE-M1w/exec";

/* =========================
   EVENTRA API
   ========================= */

function getToken() {
  return localStorage.getItem("eventra_token") || "";
}

async function api(action, payload = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action,
        token: getToken(),
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  } catch (error) {
    console.error("Eventra API error:", error);
    throw error;
  }
}

/* =========================
   SUPER ADMIN DASHBOARD
   ========================= */

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

  /* =========================
     LOAD DASHBOARD
     ========================= */

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const data = await api("dashboardStats");

      setStats({
        totalEvents: data.stats?.totalEvents || 0,
        activeEvents: data.stats?.activeEvents || 0,
        totalOrganisers: data.stats?.totalOrganisers || 0,
      });

      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================
     FORM HANDLING
     ========================= */

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      eventName: "",
      organisation: "",
      eventId: "",
      eventDate: "",
      organiserName: "",
      organiserEmail: "",
      organiserPassword: "",
    });
  }

  /* =========================
     CREATE EVENT
     ========================= */

  async function createEvent(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (form.organiserPassword.length < 8) {
        throw new Error(
          "Organiser password must contain at least 8 characters."
        );
      }

      const data = await api("createEventWithOrganiser", {
        eventName: form.eventName.trim(),
        organisation: form.organisation.trim(),
        eventId: form.eventId.trim().toUpperCase(),
        eventDate: form.eventDate.trim(),
        organiserName: form.organiserName.trim(),
        organiserEmail: form.organiserEmail.trim(),
        organiserPassword: form.organiserPassword,
      });

      setMessage(
        `Event "${data.event.eventName}" created successfully. Organiser: ${data.organiser.email}`
      );

      resetForm();

      setShowForm(false);

      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create event.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     LOGOUT
     ========================= */

  function logout() {
    localStorage.removeItem("eventra_token");
    localStorage.removeItem("token");

    window.location.href = "/";
  }

  /* =========================
     UI
     ========================= */

  return (
    <div className="eventra-admin">
      {/* HEADER */}

      <div className="eventra-admin-header">
        <div>
          <div className="eventra-kicker">EVENTRA</div>

          <h1>Super Admin Dashboard</h1>

          <p>
            Manage conferences, organisers and event workspaces from one
            platform.
          </p>
        </div>

        <div className="eventra-header-actions">
          <button
            className="eventra-primary-btn"
            onClick={() => {
              setShowForm((current) => !current);
              setMessage("");
              setError("");
            }}
          >
            {showForm ? "Close Form" : "+ Create New Event"}
          </button>

          <button className="eventra-secondary-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* ALERTS */}

      {message && (
        <div className="eventra-alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="eventra-alert error">
          {error}
        </div>
      )}

      {/* STATISTICS */}

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

      {/* CREATE EVENT */}

      {showForm && (
        <form
          className="eventra-form-card"
          onSubmit={createEvent}
        >
          <div className="eventra-form-heading">
            <h2>Create New Event</h2>

            <p>
              Eventra will automatically create the event workspace and
              organiser account.
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
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="eventra-primary-btn"
              disabled={saving}
            >
              {saving
                ? "Creating Event..."
                : "Create Event & Organiser"}
            </button>
          </div>
        </form>
      )}

      {/* EVENTS */}

      <div className="eventra-section">
        <div className="eventra-section-title">
          <div>
            <h2>Events</h2>

            <p>
              All events managed through Eventra.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="eventra-refresh-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="eventra-empty">
            Loading Eventra data...
          </div>
        ) : events.length === 0 ? (
          <div className="eventra-empty">
            No events found.
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
                      <strong>
                        {event.eventId}
                      </strong>
                    </td>

                    <td>
                      {event.eventName}
                    </td>

                    <td>
                      {event.organisation}
                    </td>

                    <td>
                      {event.eventDate}
                    </td>

                    <td>
                      <span className="eventra-status">
                        {event.status || "ACTIVE"}
                      </span>
                    </td>

                    <td>
                      {event.spreadsheetId ? (
                        <span className="eventra-linked">
                          Linked
                        </span>
                      ) : (
                        <span className="eventra-unlinked">
                          Not Linked
                        </span>
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
