import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import MainLayout from "../layouts/MainLayout";
import { getParticipant, checkIn } from "../services/api";

export default function Scanner() {
  const [participant, setParticipant] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    let scanning = true;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 30,
          qrbox: {
            width: 400,
            height: 400,
          },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          if (!scanning) return;

          scanning = false;

          try {
            const qr = String(decodedText).trim();

            console.log("QR Scanned:", qr);

            setMessage("Searching participant...");

            await html5QrCode.stop();

            const person = await getParticipant(qr);

            console.log(person);

            if (!person.success) {
              setMessage("❌ Participant not found");

              setTimeout(() => {
                window.location.reload();
              }, 2500);

              return;
            }

            setMessage("Registering participant...");

            const result = await checkIn(person.id);

            console.log(result);

            if (result.success) {
              setParticipant({
                ...person,
                status: "Registered",
              });

              setMessage("✅ Registration Successful");
            } else {
              setMessage(result.message || "❌ Registration Failed");
            }

            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } catch (err) {
            console.error(err);

            setMessage("❌ " + err.message);

            setTimeout(() => {
              window.location.reload();
            }, 2500);
          }
        },
        () => {
          // Ignore scan errors
        }
      )
      .catch((err) => {
        console.error("Scanner Error:", err);
        setMessage("Unable to start camera.");
      });

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch(() => {});
    };
  }, []);

  return (
    <MainLayout>
      <div
        style={{
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1
          style={{
            color: "#4B0082",
            marginBottom: "20px",
          }}
        >
          QR Registration Scanner
        </h1>

        <div
          id="reader"
          style={{
            width: "850px",
            maxWidth: "100%",
            margin: "0 auto",
            border: "4px solid #4B0082",
            borderRadius: "20px",
            overflow: "hidden",
            background: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            padding: "15px",
          }}
        ></div>

        <h2
          style={{
            marginTop: "25px",
            color: "#4B0082",
          }}
        >
          {message}
        </h2>

        {participant && (
          <div
            style={{
              width: "500px",
              maxWidth: "100%",
              margin: "25px auto",
              background: "#ffffff",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
              textAlign: "left",
            }}
          >
            <h2
              style={{
                color: "#4B0082",
                marginBottom: "20px",
              }}
            >
              Participant Details
            </h2>

            <p>
              <strong>ID:</strong> {participant.id}
            </p>

            <p>
              <strong>Name:</strong> {participant.name}
            </p>

            <p>
              <strong>Email:</strong> {participant.email}
            </p>

            <p>
              <strong>Phone:</strong> {participant.phone}
            </p>

            <p>
              <strong>Organization:</strong> {participant.organization}
            </p>

            <p>
  <strong>Category:</strong>{" "}
  <span
    style={{
      background: "#E8F0FE",
      color: "#1976D2",
      padding: "4px 10px",
      borderRadius: "20px",
      fontWeight: "600",
    }}
  >
    {participant.tagCategory}
  </span>
</p>

<p>
  <strong>Country:</strong> {participant.country}
</p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                {participant.status}
              </span>
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
