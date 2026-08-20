import express from "express";
import cors from "cors";

const app = express();

const PORT =
  process.env.PORT || 10000;

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL;


/* =========================
   MIDDLEWARE
   ========================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json()
);


/* =========================
   HEALTH CHECK
   ========================= */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      service: "Eventra API",
      status: "online",
    });
  }
);


/* =========================
   APPS SCRIPT PROXY
   ========================= */

app.post(
  "/api/:action",
  async (req, res) => {

    try {

      if (!APPS_SCRIPT_URL) {
        return res.status(500).json({
          success: false,
          message:
            "APPS_SCRIPT_URL is not configured.",
        });
      }

      const action =
        req.params.action;

      const payload = {
        action,
        ...req.body,
      };


      const response =
        await fetch(
          APPS_SCRIPT_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "text/plain;charset=utf-8",
            },

            body:
              JSON.stringify(payload),
          }
        );


      const text =
        await response.text();


      let result;

      try {
        result =
          JSON.parse(text);
      } catch {
        result = {
          success: false,
          message:
            "Invalid response from Apps Script.",
          raw: text,
        };
      }


      return res
        .status(response.ok ? 200 : response.status)
        .json(result);

    } catch (error) {

      console.error(
        "Eventra proxy error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Eventra API error.",
      });
    }
  }
);


/* =========================
   START SERVER
   ========================= */

app.listen(
  PORT,
  () => {
    console.log(
      `Eventra API running on port ${PORT}`
    );
  }
);
