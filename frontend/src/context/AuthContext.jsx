import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

// Create the context object.
const AuthContext = createContext();

// This wraps our whole app (we'll add it in main.jsx next) so every
// page can read the login state.
export function AuthProvider({ children }) {
  // Load any saved user/token from localStorage so a page refresh
  // doesn't log you out.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // While we verify the stored token on first load, the app shows a small
  // "checking session" state instead of flashing a protected page.
  const [authLoading, setAuthLoading] = useState(true);

  // On first load, if there's a token, confirm it's still valid with the
  // backend (/auth/me). A stale/expired token then gets cleared instead of
  // leaving the app thinking we're logged in.
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch {
        // Invalid/expired token — clear it (the axios interceptor also
        // handles the redirect on 401).
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setAuthLoading(false);
      }
    };
    verifySession();
  }, []);

  // Called after a successful login. Saves to state + localStorage.
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  // Clears everything on logout.
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A little shortcut hook so pages can do: const { user } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}