import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import { getParticipants } from "../services/api";

export default function Reports() {
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
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const totalParticipants = participants.length;

  const checkedIn = participants.filter(
    (p) => p.checkin && p.checkin !== ""
  ).length;

  const pending = totalParticipants - checkedIn;

  const attendance =
    totalParticipants === 0
      ? 0
      : Math.round((checkedIn / totalParticipants) * 100);

  const organizations = useMemo(() => {
    const counts = {};

    participants.forEach((p) => {
      const org = p.organization || "Unknown";

      counts[org] = (counts[org] || 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [participants]);


  const countries = useMemo(() => {
  const counts = {};

  participants.forEach((p) => {
    const country = p.country || "Unknown";
    counts[country] = (counts[country] || 0) + 1;
  });

  return Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
  );
}, [participants]);

   const totalCountries = countries.length;

  function exportCSV() {
    const rows = [
      [
  "ID",
  "Name",
  "Email",
  "Phone",
  "Organization",
  "Country",
  "Status",
  "Check In",
      ],
    ];

    participants.forEach((p) => {
      rows.push([
  p.id,
  p.name,
  p.email,
  p.phone,
  p.organization,
  p.country,
  p.status,
  p.checkin,
]);
    });

    const csv = rows
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "Participant_Report.csv";
    a.click();
  }

  return (
    <MainLayout>
      <div
        style={{
          padding: 30,
          background: "#F5F7FB",
          minHeight: "100vh",
        }}
      >
        <h1
          style={{
            color: "#4B0082",
            marginBottom: 5,
          }}
        >
          📊 Registration Report
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: 30,
          }}
        >
          Participant Registration Summary
        </p>

        {/* KPI CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <Card
            title="👥 Total Participants"
            value={totalParticipants}
            color="#4B0082"
          />

          <Card
            title="✅ Checked In"
            value={checkedIn}
            color="#2E8B57"
          />

          <Card
            title="⏳ Pending"
            value={pending}
            color="#F39C12"
          />

          <Card
            title="🏢 Organizations"
            value={organizations.length}
            color="#1976D2"
          />

          <Card
  title="🌍 Total Countries"
  value={totalCountries}
  color="#009688"
/>
        </div>

        {/* ATTENDANCE */}

        <div
          style={{
            background: "white",
            borderRadius: 15,
            padding: 25,
            marginBottom: 30,
            boxShadow:
              "0 2px 10px rgba(0,0,0,.08)",
          }}
        >
          <h2
            style={{
              color: "#4B0082",
            }}
          >
            Attendance Progress
          </h2>

          <div
            style={{
              marginTop: 20,
              background: "#EEE",
              borderRadius: 50,
              height: 28,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: attendance + "%",
                background: "#4B0082",
                height: "100%",
              }}
            />
          </div>

          <h2
            style={{
              color: "#4B0082",
              marginTop: 15,
            }}
          >
            {attendance}% Attendance
          </h2>

          <p
            style={{
              color: "#666",
            }}
          >
            {checkedIn} of {totalParticipants}
            {" "}participants have checked in.
          </p>
        </div>

                {/* ORGANIZATION & RECENT PARTICIPANTS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr",
            gap: 20,
            marginBottom: 30,
          }}
        >
          {/* Organization Summary */}

          <div
            style={{
              background: "white",
              borderRadius: 15,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,.08)",
            }}
          >
            <h2
              style={{
                color: "#4B0082",
                marginBottom: 15,
              }}
            >
              🏢 Organization Summary
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                {organizations.map(([org, total]) => (
                  <tr key={org}>
                    <td
                      style={{
                        padding: 10,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {org}
                    </td>

                    <td
                      style={{
                        padding: 10,
                        textAlign: "right",
                        borderBottom: "1px solid #eee",
                        fontWeight: "bold",
                        color: "#4B0082",
                      }}
                    >
                      {total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
  style={{
    background: "white",
    borderRadius: 15,
    padding: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,.08)",
  }}
>
  <h2
    style={{
      color: "#4B0082",
      marginBottom: 15,
    }}
  >
    🌍 Country Summary
  </h2>

  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
    }}
  >
    <tbody>
      {countries.map(([country, total]) => (
        <tr key={country}>
          <td
            style={{
              padding: 10,
              borderBottom: "1px solid #eee",
            }}
          >
            {country}
          </td>

          <td
            style={{
              padding: 10,
              textAlign: "right",
              borderBottom: "1px solid #eee",
              fontWeight: "bold",
              color: "#4B0082",
            }}
          >
            {total}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          {/* Latest Participants */}

          <div
            style={{
              background: "white",
              borderRadius: 15,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,.08)",
            }}
          >
            <h2
              style={{
                color: "#4B0082",
                marginBottom: 15,
              }}
            >
              👥 Latest Participants
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#4B0082",
                    color: "white",
                  }}
                >
                  <th style={cell}>ID</th>
<th style={cell}>Name</th>
<th style={cell}>Organization</th>
<th style={cell}>Country</th>
<th style={cell}>Tag Category</th>
<th style={cell}>Status</th>
<th style={cell}>Check In</th>
                </tr>
              </thead>

              <tbody>
                {participants
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((p) => (
                    <tr key={p.id}>
                      <td style={cell}>{p.id}</td>
<td style={cell}>{p.name}</td>
<td style={cell}>{p.organization}</td>
<td style={cell}>{p.country}</td>

<td style={cell}>
  <span
    style={{
      background: "#E8F0FE",
      color: "#1976D2",
      padding: "4px 10px",
      borderRadius: "20px",
      fontWeight: "600",
      fontSize: "13px"
    }}
  >
    {p.tagCategory}
  </span>
</td>

<td style={cell}>
  {p.checkin ? (
                          <span
                            style={{
                              color: "green",
                              fontWeight: "bold",
                            }}
                          >
                            ✅ Checked In
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#E67E22",
                              fontWeight: "bold",
                            }}
                          >
                            Pending
                          </span>
                        )}
                      </td>

                      <td style={cell}>
                        {p.checkin
                          ? new Date(
                              p.checkin
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTION BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: 15,
          }}
        >
          <button
            style={purpleButton}
            onClick={exportCSV}
          >
            📥 Export CSV
          </button>

          <button
            style={greenButton}
            onClick={() => window.print()}
          >
            🖨 Print Report
          </button>
        </div>

        {loading && (
          <p
            style={{
              marginTop: 25,
            }}
          >
            Loading report...
          </p>
        )}

      </div>

    </MainLayout>

  );
}

/* ---------- KPI CARD ---------- */

function Card({ title, value, color }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 15,
        padding: 25,
        borderTop: `6px solid ${color}`,
        boxShadow: "0 2px 10px rgba(0,0,0,.08)",
      }}
    >
      <h3
        style={{
          color: "#666",
          marginBottom: 10,
          fontSize: 16,
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          color,
          margin: 0,
          fontSize: 42,
        }}
      >
        {value}
      </h1>
    </div>
  );
}

/* ---------- COMMON STYLES ---------- */

const cell = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
};

const purpleButton = {
  background: "#4B0082",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "12px 20px",
  cursor: "pointer",
  fontWeight: "bold",
};

const greenButton = {
  background: "#2E8B57",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "12px 20px",
  cursor: "pointer",
  fontWeight: "bold",
};
