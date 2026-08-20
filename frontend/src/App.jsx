import { Routes, Route } from "react-router-dom";
import Badge from "./pages/Badge";
import Dashboard from "./pages/Dashboard";
import Participants from "./pages/Participants";
import Scanner from "./pages/Scanner";
import Reports from "./pages/Reports";
import PrintBadges from "./pages/PrintBadges";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/participants" element={<Protected><Participants /></Protected>} />
      <Route path="/scanner" element={<Protected><Scanner /></Protected>} />
      <Route path="/reports" element={<Protected><Reports /></Protected>} />
      <Route path="/badge/:id" element={<Protected><Badge /></Protected>} />
      <Route path="/print-badges" element={<Protected><PrintBadges /></Protected>} />
    </Routes>
  );
}
