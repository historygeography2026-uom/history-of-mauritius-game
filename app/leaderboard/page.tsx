"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"

export const dynamic = 'force-dynamic'

type LeaderboardRow = {
  id: number
  user_id: string | null
  display_name: string
  avatar_url: string | null
  total_points: number
  stars_earned: number
  created_at: string
  subject: string | null
  level: number | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { data: session } = useSession()

  const { data, isLoading, error, mutate } = useSWR<LeaderboardRow[]>(
    `/api/leaderboard?subject=${selectedCategory}&all=true`,
    fetcher,
    { refreshInterval: 15000 },
  )

  useEffect(() => {
    void mutate()
  }, [selectedCategory, mutate])

  const categories = [
    { id: "all", label: "All Subjects", icon: "🌍" },
    { id: "history", label: "History", icon: "📚" },
    { id: "geography", label: "Geography", icon: "🗺️" },
    { id: "combined", label: "History & Geography", icon: "📖" },
  ]

  const allRows: LeaderboardRow[] = Array.isArray(data) ? data : []
  
  // Find current user's position to highlight
  const currentUserId = session?.user?.id || null

  const renderLeaderboardRow = (r: LeaderboardRow, rank: number, isCurrentUser: boolean) => {
    return (
      <div 
        key={r.id} 
        className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-all ${
          isCurrentUser 
            ? "ring-2 ring-primary bg-primary/10" 
            : rank % 2 === 0 ? "bg-gray-50" : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`text-sm font-bold w-8 text-center shrink-0 ${isCurrentUser ? "text-primary" : "text-muted-foreground"}`}>
            {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
          </div>
          <Avatar className={`h-7 w-7 shrink-0 ${isCurrentUser ? "ring-2 ring-primary" : ""}`}>
            <AvatarImage src={r.avatar_url ?? undefined} alt={r.display_name} />
            <AvatarFallback className="text-xs">{r.display_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className={`text-sm font-semibold flex items-center gap-1 ${isCurrentUser ? "text-primary" : ""}`}>
              <span className="truncate">{r.display_name}</span>
              {isCurrentUser && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shrink-0">You</span>}
            </div>
            <div className="text-xs text-muted-foreground">
              {(r.subject || "").toString()} · Lv{r.level ?? "-"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`text-sm font-bold ${isCurrentUser ? "text-primary" : ""}`}>{r.total_points} pts</div>
          <div className="text-sm">⭐{r.stars_earned}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mx-auto max-w-4xl relative z-10 p-4 md:p-6">
        <Link href="/">
          <Button className="mb-6 bg-gradient-to-r from-secondary via-secondary/80 to-secondary hover:shadow-lg hover:shadow-secondary/50 text-white font-bold transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
            <ArrowLeft className="mr-2 h-5 w-5 transition-transform hover:translate-x-1" />
            🏠 Back Home
          </Button>
        </Link>

        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-secondary" />
            <h1 className="text-5xl font-bold text-primary md:text-6xl">Leaderboard</h1>
            <Trophy className="h-10 w-10 text-secondary" />
          </div>
          <p className="text-lg text-muted-foreground md:text-xl">Top performers in Mauritius Learning Hub 🎓</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`py-6 font-semibold transition-all rounded-lg ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:shadow-amber-500/50 scale-105"
                  : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 hover:from-gray-400 hover:to-gray-500"
              }`}
            >
              {category.icon} {category.label}
            </Button>
          ))}
        </div>

        <Card className="p-2">
          {isLoading && <p className="p-2 text-center">Loading leaderboard…</p>}
          {error && <p className="p-2 text-center text-red-500">Failed to load leaderboard</p>}
          {!isLoading && !error && allRows.length === 0 && <p className="p-2 text-center">No scores yet.</p>}

          {!isLoading && !error && allRows.length > 0 && (
            <div className="divide-y divide-gray-100">
              {allRows.map((r, i) => {
                const isCurrentUser = currentUserId !== undefined && currentUserId !== null && r.user_id === currentUserId
                return renderLeaderboardRow(r, i + 1, isCurrentUser)
              })}
            </div>
          )}

          {!isLoading && !error && allRows.length > 0 && (
            <p className="text-center text-xs text-muted-foreground py-2">Showing all {allRows.length} scores</p>
          )}
        </Card>

        <Card className="mt-8">
          <div className="p-6 text-center">
            <p className="text-lg text-card-foreground">
              Keep playing to climb the leaderboard! Complete all levels and ace every quiz to earn more points! 🚀
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
