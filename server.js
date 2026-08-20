import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const PORT = process.env.PORT || 10000;

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* =========================
   MIDDLEWARE
   ========================= */

app.use(
  cors({
    origin: true,
  })
);

app.use(express.json());


/* =========================
   HEALTH CHECK
   ========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Eventra API",
    status: "online",
  });
});


/* =========================
   GET API PROXY
   ========================= */

app.get("/api/:action", async (req, res) => {
  try {
    if (!APPS_SCRIPT_URL) {
      return res.status(500).json({
        success: false,
        message: "APPS_SCRIPT_URL is not configured.",
      });
    }

    const action = req.params.action;

    const params = new URLSearchParams({
      action,
      ...(req.query || {}),
    });

    const url =
      `${APPS_SCRIPT_URL}?${params.toString()}`;

    console.log("GET → Apps Script:", action);

    const response = await fetch(url);

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      return res.status(502).json({
        success: false,
        message: "Invalid response from Apps Script.",
        raw: text,
      });
    }

    return res
      .status(response.ok ? 200 : response.status)
      .json(result);

  } catch (error) {
    console.error("GET proxy error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =========================
   POST API PROXY
   ========================= */

app.post("/api/:action", async (req, res) => {
  try {
    if (!APPS_SCRIPT_URL) {
      return res.status(500).json({
        success: false,
        message: "APPS_SCRIPT_URL is not configured.",
      });
    }

    const action = req.params.action;

    const payload = {
      action,
      ...(req.body || {}),
    };

    console.log("POST → Apps Script:", action);

    const response = await fetch(
      APPS_SCRIPT_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      return res.status(502).json({
        success: false,
        message: "Invalid response from Apps Script.",
        raw: text,
      });
    }

    return res
      .status(response.ok ? 200 : response.status)
      .json(result);

  } catch (error) {
    console.error("POST proxy error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =========================
   SERVE REACT FRONTEND
   ========================= */

const distPath =
  path.join(__dirname, "dist");

app.use(
  express.static(distPath)
);


/* =========================
   REACT ROUTER FALLBACK
   ========================= */

app.get("*", (req, res) => {
  res.sendFile(
    path.join(
      distPath,
      "index.html"
    )
  );
});


/* =========================
   START SERVER
   ========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Eventra server running on port ${PORT}`
    );
  }
);
