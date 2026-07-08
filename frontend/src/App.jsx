import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import NewSale from "./pages/NewSale";
import SalesHistory from "./pages/SalesHistory";

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
          <Route path="/sales/new" element={<NewSale />} />
          <Route path="/sales" element={<SalesHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;