"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { mockInstitutions } from "../lib/mockData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const institution = mockInstitutions.find(
      (inst) => inst.contact.email === email && inst.password === password
    );

    if (institution) {
      const userData = {
        id: institution._id,
        name: institution.name,
        email: institution.contact.email,
        role: institution.role,
        institutionId:
          institution.role === "admin_institutions" ? institution._id : null,
      };

      localStorage.setItem("authToken", "mock-token");
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return { success: false, error: "Invalid credentials" };
  };

  const logout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
