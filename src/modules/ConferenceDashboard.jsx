import React from "react";

const cards = [
  ["Participants", "0", "👥"],
  ["Paid", "0", "💳"],
  ["Submissions", "0", "📄"],
  ["Under Review", "0", "🔍"],
  ["Accepted", "0", "✅"],
  ["Checked In", "0", "📱"],
  ["Certificates", "0", "📜"],
];

export default function ConferenceDashboard({ event }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{event?.eventName || "Event Dashboard"}</h1>
          <p>{event?.organisation || "Eventra"} · {event?.eventDate || ""}</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map(([label, value, icon]) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon">{icon}</div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="workflow-card">
        <h2>Conference Workflow</h2>
        <div className="workflow">
          {[
            "Registration",
            "Payment",
            "Submission",
            "Reviewer Assignment",
            "Review",
            "Decision",
            "Notification",
            "Programme",
            "Attendance",
            "Certificate",
          ].map((step, i) => (
            <div className="workflow-step" key={step}>
              <span>{i + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
