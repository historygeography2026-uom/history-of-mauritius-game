"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface AdminLoginModalProps {
  onClose: () => void
  onLogin: (username: string) => void
  initialError?: string
}

export default function AdminLoginModal({ onClose, onLogin, initialError }: AdminLoginModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(initialError || "")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: "/admin/google-auth" })
    } catch {
      setError("Failed to initiate Google sign-in. Please try again.")
      setGoogleLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Call backend API to validate credentials
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Include cookies
      })

      const data = await response.json()

      if (response.ok) {
        // Credentials valid - store authenticated state
        sessionStorage.setItem("adminUser", data.username)
        onLogin(data.username)
        onClose()
      } else {
        setError(data.error || "Invalid username or password")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
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
              disabled={loading || googleLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 text-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading || googleLoading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border-2 border-muted hover:border-primary/40 font-semibold"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Redirecting to Google..." : "Sign in with Google"}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">Contact your system administrator for credentials</p>
        </div>
      </Card>
    </div>
  )
}
