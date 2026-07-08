import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — no navbar */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — all share the Layout (navbar) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Temporary placeholders until we build each real page */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<div className="text-2xl">Products 📦</div>} />
          <Route path="/sales/new" element={<div className="text-2xl">New Sale 🛒</div>} />
          <Route path="/sales" element={<div className="text-2xl">Sales History 🧾</div>} />
        
          {/* Temporary placeholders until we build each real page */}
          <Route path="/" element={<div className="text-2xl">Dashboard 📊</div>} />
          <Route path="/products" element={<div className="text-2xl">Products 📦</div>} />
          <Route path="/sales/new" element={<div className="text-2xl">New Sale 🛒</div>} />
          <Route path="/sales" element={<div className="text-2xl">Sales History 🧾</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;