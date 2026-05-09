"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, RefreshCw, UserPlus, Search } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AdminUser {
  id: number
  name: string | null
  email: string
  has_password: boolean
  providers: string[]
  created_at: string
  updated_at: string
  last_seen: string | null
}

const PROVIDER_LABELS: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "bg-red-100 text-red-700 border-red-200" },
  github: { label: "GitHub", color: "bg-slate-100 text-slate-700 border-slate-300" },
  credentials: { label: "Email/Password", color: "bg-blue-100 text-blue-700 border-blue-200" },
}

function ProviderBadges({ providers, hasPassword }: { providers: string[]; hasPassword: boolean }) {
  const all = [
    ...providers.filter((p) => p !== "credentials"),
    ...(hasPassword ? ["credentials"] : []),
  ]
  if (all.length === 0) return <span className="text-xs text-slate-400 italic">unknown</span>
  return (
    <div className="flex flex-wrap gap-1">
      {all.map((p) => {
        const meta = PROVIDER_LABELS[p] ?? { label: p, color: "bg-gray-100 text-gray-600 border-gray-200" }
        return (
          <span key={p} className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${meta.color}`}>
            {meta.label}
          </span>
        )
      })}
    </div>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [passwordDrafts, setPasswordDrafts] = useState<Record<number, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)

  // Add user form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSessionError = () => {
    setError("Admin session expired. Please go back to the admin dashboard and log in again.")
  }

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      setError(null)

      const response = await fetch("/api/admin/users", { cache: "no-store" })

      if (response.status === 401 || response.status === 403) {
        handleSessionError()
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

  // Verify admin session on mount, then load users
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/login", { cache: "no-store" })
        if (!res.ok) {
          router.replace("/admin")
          return
        }
        await fetchUsers()
      } catch {
        router.replace("/admin")
      }
    }
    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!value) return "No activity yet"
    return formatDateTime(value)
  }

  const handleResetPassword = async (user: AdminUser) => {
    const pwd = (passwordDrafts[user.id] || "").trim()

    if (pwd.length < 8) {
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
        body: JSON.stringify({ userId: user.id, newPassword: pwd }),
      })

      if (response.status === 401 || response.status === 403) {
        handleSessionError()
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Password reset failed")
      }

      setMessage(`Password replaced successfully for ${user.email}`)
      setPasswordDrafts((current) => ({ ...current, [user.id]: "" }))
      await fetchUsers()
    } catch (resetError: unknown) {
      setError(resetError instanceof Error ? resetError.message : "An error occurred")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete account for "${user.email}"? This cannot be undone.`)) return

    setDeletingUserId(user.id)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.status === 401 || response.status === 403) {
        handleSessionError()
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Delete failed")
      }

      setMessage(`Account deleted for ${user.email}`)
      await fetchUsers()
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "An error occurred")
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!newEmail.trim() || !newEmail.includes("@")) {
      setError("A valid email address is required.")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim() || null,
          email: newEmail.trim(),
          password: newPassword,
        }),
      })

      if (response.status === 401 || response.status === 403) {
        handleSessionError()
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to create user")
      }

      setMessage(`User "${newEmail.trim()}" created successfully.`)
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setShowAddForm(false)
      await fetchUsers()
    } catch (createError: unknown) {
      setError(createError instanceof Error ? createError.message : "An error occurred")
    } finally {
      setIsCreating(false)
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
            <CardTitle className="kid-heading text-2xl">User Management 🔧</CardTitle>
            <CardDescription>Create, view, reset passwords, and delete player accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Info banner */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Passwords are stored securely as hashes and cannot be revealed. Use the Replace Password column to set a new one.
              </div>

              {/* Feedback */}
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

              {/* Toolbar */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setShowAddForm((v) => !v)}
                    className="kid-btn bg-gradient-to-r from-green-500 to-green-600 text-white gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    {showAddForm ? "Cancel" : "Add User"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchUsers}
                    disabled={isLoadingUsers}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingUsers ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary/50 bg-white"
                  />
                </div>
              </div>

              {/* Add User Form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateUser}
                  className="rounded-xl border border-green-200 bg-green-50 p-4 flex flex-col gap-3"
                >
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> New Player Account
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="new-name" className="text-xs text-slate-700">
                        Display Name (optional)
                      </Label>
                      <Input
                        id="new-name"
                        type="text"
                        placeholder="e.g. Jean-Marie"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="new-email" className="text-xs text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="player@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="new-password" className="text-xs text-slate-700">
                        Password <span className="text-red-500">*</span> (min 8 chars)
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="kid-btn self-start bg-gradient-to-r from-green-500 to-green-700 text-white gap-2"
                    disabled={isCreating}
                  >
                    <Plus className="h-4 w-4" />
                    {isCreating ? "Creating..." : "Create Account"}
                  </Button>
                </form>
              )}

              {/* Users Table */}
              {isLoadingUsers ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  Loading users...
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Sign-in Method</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead className="min-w-[260px]">Replace Password</TableHead>
                        <TableHead className="w-[80px]">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const q = searchQuery.trim().toLowerCase()
                        const filtered = q
                          ? users.filter(
                              (u) =>
                                u.email.toLowerCase().includes(q) ||
                                (u.name ?? "").toLowerCase().includes(q)
                            )
                          : users
                        if (filtered.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                                {users.length === 0
                                  ? (<>No users found. Click <strong>Add User</strong> to create the first account.</>)
                                  : "No users match your search."}
                              </TableCell>
                            </TableRow>
                          )
                        }
                        return filtered.map((user) => {
                          const isOAuthOnly = !user.has_password
                          return (
                          <TableRow key={user.id} className="hover:bg-slate-50/70">
                            <TableCell className="font-medium text-slate-900">
                              {user.name?.trim() || <span className="text-slate-400 italic">Unnamed</span>}
                            </TableCell>
                            <TableCell className="text-slate-700">{user.email}</TableCell>
                            <TableCell>
                              <ProviderBadges providers={user.providers} hasPassword={user.has_password} />
                            </TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{formatDateTime(user.created_at)}</TableCell>
                            <TableCell className="text-slate-600 whitespace-nowrap">{formatLastSeen(user.last_seen)}</TableCell>
                            <TableCell>
                              {isOAuthOnly ? (
                                <span className="text-xs text-slate-400 italic">N/A — uses Google sign-in</span>
                              ) : (
                                <div className="flex flex-col gap-2 md:flex-row">
                                  <Input
                                    type="password"
                                    placeholder="New password"
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
                                    className="kid-btn whitespace-nowrap bg-gradient-to-r from-primary to-blue-600 text-white"
                                    onClick={() => handleResetPassword(user)}
                                    disabled={updatingUserId === user.id}
                                  >
                                    {updatingUserId === user.id ? "Saving..." : "Reset"}
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                onClick={() => handleDeleteUser(user)}
                                disabled={deletingUserId === user.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingUserId === user.id ? "..." : ""}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                        })
                      })()}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
