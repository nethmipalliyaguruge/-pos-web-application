import { createContext, useContext, useState } from "react";

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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A little shortcut hook so pages can do: const { user } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}