import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, QrCode, BarChart3, Bell, Search, UserCircle, LogOut, Settings } from "lucide-react";
import { useEvent } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { APP_CONFIG } from "../config";

export default function MainLayout({ children }) {
  const location = useLocation();
  const { event } = useEvent();
  const { session, logout } = useAuth();

  const menu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Participants", path: "/participants", icon: <Users size={20} /> },
    { name: "Scanner", path: "/scanner", icon: <QrCode size={20} /> },
    { name: "Reports", path: "/reports", icon: <BarChart3 size={20} /> },
    ...(session?.role === "super_admin" ? [{ name: "Super Admin", path: "/admin", icon: <Settings size={20} /> }] : []),
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F7FB", fontFamily: "Poppins, sans-serif" }}>
      <aside style={{ width: 260, background: `linear-gradient(180deg,${event.primaryColor || "#4B0082"},${event.secondaryColor || "#6D28D9"})`, color: "#fff", display: "flex", flexDirection: "column", padding: 25, boxShadow: "5px 0 25px rgba(0,0,0,.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 35 }}>
          {event.logoUrl ? <img src={event.logoUrl} alt="Event logo" style={{ width: 70, height: 70, objectFit: "contain", background: "#fff", borderRadius: 14, padding: 5 }} /> : <div style={{ fontSize: 52 }}>◈</div>}
          <h2 style={{ margin: "8px 0 0" }}>{APP_CONFIG.name}</h2>
          <p style={{ opacity: .8, fontSize: 12, lineHeight: 1.35 }}>{APP_CONFIG.tagline}</p>
        </div>

        <div style={{ padding: "12px 14px", marginBottom: 15, borderRadius: 12, background: "rgba(255,255,255,.12)" }}>
          <div style={{ fontSize: 11, opacity: .75 }}>CURRENT EVENT</div>
          <strong style={{ display: "block", marginTop: 4, lineHeight: 1.25 }}>{event.eventName}</strong>
          <span style={{ fontSize: 11, opacity: .75 }}>{event.eventId}</span>
        </div>

        {menu.map(item => {
          const active = location.pathname === item.path;
          return <Link key={item.path} to={item.path} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "#fff", padding: "14px 18px", marginBottom: 10, borderRadius: 14, background: active ? "rgba(255,255,255,.22)" : "transparent", fontWeight: active ? 600 : 400 }}>{item.icon}{item.name}</Link>;
        })}

        <div style={{ flex: 1 }} />
        <button onClick={logout} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.2)", padding: 10, borderRadius: 10, cursor: "pointer", marginBottom: 12 }}><LogOut size={16} /> Sign out</button>
        <div style={{ fontSize: 11, opacity: .8, borderTop: "1px solid rgba(255,255,255,.2)", paddingTop: 15, textAlign: "center" }}>Eventra {APP_CONFIG.version}</div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ background: "#fff", minHeight: 75, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 35px", boxShadow: "0 5px 20px rgba(0,0,0,.05)", gap: 20 }}>
          <div style={{ flex: 1, maxWidth: 500, display: "flex", alignItems: "center", background: "#F5F7FB", borderRadius: 40, padding: "10px 18px" }}><Search size={18} color="#777" /><input placeholder="Search participant..." style={{ border: "none", outline: "none", background: "transparent", marginLeft: 10, width: "100%", fontSize: 15 }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Bell size={21} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <UserCircle size={40} color={event.primaryColor || "#4B0082"} />
              <div><div style={{ fontWeight: 600 }}>{event.adminName || session?.email || "Event Administrator"}</div><div style={{ fontSize: 11, color: "#666" }}>{event.organisation}</div></div>
            </div>
          </div>
        </header>

        <div style={{ margin: 25, borderRadius: 20, padding: 30, color: "#fff", background: `linear-gradient(135deg,${event.primaryColor || "#4B0082"},${event.secondaryColor || "#7C3AED"})`, boxShadow: "0 20px 40px rgba(124,58,237,.25)" }}>
          <h1 style={{ margin: 0, fontSize: 30 }}>Welcome Back 👋</h1>
          <p style={{ marginTop: 10, opacity: .9 }}>{event.eventName}</p>
          <p style={{ margin: 0, opacity: .75, fontSize: 13 }}>{event.organisation} • {event.eventDate}</p>
        </div>

        <div style={{ flex: 1, padding: "0 25px 25px" }}>{children}</div>

        <footer style={{ background: "#fff", borderTop: "1px solid #eee", padding: 18, textAlign: "center", color: "#666", fontSize: 13 }}>
          <strong>Eventra</strong><br />Smart Event Registration & Management Platform<br />{APP_CONFIG.version} • {event.organisation}
        </footer>
      </main>
    </div>
  );
}
