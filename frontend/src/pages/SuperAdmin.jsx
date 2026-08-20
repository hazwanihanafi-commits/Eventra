import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { APP_CONFIG } from "../config";

export default function SuperAdmin() {
  const { session } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ eventId: "", eventName: "", organisation: "", eventDate: "", adminName: "", organiserEmail: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadEvents() {
    const res = await fetch(`${APP_CONFIG.apiUrl}?action=adminEvents&token=${encodeURIComponent(session.token)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Unable to load events");
    setEvents(data.events || []);
  }

  useEffect(() => { loadEvents().catch(e => setMessage(e.message)); }, []);

  function update(key, value) { setForm(f => ({ ...f, [key]: value })); }

  async function create() {
    setBusy(true); setMessage("");
    try {
      const res = await fetch(APP_CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createEvent", token: session.token, ...form }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to create event");

      let extra = "";
      if (form.organiserEmail) {
        const userRes = await fetch(APP_CONFIG.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "createOrganiser", token: session.token, eventId: form.eventId, email: form.organiserEmail }),
        });
        const userData = await userRes.json();
        if (!userData.success) throw new Error(userData.message || "Event created but organiser account failed");
        extra = ` Organiser login: ${userData.email} / temporary password: ${userData.temporaryPassword}`;
      }
      setMessage(`Event created successfully.${extra}`);
      setForm({ eventId: "", eventName: "", organisation: "", eventDate: "", adminName: "", organiserEmail: "" });
      await loadEvents();
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  }

  return <div style={{ maxWidth: 1100, margin: "0 auto" }}>
    <h1>Super Admin</h1>
    <p style={{ color: "#666" }}>Create events and organiser workspaces.</p>
    {message && <div style={{ padding: 12, borderRadius: 10, background: "#F5F3FF", color: "#4B0082", marginBottom: 16 }}>{message}</div>}

    <div style={{ background: "#fff", padding: 22, borderRadius: 16, boxShadow: "0 5px 25px rgba(0,0,0,.06)", marginBottom: 25 }}>
      <h2>Create New Event</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
        {[['eventId','Event ID'],['eventName','Event Name'],['organisation','Organisation'],['eventDate','Event Date'],['adminName','Admin Name'],['organiserEmail','Organiser Email']].map(([key,label]) =>
          <label key={key} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600 }}>
            {label}<input value={form[key]} onChange={e => update(key,e.target.value)} style={input} placeholder={label} />
          </label>
        )}
      </div>
      <button onClick={create} disabled={busy} style={button}>{busy ? "Creating…" : "Create Event & Workspace"}</button>
    </div>

    <div style={{ background: "#fff", padding: 22, borderRadius: 16, boxShadow: "0 5px 25px rgba(0,0,0,.06)" }}>
      <h2>Events</h2>
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{['Event ID','Event','Organisation','Date','Spreadsheet','Status'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>
        {events.map(e => <tr key={e.eventId}><td style={td}>{e.eventId}</td><td style={td}>{e.eventName}</td><td style={td}>{e.organisation}</td><td style={td}>{e.eventDate}</td><td style={td}>{e.spreadsheetId ? 'Connected' : '—'}</td><td style={td}>{e.status}</td></tr>)}
      </tbody></table></div>
    </div>
  </div>;
}

const input = { padding: 11, border: "1px solid #ddd", borderRadius: 10, outline: "none" };
const button = { marginTop: 18, padding: "12px 18px", border: 0, borderRadius: 10, color: "#fff", background: "linear-gradient(135deg,#4B0082,#7C3AED)", fontWeight: 700, cursor: "pointer" };
const th = { textAlign: "left", padding: 10, borderBottom: "2px solid #eee", fontSize: 13 };
const td = { padding: 10, borderBottom: "1px solid #eee", fontSize: 13 };
