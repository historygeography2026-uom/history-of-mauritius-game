"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, KeyRound } from "lucide-react"

export const dynamic = "force-dynamic"

export default function ForgotPasswordPage() {
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
            <CardTitle className="kid-heading text-2xl">Need Password Help? 🤔</CardTitle>
            <CardDescription>
              For safety, self-service password reset is turned off right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50 border-2 border-amber-200 px-4 py-3 text-sm text-amber-900">
                Ask a parent, teacher, or the site admin to help you reset your password.
              </div>

              <div className="rounded-xl bg-blue-50 border-2 border-blue-200 px-4 py-3 text-sm text-blue-900">
                If you still know your password, you can sign in and change it from your account settings instead.
              </div>

              <Link href="/auth/login">
                <Button className="kid-btn w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg">
                  Go Back to Login 🔐
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
