import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Shared styling for each link. NavLink gives us `isActive` so we can
  // highlight the page we're currently on.
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded text-sm font-medium ${
      isActive ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-500"
    }`;

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Left side: brand + page links */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg mr-4">POS</span>
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
          <NavLink to="/sales/new" className={linkClass}>
            New Sale
          </NavLink>
          <NavLink to="/sales" end className={linkClass}>
            Sales History
          </NavLink>
        </div>

        {/* Right side: who's logged in + logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-100">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1.5 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;