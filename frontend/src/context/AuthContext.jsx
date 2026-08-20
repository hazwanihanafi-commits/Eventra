import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  APP_CONFIG,
  clearSession,
  getStoredSession,
  saveSession,
} from "../config";

const AuthContext = createContext(null);

/* =========================
   EVENTRA API
   ========================= */

async function eventraRequest(action, payload = {}) {
  const apiUrl =
    APP_CONFIG.apiUrl ||
    import.meta.env.VITE_API_URL ||
    "https://script.google.com/macros/s/AKfycbwA6KrYSpGe4JakvrJP_avfLZ0o87SoL87XBk7ZSdY4H4rfoSXic1RUlor9tGhDrE-M1w/exec";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",

      // IMPORTANT:
      // Do NOT use application/json here.
      // text/plain avoids the browser CORS preflight.
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },

      body: JSON.stringify({
        action,
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Eventra server error: HTTP ${response.status}`
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.error ||
        result.message ||
        "Login failed."
      );
    }

    return result;
  } catch (error) {
    console.error("Eventra API error:", error);

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to Eventra server. Please try again."
      );
    }

    throw error;
  }
}

/* =========================
   AUTH PROVIDER
   ========================= */

export function AuthProvider({ children }) {
  const [session, setSession] =
    useState(getStoredSession());

  /* =========================
     LOGIN
     ========================= */

  async function login(email, password) {
    // ---------------------------------
    // Legacy mode
    // ---------------------------------

    if (APP_CONFIG.authMode === "legacy") {
      const legacySession = {
        token: "legacy-mode",

        role: "event_admin",

        email,

        event: {
          eventId:
            APP_CONFIG.defaultEventId,

          eventName:
            import.meta.env.VITE_EVENT_NAME ||
            "ICEE 2026",

          organisation:
            import.meta.env.VITE_EVENT_ORGANISATION ||
            "Universiti Sains Malaysia",

          eventDate:
            import.meta.env.VITE_EVENT_DATE ||
            "17–21 August 2026",

          logoUrl:
            import.meta.env.VITE_EVENT_LOGO ||
            "",

          primaryColor:
            import.meta.env.VITE_PRIMARY_COLOR ||
            "#4B0082",

          secondaryColor:
            import.meta.env.VITE_SECONDARY_COLOR ||
            "#7C3AED",

          adminName:
            import.meta.env.VITE_ADMIN_NAME ||
            "Event Administrator",
        },
      };

      saveSession(legacySession);

      setSession(legacySession);

      return legacySession;
    }

    // ---------------------------------
    // Eventra backend login
    // ---------------------------------

    const cleanEmail =
      String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error("Please enter your email.");
    }

    if (!password) {
      throw new Error("Please enter your password.");
    }

    const result = await eventraRequest(
      "login",
      {
        email: cleanEmail,
        password,
      }
    );

    /*
      The backend may return the session
      directly or inside result.session.
    */

    const newSession =
      result.session || {
        token: result.token,
        role: result.user?.role,
        email:
          result.user?.email ||
          cleanEmail,
        user:
          result.user || null,
        event:
          result.event || null,
      };

    if (!newSession.token) {
      throw new Error(
        "Login succeeded but no session token was returned."
      );
    }

    saveSession(newSession);

    setSession(newSession);

    return newSession;
  }

  /* =========================
     LOGOUT
     ========================= */

  function logout() {
    clearSession();
    setSession(null);
  }

  /* =========================
     CONTEXT VALUE
     ========================= */

  const value = useMemo(
    () => ({
      session,

      isAuthenticated:
        Boolean(session),

      login,

      logout,
    }),
    [session]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
   ========================= */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
