"use client"

import { useEffect, useState, useCallback } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy, ArrowLeft, Search, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Star, Flame, Sparkles,
} from "lucide-react"
import { useSession } from "next-auth/react"

export const dynamic = "force-dynamic"

type LeaderboardRow = {
  id: number
  user_id: string | null
  display_name: string
  avatar_url: string | null
  total_points: number
  stars_earned: number
  played_at: string
  subject: string | null
  level: number | null
}

type SortField = "total_points" | "stars_earned" | "played_at" | "display_name" | "level"

const ROWS_PER_PAGE = 20
const fetcher = (url: string) => fetch(url).then((r) => r.json())

const encouragements = [
  "🚀 You're doing amazing! Keep pushing for the top!",
  "🌟 Every game makes you smarter! Play more, learn more!",
  "🔥 Champions never stop! Beat your best score today!",
  "💪 You're a Mauritius history whiz in the making!",
  "🎯 Aim higher! The #1 spot is waiting for YOU!",
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

export default function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortField>("total_points")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const { data: session } = useSession()
  const [encouragement] = useState(() => encouragements[Math.floor(Math.random() * encouragements.length)])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const apiUrl =
    `/api/leaderboard?subject=${selectedCategory}&page=${page}&limit=${ROWS_PER_PAGE}` +
    `&sortBy=${sortBy}&sortOrder=${sortOrder}` +
    (debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "")

  const { data, isLoading, error } = useSWR<{
    data: LeaderboardRow[]
    total: number
    page: number
    limit: number
  }>(apiUrl, fetcher, { refreshInterval: 30000 })

  // Reset page on category or sort change
  useEffect(() => { setPage(1) }, [selectedCategory, sortBy, sortOrder])

  const toggleSort = useCallback((field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "desc" ? "asc" : "desc"))
    } else {
      setSortBy(field)
      setSortOrder(field === "display_name" ? "asc" : "desc")
    }
  }, [sortBy])

  const categories = [
    { id: "all", label: "All Subjects", icon: "🌍", color: "from-violet-500 to-purple-600" },
    { id: "history", label: "History", icon: "📚", color: "from-amber-500 to-orange-600" },
    { id: "geography", label: "Geography", icon: "🗺️", color: "from-emerald-500 to-green-600" },
    { id: "combined", label: "Combined", icon: "📖", color: "from-blue-500 to-cyan-600" },
  ]

  const allRows: LeaderboardRow[] = Array.isArray(data?.data) ? data.data : []
  const totalCount = data?.total || 0
  const totalPages = Math.ceil(totalCount / ROWS_PER_PAGE)
  const pageOffset = (page - 1) * ROWS_PER_PAGE
  const currentUserId = session?.user?.id || null

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    return sortOrder === "desc"
      ? <ArrowDown className="h-3.5 w-3.5 text-amber-500" />
      : <ArrowUp className="h-3.5 w-3.5 text-amber-500" />
  }

  const rankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-2xl drop-shadow-md">🥇</span>
    if (rank === 2) return <span className="text-2xl drop-shadow-md">🥈</span>
    if (rank === 3) return <span className="text-2xl drop-shadow-md">🥉</span>
    return <span className="text-sm font-extrabold text-gray-400">#{rank}</span>
  }

  const subjectBadge = (sub: string | null) => {
    const s = (sub || "").toLowerCase()
    if (s === "history") return <span className="inline-flex items-center gap-0.5 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">📚 History</span>
    if (s === "geography") return <span className="inline-flex items-center gap-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">🗺️ Geography</span>
    return <span className="inline-flex items-center gap-0.5 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">📖 Combined</span>
  }

  return (
    <div className="min-h-screen relative">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl relative z-10 p-4 md:p-6">
        {/* Navigation */}
        <Link href="/">
          <Button className="kid-btn mb-6 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 px-6 py-3">
            <ArrowLeft className="mr-2 h-5 w-5" />
            🏠 Back Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-3 animate-bounce-gentle">🏆</div>
          <div className="mb-3 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
            <h1 className="kid-heading text-5xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent md:text-6xl">
              Hall of Champions
            </h1>
            <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground md:text-xl">
            Best scores from Mauritius Learning Hub heroes! 🎓
          </p>
        </div>

        {/* Encouragement banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200/60 text-center">
          <p className="text-base md:text-lg font-semibold text-amber-800">{encouragement}</p>
        </div>

        {/* Category filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`kid-btn py-6 text-base font-bold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-amber-300`
                  : "bg-white/80 text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:bg-white"
              }`}
            >
              <span className="text-xl mr-1">{cat.icon}</span> {cat.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="🔍 Search for a player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:ring-amber-200 bg-white/90 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Leaderboard table */}
        <Card className="kid-card overflow-hidden bg-white/95 backdrop-blur-sm shadow-xl border-2 border-white/60">
          {/* Sort header */}
          <div className="hidden md:grid grid-cols-[60px_1fr_120px_80px_80px_130px] gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="text-center">Rank</div>
            <button onClick={() => toggleSort("display_name")} className="flex items-center gap-1 hover:text-gray-800 transition-colors">
              Player <SortIcon field="display_name" />
            </button>
            <div className="text-center">Subject</div>
            <button onClick={() => toggleSort("level")} className="flex items-center gap-1 justify-center hover:text-gray-800 transition-colors">
              Level <SortIcon field="level" />
            </button>
            <button onClick={() => toggleSort("total_points")} className="flex items-center gap-1 justify-end hover:text-gray-800 transition-colors">
              Points <SortIcon field="total_points" />
            </button>
            <button onClick={() => toggleSort("played_at")} className="flex items-center gap-1 justify-end hover:text-gray-800 transition-colors">
              Date <SortIcon field="played_at" />
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="text-4xl animate-bounce-gentle">🏆</div>
              <p className="text-muted-foreground font-medium animate-pulse">Loading champions...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="text-4xl">😟</div>
              <p className="text-red-500 font-medium">Oops! Could not load the leaderboard.</p>
              <p className="text-sm text-muted-foreground">Try refreshing the page.</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && allRows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="text-5xl">🎮</div>
              <p className="text-xl font-bold text-gray-600">
                {debouncedSearch ? "No players found!" : "No scores yet!"}
              </p>
              <p className="text-muted-foreground">
                {debouncedSearch
                  ? `No results for "${debouncedSearch}". Try a different name.`
                  : "Be the first champion! Play a quiz now!"}
              </p>
              {!debouncedSearch && (
                <Link href="/game">
                  <Button className="kid-btn mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-8 py-3 text-base hover:scale-105 transition-transform">
                    🎯 Start Playing!
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Rows */}
          {!isLoading && !error && allRows.length > 0 && (
            <div>
              {allRows.map((r, i) => {
                const rank = pageOffset + i + 1
                const isCurrentUser =
                  currentUserId !== undefined && currentUserId !== null && r.user_id === currentUserId
                const isTop3 = rank <= 3

                return (
                  <div
                    key={r.id}
                    className={`
                      group transition-all duration-200
                      ${isCurrentUser
                        ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 ring-2 ring-inset ring-blue-300"
                        : isTop3
                          ? "bg-gradient-to-r from-amber-50/60 to-yellow-50/60"
                          : i % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                      }
                      hover:bg-amber-50/80 hover:shadow-sm
                    `}
                  >
                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-[60px_1fr_120px_80px_80px_130px] gap-2 items-center px-4 py-3">
                      <div className="flex justify-center">{rankBadge(rank)}</div>
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className={`h-9 w-9 shrink-0 ring-2 ${isTop3 ? "ring-amber-300" : isCurrentUser ? "ring-blue-300" : "ring-gray-200"}`}>
                          <AvatarImage src={r.avatar_url ?? undefined} alt={r.display_name} />
                          <AvatarFallback className={`text-xs font-bold ${isTop3 ? "bg-amber-100 text-amber-700" : "bg-gray-100"}`}>
                            {r.display_name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className={`font-bold text-sm truncate block ${isCurrentUser ? "text-blue-700" : ""}`}>
                            {r.display_name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              ⭐ That&apos;s You!
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-center">{subjectBadge(r.subject)}</div>
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-bold bg-gray-100 px-2 py-1 rounded-lg">
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                          {r.level ?? "-"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-extrabold ${isTop3 ? "text-amber-600" : "text-gray-800"}`}>
                          {r.total_points.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground ml-0.5">pts</span>
                        <div className="flex items-center justify-end gap-0.5 mt-0.5">
                          {Array.from({ length: Math.min(r.stars_earned, 5) }).map((_, si) => (
                            <Star key={si} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                          {r.stars_earned > 5 && <span className="text-[10px] text-amber-600 font-bold">+{r.stars_earned - 5}</span>}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground leading-tight">
                        <div className="font-medium">{formatDate(r.played_at)}</div>
                        <div>{formatTime(r.played_at)}</div>
                      </div>
                    </div>

                    {/* Mobile row */}
                    <div className="md:hidden flex items-center gap-3 px-3 py-3">
                      <div className="shrink-0 w-10 flex flex-col items-center">
                        {rankBadge(rank)}
                      </div>
                      <Avatar className={`h-10 w-10 shrink-0 ring-2 ${isTop3 ? "ring-amber-300" : isCurrentUser ? "ring-blue-300" : "ring-gray-200"}`}>
                        <AvatarImage src={r.avatar_url ?? undefined} alt={r.display_name} />
                        <AvatarFallback className={`text-xs font-bold ${isTop3 ? "bg-amber-100 text-amber-700" : "bg-gray-100"}`}>
                          {r.display_name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-sm truncate ${isCurrentUser ? "text-blue-700" : ""}`}>
                            {r.display_name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] font-semibold bg-blue-500 text-white px-1.5 py-0.5 rounded-full shrink-0">You</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {subjectBadge(r.subject)}
                          <span className="text-xs text-muted-foreground">Lv {r.level ?? "-"}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDate(r.played_at)} · {formatTime(r.played_at)}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`text-sm font-extrabold ${isTop3 ? "text-amber-600" : "text-gray-800"}`}>
                          {r.total_points.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-600">{r.stars_earned}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-gray-700">{pageOffset + 1}</span>–
                <span className="font-semibold text-gray-700">{Math.min(pageOffset + ROWS_PER_PAGE, totalCount)}</span> of{" "}
                <span className="font-semibold text-gray-700">{totalCount}</span> champions
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                  className="h-9 w-9 p-0"
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 w-9 p-0"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-semibold text-gray-700 min-w-[80px] text-center">
                  {page} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-9 w-9 p-0"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="h-9 w-9 p-0"
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Call-to-action */}
        <Card className="kid-card mt-8 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200/60 overflow-hidden">
          <div className="p-6 text-center relative">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-lg font-bold text-green-800 mb-2">
              Ready to become a champion?
            </p>
            <p className="text-sm text-green-600 mb-4">
              Play quizzes, beat your best scores, and climb to the top!
            </p>
            <Link href="/game">
              <Button className="kid-btn bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-8 py-3 text-base hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300">
                🚀 Play Now!
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
