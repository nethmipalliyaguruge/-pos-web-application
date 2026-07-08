import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any page that should require login.
// - If there's no logged-in user, bounce to /login.
// - If `roles` is given and the user's role isn't in it, send them to their
//   home page (New Sale) — used to keep cashiers out of admin-only pages.
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/sales/new" replace />;
  }

  return children;
}

export default ProtectedRoute;