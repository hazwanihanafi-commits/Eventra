import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import {
  generateCertificate,
  sendCertificate,
} from "../services/certificateApi";

import { sendBadgeEmail, getParticipants, sendAllCertificateEmails } from "../services/api";



export default function Participants() {

  const [participants, setParticipants] = useState([]);
  const [sendingAll, setSendingAll] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, []);

  async function loadParticipants() {

  try {

    const data = await getParticipants();

    console.log("PARTICIPANTS FROM SHEET:", data);

    setParticipants(data);

  } catch (error) {

    console.error("Unable to load participants:", error);

  }

}

  // ============================
  // SEND BADGE
  // ============================

  async function handleSendBadge(participant) {

    const result = await sendBadgeEmail(participant.id);

    if (result.success) {

      alert("Badge emailed successfully!");

      loadParticipants();

    } else {

      alert(result.message);

    }

  }

  // ============================
  // GENERATE CERTIFICATE
  // ============================

  async function handleGenerate(participant) {

    const result = await generateCertificate(participant.id);

    if (result.success) {

      alert("Certificate Generated!");

      if (result.pdfUrl) {
        window.open(result.pdfUrl, "_blank");
      }

      loadParticipants();

    } else {

      alert(result.message);

    }

  }

 // ============================
// SEND CERTIFICATE
// ============================

async function handleEmail(participant) {

  const result = await sendCertificate(participant.id);

  if (result.success) {

    alert("Certificate emailed successfully!");

    loadParticipants();

  } else {

    alert(result.message);

  }

}


// ============================
// SEND ALL CERTIFICATES
// ============================

async function handleSendAllCertificates() {

  const confirmed = window.confirm(
    "Send certificates to all eligible participants?\n\n" +
    "Participants who have already received their certificate will be skipped."
  );

  if (!confirmed) return;

  setSendingAll(true);

  try {

    alert("Sending certificates... Please wait.");

    const result = await sendAllCertificateEmails();

    if (result.success) {

      alert(
        "Certificate email process completed!\n\n" +
        `Sent: ${result.sent}\n` +
        `Skipped: ${result.skipped}\n` +
        `Failed: ${result.failed}`
      );

      await loadParticipants();

    } else {

      alert(
        result.message ||
        "Unable to send certificates."
      );

    }

  } catch (error) {

    console.error(error);

    alert(
      "Error sending certificates.\n\n" +
      error.message
    );

  } finally {

    setSendingAll(false);

  }
}

 return (
  <MainLayout>

    <h1>Participants</h1>

    {/* ============================
        TOP ACTION BUTTONS
    ============================ */}

    <div
      style={{
        marginBottom: 20,
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
      }}
    >

      {/* DOWNLOAD ALL BADGES */}

      <button
        style={{
          ...purpleBtn,
          fontSize: 16,
          padding: "12px 20px",
          marginLeft: 0,
        }}
        onClick={() =>
          window.open("/print-badges", "_blank")
        }
      >
        📄 Download All Badges (PDF)
      </button>


      {/* SEND ALL CERTIFICATES */}

      <button
        style={{
          ...blueBtn,
          fontSize: 16,
          padding: "12px 20px",
          marginLeft: 0,
          opacity: sendingAll ? 0.6 : 1,
          cursor: sendingAll
            ? "not-allowed"
            : "pointer",
        }}
        onClick={handleSendAllCertificates}
        disabled={sendingAll}
      >
        {sendingAll
          ? "⏳ Sending Certificates..."
          : "📧 Send All Certificates"}
      </button>

    </div>


    {/* ============================
        PARTICIPANTS TABLE
    ============================ */}

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: 20,
        background: "#fff",
      }}
    >

      <thead>

        <tr
          style={{
            background: "#4B0082",
            color: "#fff",
          }}
        >

          <th style={cell}>
            ID
          </th>

          <th style={cell}>
            Name
          </th>

          <th style={cell}>
            Organization
          </th>

          <th style={cell}>
            Tag Category
          </th>

          <th style={cell}>Status</th>
<th style={cell}>Certificate Email</th>
<th style={cell}>Email Date</th>
<th style={cell}>Actions</th>

        </tr>

      </thead>


      <tbody>

        {participants.map((p) => (

          <tr key={p.id}>

            <td style={cell}>
              {p.id}
            </td>


            <td style={cell}>
              {p.name}
            </td>


            <td style={cell}>
              {p.organization}
            </td>


            <td style={cell}>

              <span
                style={{
                  background:
                    p.tagCategory === "Participant"
                      ? "#E3F2FD"
                      : p.tagCategory ===
                        "Invited speaker"
                      ? "#F3E5F5"
                      : "#EEEEEE",

                  color:
                    p.tagCategory === "Participant"
                      ? "#1976D2"
                      : p.tagCategory ===
                        "Invited speaker"
                      ? "#8E24AA"
                      : "#616161",

                  padding: "6px 12px",

                  borderRadius: "20px",

                  fontWeight: "bold",

                  fontSize: "13px",

                  display: "inline-block",

                  minWidth: "120px",

                  textAlign: "center",
                }}
              >
                {p.tagCategory || "Participant"}
              </span>

            </td>


            <td style={cell}>
  {p.status || "-"}
</td>

{/* ============================
    CERTIFICATE EMAIL STATUS
============================ */}

<td style={cell}>

  {String(p.emailSent || "").trim().toUpperCase() === "YES" ? (

    <span
      style={{
        background: "#E8F5E9",
        color: "#2E7D32",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "bold",
        fontSize: "13px",
        display: "inline-block",
      }}
    >
      ✅ Sent
    </span>

  ) : (

    <span
      style={{
        background: "#FFF3E0",
        color: "#EF6C00",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "bold",
        fontSize: "13px",
        display: "inline-block",
      }}
    >
      ⏳ Not Sent
    </span>

  )}

</td>

{/* ============================
    EMAIL DATE
============================ */}

<td style={cell}>

  {p.emailDate
    ? new Date(p.emailDate).toLocaleString("en-MY", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"
  }

</td>

<td style={cell}>

              {/* =================
                  BADGE
              ================= */}

              <Link to={`/badge/${p.id}`}>

                <button style={purpleBtn}>
                  🎫 View Badge
                </button>

              </Link>


              {p.badgeSent === "YES" ? (

                <button
                  style={greyBtn}
                  disabled
                >
                  ✅ Badge Sent
                </button>

              ) : (

                <button
                  style={orangeBtn}
                  onClick={() =>
                    handleSendBadge(p)
                  }
                >
                  📧 Send Badge
                </button>

              )}


              {/* =================
                  CERTIFICATE
              ================= */}

              {p.generated === "YES" ? (

                <button
                  style={purpleBtn}
                  onClick={() =>
                    window.open(
                      p.pdfUrl,
                      "_blank"
                    )
                  }
                >
                  📄 View PDF
                </button>

              ) : (

                <button
                  style={greenBtn}
                  onClick={() =>
                    handleGenerate(p)
                  }
                >
                  🎓 Generate
                </button>

              )}


             {String(p.emailSent || "").trim().toUpperCase() === "YES" ? (

  <div
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      background: "#E8F5E9",
      color: "#2E7D32",
      padding: "7px 12px",
      borderRadius: "6px",
      marginLeft: 8,
      marginBottom: 5,
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    <div>
      ✅ Certificate Sent
    </div>

    {p.emailDate && (
      <div
        style={{
          fontSize: "10px",
          fontWeight: 500,
          marginTop: 3,
        }}
      >
        {new Date(p.emailDate).toLocaleString(
          "en-MY",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}
      </div>
    )}

  </div>

) : (

  <button
    style={blueBtn}
    onClick={() => handleEmail(p)}
  >
    📧 Email Certificate
  </button>

)}

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </MainLayout>
);
}

// ============================
// Styles
// ============================

const cell = {
  border: "1px solid #ddd",
  padding: "12px",
};

const baseButton = {
  marginLeft: 8,
  marginBottom: 5,
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  cursor: "pointer",
  borderRadius: 4,
};

const purpleBtn = {
  ...baseButton,
  background: "#6A1B9A",
};

const orangeBtn = {
  ...baseButton,
  background: "#FF9800",
};

const greenBtn = {
  ...baseButton,
  background: "#4CAF50",
};

const blueBtn = {
  ...baseButton,
  background: "#1976D2",
};

const greyBtn = {
  ...baseButton,
  background: "#9E9E9E",
  cursor: "default",
};
