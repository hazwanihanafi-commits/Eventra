import { createContext, useContext, useMemo, useState } from "react";
import { APP_CONFIG, clearSession, getStoredSession, saveSession } from "../config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession());

  async function login(email, password) {
    if (APP_CONFIG.authMode === "legacy") {
      const legacySession = {
        token: "legacy-mode",
        role: "event_admin",
        email,
        event: {
          eventId: APP_CONFIG.defaultEventId,
          eventName: import.meta.env.VITE_EVENT_NAME || "ICEE 2026",
          organisation: import.meta.env.VITE_EVENT_ORGANISATION || "Universiti Sains Malaysia",
          eventDate: import.meta.env.VITE_EVENT_DATE || "17–21 August 2026",
          logoUrl: import.meta.env.VITE_EVENT_LOGO || "",
          primaryColor: import.meta.env.VITE_PRIMARY_COLOR || "#4B0082",
          secondaryColor: import.meta.env.VITE_SECONDARY_COLOR || "#7C3AED",
          adminName: import.meta.env.VITE_ADMIN_NAME || "Event Administrator",
        },
      };
      saveSession(legacySession);
      setSession(legacySession);
      return legacySession;
    }

    const response = await fetch(`${APP_CONFIG.apiUrl}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Login failed");

    saveSession(result.session);
    setSession(result.session);
    return result.session;
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  const value = useMemo(() => ({
    session,
    isAuthenticated: Boolean(session),
    login,
    logout,
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
