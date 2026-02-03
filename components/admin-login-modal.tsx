"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface AdminLoginModalProps {
  onClose: () => void
  onLogin: (username: string) => void
}

export default function AdminLoginModal({ onClose, onLogin }: AdminLoginModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Valid admin credentials
  const validAdmins = [
    { username: "MES", password: "test123" },
    { username: "MIE", password: "test123" },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validate credentials (case-insensitive comparison, store as uppercase)
    const matchedAdmin = validAdmins.find(
      (admin) => admin.username.toUpperCase() === username.toUpperCase() && admin.password === password
    )

    if (matchedAdmin) {
      const upperUsername = matchedAdmin.username.toUpperCase()
      sessionStorage.setItem("adminUser", upperUsername)
      onLogin(upperUsername)
      onClose()
    } else {
      setError("Invalid username or password")
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-4 border-secondary bg-card shadow-2xl">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-2 text-card-foreground">Admin Login</h2>
          <p className="text-center text-muted-foreground mb-6">Enter your credentials to access the admin panel</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-card-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2 border-2 border-primary/30 rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-card-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border-2 border-primary/30 rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 text-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">Demo credentials: MES/test123 or MIE/test123</p>
        </div>
      </Card>
    </div>
  )
}
