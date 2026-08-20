import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEvent } from "../context/EventContext";
import { getParticipant } from "../services/api";
import "./Badge.css";


export default function Badge() {
  const { id } = useParams();
  const { event } = useEvent();

  const [participant, setParticipant] = useState(null);
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    loadParticipant();
  }, []);

  async function loadParticipant() {
    try {
      const data = await getParticipant(id);
      setParticipant(data);
    } catch (err) {
      console.error("Unable to load participant", err);
    }
  }

  useEffect(() => {
    if (participant && !printed) {
      setPrinted(true);

      setTimeout(() => {
        window.print();
      }, 700);
    }
  }, [participant, printed]);

  if (!participant) {
    return (
      <div
        style={{
          padding: 60,
          textAlign: "center",
          fontSize: 22,
          fontWeight: "bold",
          color: "#4B0082",
        }}
      >
        Loading badge...
      </div>
    );
  }

  // =========================
  // CATEGORY COLOURS
  // =========================

  const categoryColors = {
    VIP: "#C62828",
    Committee: "#2E7D32",
    Sponsor: "#EF6C00",
    Exhibitor: "#00897B",
    "Invited Speaker": "#7B1FA2",
    "Invited speaker": "#7B1FA2",
  };

  const badgeColor =
    categoryColors[participant.tagCategory] || "#1565C0";

  // =========================
  // NAME SIZE
  // =========================

  const nameLength = participant.name
    ? participant.name.length
    : 0;

  const nameFont =
    nameLength > 24
      ? 22
      : nameLength > 18
      ? 26
      : 29;

  return (
    <div
      className="badge"
      style={{
        width: "90mm",
        height: "130mm",
        margin: "15px auto",

        borderRadius: 18,
        overflow: "hidden",

        border: "3px solid #4B0082",
        background: "#fff",

        boxShadow: "0 8px 20px rgba(0,0,0,.25)",

        fontFamily: "Arial, Helvetica, sans-serif",

        display: "flex",
        flexDirection: "column",

        boxSizing: "border-box",
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
  style={{
    background: "#4B0082",
    color: "#fff",
    textAlign: "center",
    padding: "5px 8px 8px",
    borderRadius: "14px 14px 0 0",
    flexShrink: 0,
  }}
>

        {/* =========================
            USM LOGO
        ========================= */}

        <div
          style={{
            background: "#fff",

            width: 165,

            height: 42,

            margin: "0 auto 5px",

            borderRadius: 10,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            overflow: "hidden",
          }}
        >
          <img
            src={event.logoUrl || ""}
            alt="Event logo"
            style={{
              width: 150,
              height: "auto",

              maxHeight: 38,

              display: "block",

              objectFit: "contain",
            }}
          />
        </div>

        {/* =========================
            {event.eventName}
        ========================= */}

        <h1
          style={{
            margin: "0",

            fontSize: 25,

            fontWeight: 800,

            letterSpacing: 1,

            lineHeight: 1,
          }}
        >
          {event.eventName}
        </h1>

        {/* =========================
            YELLOW LINE
        ========================= */}

        <div
          style={{
            width: 60,
            height: 3,

            background: "#FFC107",

            borderRadius: 3,

            margin: "5px auto 6px",
          }}
        />

        {/* =========================
            CONFERENCE TITLE
        ========================= */}

        <div
          style={{
            fontSize: 12,

            lineHeight: 1.25,

            fontWeight: 500,
          }}
        >
          {event.organisation}
        </div>

      </div>


      {/* =====================================================
          BODY
      ===================================================== */}

     <div
  style={{
    flex: "1 1 auto",
    minHeight: 0,
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    overflow: "hidden",
    gap: 4,
  }}
>
        {/* =========================
            PARTICIPANT CATEGORY
        ========================= */}

        <div
  style={{
    background: badgeColor,
    color: "#fff",
    padding: "5px 20px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 2,
    boxShadow: "0 3px 8px rgba(0,0,0,.15)",
    flexShrink: 0,
  }}
>
  {(participant.tagCategory || "PARTICIPANT").toUpperCase()}
</div>


        {/* =========================
            PARTICIPANT NAME
        ========================= */}

        <h2
  style={{
    color: "#4B0082",
    fontSize: nameFont,
    fontWeight: 800,
    textTransform: "uppercase",
    lineHeight: 1.05,
    letterSpacing: 1,
    margin: "0 0 3px",
    wordBreak: "break-word",
    flexShrink: 0,
  }}
>
  {participant.name}
</h2>


        {/* =========================
            QR CODE
        ========================= */}

        <div
  style={{
    background: "#fff",
    padding: 5,
    borderRadius: 10,
    border: "2px solid #E0E0E0",
    boxShadow: "0 3px 8px rgba(0,0,0,.08)",
    flexShrink: 0,
  }}
>
  <img
    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      participant.id
    )}`}
    alt="QR Code"
    style={{
      width: 92,
      height: 92,
      display: "block",
    }}
  />
</div>

        {/* =========================
            PARTICIPANT ID
        ========================= */}

<div
  style={{
    marginTop: 2,
    color: "#4B0082",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
    lineHeight: 1,
    flexShrink: 0,
  }}
>
  {participant.id}
</div>

{/* ICEE Logo */}
<img
  src={event.logoUrl || ""}
  alt="Event logo"
  style={{
    width: 48,
    height: "auto",
    marginTop: 2,
    display: "block",
    objectFit: "contain",
    flexShrink: 0,
  }}
/>
      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        style={{
          flexShrink: 0,

          height: "9mm",

          boxSizing: "border-box",

          background: "#F5F5F5",

          borderTop: "1px solid #DDD",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          textAlign: "center",

          fontSize: 8,

          fontWeight: 600,

          color: "#666",

          letterSpacing: 0.2,

          padding: "2px 4px",
        }}
      >
        {event.eventName} • {event.organisation}
      </div>

    </div>
  );
}
