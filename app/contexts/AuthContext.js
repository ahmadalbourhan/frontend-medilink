"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { mockUsers } from "../lib/mockData"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("userData")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Mock authentication - replace with actual API call
      const mockUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (!mockUser) {
        throw new Error("Invalid credentials")
      }

      const { password: _, ...userWithoutPassword } = mockUser

      // Store auth data
      localStorage.setItem("authToken", "mock-jwt-token")
      localStorage.setItem("userData", JSON.stringify(userWithoutPassword))

      setUser(userWithoutPassword)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userData")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
