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
  const [adminPassword, setAdminPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    const validAdmins = [
      { username: "MES", password: "test123" },
      { username: "MIE", password: "test123" },
    ]

    const isValidAdmin = validAdmins.some(
      (admin) => admin.username === adminPassword.split(":")[0] && admin.password === adminPassword.split(":")[1],
    )

    if (!isValidAdmin) {
      setError("Invalid admin credentials")
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/admin">
          <Button className="mb-4 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform hover:translate-x-1" />
            ← Back to Admin
          </Button>
        </Link>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Reset User Password</CardTitle>
            <CardDescription>Admin can reset any user password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adminPassword">Admin Credentials (username:password)</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="mes:test123"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
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
                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-green-500">{message}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending Reset Email..." : "Send Password Reset Email"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
