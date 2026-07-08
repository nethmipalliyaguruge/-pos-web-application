import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// Layout renders the Navbar once, then <Outlet /> is where the current
// page gets injected. This way every page automatically has the navbar.
function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;