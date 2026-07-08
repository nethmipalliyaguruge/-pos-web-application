import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import NewSale from "./pages/NewSale";
import SalesHistory from "./pages/SalesHistory";
import Users from "./pages/Users";

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
          {/* Admin-only pages (a cashier hitting these is sent to New Sale) */}
          <Route
            path="/"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          {/* Available to both admin and cashier */}
          <Route path="/sales/new" element={<NewSale />} />
          <Route path="/sales" element={<SalesHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;