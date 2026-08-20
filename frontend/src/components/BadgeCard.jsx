import { useEvent } from "../context/EventContext";
import "../pages/Badge.css";

export default function BadgeCard({ participant }) {

  const { event } = useEvent();

  if (!participant) return null;

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

  const nameFont =
    participant.name.length > 24
      ? 24
      : participant.name.length > 18
      ? 28
      : 32;

  return (

    <div
      className="badge"
      style={{
        width: "90mm",
        height: "140mm",
        margin: "15px auto",
        borderRadius: 18,
        overflow: "hidden",
        border: "3px solid #4B0082",
        background: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,.25)",
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "flex",
        flexDirection: "column",
        pageBreakAfter: "always"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          background:
            "linear-gradient(180deg,#4B0082 0%,#5E35B1 100%)",
          color: "#fff",
          textAlign: "center",
          padding: "2px 8px",
          borderRadius: 14,
        }}
      >

        <div
          style={{
            display: "inline-block",
            background: "#fff",
            padding: "4px 10px",
            borderRadius: 12,
            margin: "0 auto 8px",
            boxShadow: "0 3px 8px rgba(0,0,0,.15)",
          }}
        >
          <img
            src={event.logoUrl || ""}
            alt="Event logo"
            style={{
              width:120,
              display:"block"
            }}
          />
        </div>

        <h1
          style={{
            margin:0,
            fontSize:26,
            fontWeight:800
          }}
        >
          {event.eventName}
        </h1>

        <div
          style={{
            width:70,
            height:3,
            background:"#FFC107",
            margin:"10px auto"
          }}
        />

        <div
          style={{
            fontSize:13,
            lineHeight:1.3
          }}
        >
          21st International Conference on
          <br/>
          Environmental Ergonomics
        </div>

      </div>

      {/* BODY */}

      <div
        style={{
          flex:1,
          display:"flex",
          flexDirection:"column",
          justifyContent:"space-evenly",
          alignItems:"center",
          padding:8
        }}
      >

        <div
          style={{
            background:badgeColor,
            color:"#fff",
            padding:"6px 22px",
            borderRadius:30,
            fontWeight:"bold"
          }}
        >
          {(participant.tagCategory || "Participant").toUpperCase()}
        </div>

        <h2
          style={{
            color:"#4B0082",
            fontSize:nameFont,
            textAlign:"center",
            margin:0
          }}
        >
          {participant.name}
        </h2>

        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${participant.id}`}
          alt="Event logo"
          style={{
            width:100,
            height:100
          }}
        />

        <div
          style={{
            color:"#4B0082",
            fontSize:20,
            fontWeight:"bold",
            letterSpacing:2
          }}
        >
          {participant.id}
        </div>

        <img
          src={event.logoUrl || ""}
          alt="Event logo"
          style={{
            width:40
          }}
        />

      </div>

      {/* FOOTER */}

      <div
        style={{
          background:"#F5F5F5",
          borderTop:"1px solid #DDD",
          padding:3,
          textAlign:"center",
          fontSize:10
        }}
      >
        {event.eventName} • {event.organisation}
      </div>

    </div>

  );

}
