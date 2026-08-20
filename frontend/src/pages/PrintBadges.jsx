import { useEffect, useState } from "react";
import BadgeCard from "../components/BadgeCard";
import "./PrintBadges.css";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getParticipants } from "../services/api";


export default function PrintBadges() {

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();
  }, []);

  async function loadParticipants() {

    try {

      const data = await getParticipants();

      setParticipants(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    if (!loading && participants.length > 0) {

      setTimeout(() => {

        downloadPDF();

      }, 1500);

    }

  }, [loading, participants]);

  if (loading) {

    return (

      <div
        style={{
          padding:50,
          textAlign:"center",
          fontSize:24,
          fontWeight:"bold"
        }}
      >
        Preparing badges...
      </div>

    );

  }

  return (

  <>

    {/* Toolbar */}
    <div
      className="no-print"
      style={{
        position: "sticky",
        top: 0,
        background: "#fff",
        padding: "15px",
        textAlign: "center",
        borderBottom: "1px solid #ddd",
        zIndex: 9999,
      }}
    >

      <button
        onClick={() => window.print()}
        style={{
          background: "#4B0082",
          color: "#fff",
          border: "none",
          padding: "12px 24px",
          borderRadius: 8,
          cursor: "pointer",
          marginRight: 10,
          fontWeight: "bold",
        }}
      >
        📄 Save as PDF
      </button>

      <button
        onClick={() => window.history.back()}
        style={{
          background: "#666",
          color: "#fff",
          border: "none",
          padding: "12px 24px",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        ⬅ Back
      </button>

    </div>

    <div className="print-container">

      {participants.map((participant) => (

        <div
          className="print-page"
          key={participant.id}
        >

          <BadgeCard participant={participant} />

        </div>

      ))}

    </div>

  </>

);

}
