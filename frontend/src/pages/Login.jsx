import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { APP_CONFIG } from "../config";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>E</div>
        <h1 style={styles.title}>{APP_CONFIG.name}</h1>
        <p style={styles.subtitle}>{APP_CONFIG.tagline}</p>
        <h2 style={{ marginTop: 30 }}>Eventra Login</h2>
        <p style={{ color: "#666", fontSize: 14 }}>Organisers and Eventra administrators can access their workspace here.</p>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrap}>
            <Mail size={18} color="#777" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="organiser@example.com" style={styles.input} required />
          </div>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrap}>
            <LockKeyhole size={18} color="#777" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button disabled={loading} style={styles.button}>{loading ? "Signing in…" : "Sign In"}</button>
        </form>

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#F5F3FF,#fff)" },
  card: { width: 420, maxWidth: "90vw", background: "#fff", padding: 36, borderRadius: 24, boxShadow: "0 20px 60px rgba(75,0,130,.15)" },
  logo: { width: 64, height: 64, borderRadius: 18, margin: "0 auto 12px", display: "grid", placeItems: "center", background: "linear-gradient(135deg,#4B0082,#7C3AED)", color: "#fff", fontWeight: 800, fontSize: 30 },
  title: { textAlign: "center", margin: 0, color: "#4B0082" },
  subtitle: { textAlign: "center", color: "#777", fontSize: 13 },
  label: { display: "block", margin: "18px 0 7px", fontWeight: 600, fontSize: 14 },
  inputWrap: { display: "flex", alignItems: "center", gap: 10, background: "#F5F7FB", borderRadius: 12, padding: "12px 14px" },
  input: { border: 0, outline: 0, background: "transparent", width: "100%", fontSize: 15 },
  button: { width: "100%", marginTop: 22, border: 0, borderRadius: 12, padding: 14, color: "#fff", background: "linear-gradient(135deg,#4B0082,#7C3AED)", fontWeight: 700, cursor: "pointer" },
  error: { marginTop: 14, padding: 10, borderRadius: 10, background: "#FDECEC", color: "#B42318", fontSize: 13 },
};
