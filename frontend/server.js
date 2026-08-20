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
   HEALTH
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Eventra API",
    status: "online",
  });
});


/* =========================
   GET → GOOGLE APPS SCRIPT
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
      ...req.query,
    });

    const url =
      `${APPS_SCRIPT_URL}?${params.toString()}`;

    console.log(
      "GET Apps Script:",
      action
    );

    const response = await fetch(url);

    const text = await response.text();

    console.log(
      "Apps Script response:",
      text.substring(0, 500)
    );

    if (!text) {
      return res.status(502).json({
        success: false,
        message: "Apps Script returned an empty response.",
      });
    }

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message: "Apps Script returned invalid JSON.",
        raw: text.substring(0, 500),
      });
    }

    return res.json(result);

  } catch (error) {

    console.error(
      "GET proxy error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =========================
   POST → GOOGLE APPS SCRIPT
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
      ...req.body,
    };

    console.log(
      "POST Apps Script:",
      action
    );

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

    const text =
      await response.text();

    console.log(
      "Apps Script response:",
      text.substring(0, 500)
    );

    if (!text) {
      return res.status(502).json({
        success: false,
        message: "Apps Script returned an empty response.",
      });
    }

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message: "Apps Script returned invalid JSON.",
        raw: text.substring(0, 500),
      });
    }

    return res.json(result);

  } catch (error) {

    console.error(
      "POST proxy error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/* =========================
   REACT FRONTEND
========================= */

const distPath =
  path.join(__dirname, "dist");

app.use(
  express.static(distPath)
);


/* =========================
   REACT ROUTER
========================= */

app.get("/{*splat}", (req, res) => {

  res.sendFile(
    path.join(
      distPath,
      "index.html"
    )
  );

});


/* =========================
   START
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Eventra running on port ${PORT}`
    );

  }
);
