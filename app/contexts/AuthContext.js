"use client";

import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../lib/api";

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
    try {
      const response = await apiClient.login(email, password);
      const { token, user: userPayload } = response.data || {};
      if (!token || !userPayload) {
        return { success: false, error: "Invalid response from server" };
      }
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(userPayload));
      setUser(userPayload);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      setUser(null);
    }
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
