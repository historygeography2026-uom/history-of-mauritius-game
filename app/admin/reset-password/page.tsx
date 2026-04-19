"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AdminUser {
  id: number
  name: string | null
  email: string
  created_at: string
  updated_at: string
  last_seen: string | null
}

export default function ResetPasswordPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [passwordDrafts, setPasswordDrafts] = useState<Record<number, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      setError(null)

      const response = await fetch("/api/admin/users", { cache: "no-store" })

      if (response.status === 401 || response.status === 403) {
        setError("Admin session expired. Please go back to the admin dashboard and log in again.")
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to load users")
      }

      const data = (await response.json()) as AdminUser[]
      setUsers(data)
    } catch (fetchError: unknown) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load users")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatLastSeen = (value: string | null) => {
    if (!value) {
      return "No activity yet"
    }

    return formatDateTime(value)
  }

  const handleResetPassword = async (user: AdminUser) => {
    const newPassword = (passwordDrafts[user.id] || "").trim()

    if (newPassword.length < 8) {
      setError(`Password for ${user.email} must be at least 8 characters.`)
      setMessage(null)
      return
    }

    setUpdatingUserId(user.id)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          newPassword,
        }),
      })

      if (response.status === 401 || response.status === 403) {
        setError("Admin session expired. Please go back to the admin dashboard and log in again.")
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Password reset failed")
      }

      setMessage(`Password replaced successfully for ${user.email}`)
      setPasswordDrafts((current) => ({
        ...current,
        [user.id]: "",
      }))
      await fetchUsers()
    } catch (resetError: unknown) {
      setError(resetError instanceof Error ? resetError.message : "An error occurred")
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 relative z-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/admin">
          <Button className="kid-btn mb-4 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 px-6 py-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ← Back to Admin
          </Button>
        </Link>

        <Card className="kid-card border-primary/30 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center md:text-left">
            <div className="text-5xl mb-2 animate-bounce-gentle">🛡️</div>
            <CardTitle className="kid-heading text-2xl">Reset User Password 🔧</CardTitle>
            <CardDescription>Admin can view users and replace passwords directly from this table.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Old passwords cannot be shown because passwords are stored securely as hashes. Use the Replace Password column to set a new one.
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

              {isLoadingUsers ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  Loading users...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead className="min-w-[280px]">Replace Password</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-slate-900">
                            {user.name?.trim() || "Unnamed User"}
                          </TableCell>
                          <TableCell className="text-slate-700">{user.email}</TableCell>
                          <TableCell className="text-slate-600">{formatDateTime(user.created_at)}</TableCell>
                          <TableCell className="text-slate-600">{formatLastSeen(user.last_seen)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2 md:flex-row">
                              <Input
                                type="password"
                                placeholder="Enter new password"
                                value={passwordDrafts[user.id] || ""}
                                onChange={(e) =>
                                  setPasswordDrafts((current) => ({
                                    ...current,
                                    [user.id]: e.target.value,
                                  }))
                                }
                              />
                              <Button
                                type="button"
                                className="kid-btn bg-gradient-to-r from-primary to-blue-600 text-white"
                                onClick={() => handleResetPassword(user)}
                                disabled={updatingUserId === user.id}
                              >
                                {updatingUserId === user.id ? "Replacing..." : "Replace Password"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
