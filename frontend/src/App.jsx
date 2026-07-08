import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public page */}
        <Route path="/login" element={<Login />} />

        {/* Protected page — temporary placeholder until we build the dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="p-8 text-2xl">Dashboard coming soon ✅</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;