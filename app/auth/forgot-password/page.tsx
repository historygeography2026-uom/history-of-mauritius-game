"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, CheckCircle, KeyRound } from "lucide-react"

export const dynamic = "force-dynamic"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), name, newPassword }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || "Password reset failed")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="kid-card border-green-400/40 bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-5xl mb-3 animate-bounce-gentle">🎉</div>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="kid-heading text-2xl font-bold mb-2">Password Reset! ✅</h2>
              <p className="text-muted-foreground mb-6">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <Link href="/auth/login">
                <Button className="kid-btn w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg">
                  🦤 Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md">
        <Link href="/auth/login">
          <Button className="kid-btn mb-4 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 px-6 py-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ← Back to Login
          </Button>
        </Link>

        <Card className="kid-card border-amber-400/40 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="text-5xl mb-2 animate-bounce-gentle">🔑</div>
            <CardTitle className="kid-heading text-2xl">Forgot Password? 🤔</CardTitle>
            <CardDescription>
              Enter your email and the full name on your account to verify your identity, then set a new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name (as registered)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter the name you signed up with"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Set new password</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-2 text-sm text-red-600 flex items-center gap-2">
                    <span>⚠️</span>{error}
                  </div>
                )}

                <Button type="submit" className="kid-btn w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg" disabled={isLoading}>
                  {isLoading ? "Resetting... ⏳" : "Reset Password 🔓"}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm">
                Remember your password?{" "}
                <Link href="/auth/login" className="underline underline-offset-4 text-primary font-semibold">
                  Log In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
