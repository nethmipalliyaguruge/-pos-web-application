import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any page that should require login.
// - If there's no logged-in user, bounce to /login.
// - If `roles` is given and the user's role isn't in it, send them to their
//   home page (New Sale) — used to keep cashiers out of admin-only pages.
function ProtectedRoute({ children, roles }) {
  const { user, authLoading } = useAuth();

  // While we're verifying the token on first load, don't decide yet.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/sales/new" replace />;
  }

  return children;
}

export default ProtectedRoute;