import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import NewSale from "./pages/NewSale";

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
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          {/* Temporary Placeholders*/}
          <Route path="/sales/new" element={<NewSale />} />
          <Route path="/sales" element={<div className="text-2xl">Sales History 🧾</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;