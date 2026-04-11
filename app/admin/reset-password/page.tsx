"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    // Verify admin is authenticated via the admin panel session
    try {
      const verifyRes = await fetch("/api/admin/login")
      if (!verifyRes.ok) {
        setError("Admin session expired. Please log in to the admin panel again.")
        setIsLoading(false)
        return
      }
    } catch {
      setError("Failed to verify admin session")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Password reset failed")
      }

      setMessage(`Password reset successfully for ${email}`)
      setEmail("")
      setNewPassword("")
      setAdminPassword("")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md">
        <Link href="/admin">
          <Button className="kid-btn mb-4 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 px-6 py-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ← Back to Admin
          </Button>
        </Link>

        <Card className="kid-card border-primary/30 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2 animate-bounce-gentle">🛡️</div>
            <CardTitle className="kid-heading text-2xl">Reset User Password 🔧</CardTitle>
            <CardDescription>Admin can reset any user password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-2 text-sm text-red-600 flex items-center gap-2">
                    <span>⚠️</span>{error}
                  </div>
                )}
                {message && (
                  <div className="rounded-xl bg-green-50 border-2 border-green-200 px-4 py-2 text-sm text-green-600 flex items-center gap-2">
                    <span>✅</span>{message}
                  </div>
                )}
                <Button type="submit" className="kid-btn w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold shadow-lg" disabled={isLoading}>
                  {isLoading ? "Sending... ⏳" : "Send Password Reset Email 📧"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
