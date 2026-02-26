"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, ArrowLeft, Medal, Calendar } from "lucide-react"
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
  
  // Get top 10 rows
  const top10Rows = allRows.slice(0, 10)
  
  // Find current user's position if not in top 10
  let currentUserRow: LeaderboardRow | null = null
  let currentUserRank: number | null = null
  
  if (session?.user?.id) {
    const currentUserIndex = allRows.findIndex(r => r.user_id === session.user.id)
    if (currentUserIndex >= 10) {
      currentUserRow = allRows[currentUserIndex]
      currentUserRank = currentUserIndex + 1
    }
  }

  const renderLeaderboardRow = (r: LeaderboardRow, rank: number, isCurrentUser: boolean) => {
    const dateTime = r.created_at ? new Date(r.created_at) : null
    const formattedDate = dateTime ? dateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
    const formattedTime = dateTime ? dateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
    
    return (
      <Card 
        key={r.id} 
        className={`p-2 flex items-center justify-between transition-all ${
          isCurrentUser 
            ? "ring-2 ring-primary bg-primary/10 shadow-lg" 
            : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold w-12 text-center ${isCurrentUser ? "text-primary" : ""}`}>
            #{rank}
          </div>
          <Avatar className={`h-10 w-10 ${isCurrentUser ? "ring-2 ring-primary" : ""}`}>
            <AvatarImage src={r.avatar_url ?? undefined} alt={r.display_name} />
            <AvatarFallback>{r.display_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className={`font-semibold flex items-center gap-2 ${isCurrentUser ? "text-primary" : ""}`}>
              {rank === 1 && <Medal className="h-5 w-5 text-yellow-500" />}
              {rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
              {rank === 3 && <Medal className="h-5 w-5 text-orange-600" />}
              <span>{r.display_name}</span>
              {isCurrentUser && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full ml-1">You</span>}
            </div>
            <div className="text-sm text-muted-foreground">
              {(r.subject || "").toString()} · Level {r.level ?? "-"}
            </div>
            {dateTime && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate} at {formattedTime}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-xl font-bold ${isCurrentUser ? "text-primary" : ""}`}>{r.total_points}</div>
          <div className="text-xl">⭐ {r.stars_earned}</div>
        </div>
      </Card>
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

        <div className="grid gap-1">
          {isLoading && <Card className="p-2">Loading leaderboard…</Card>}
          {error && <Card className="p-2 border-red-500">Failed to load leaderboard</Card>}
          {!isLoading && !error && allRows.length === 0 && <Card className="p-2">No scores yet.</Card>}

          {!isLoading && !error &&
            top10Rows.map((r, i) => {
              const isCurrentUser = session?.user?.id !== undefined && r.user_id === session.user.id
              return renderLeaderboardRow(r, i + 1, isCurrentUser)
            })}
          
          {/* Show current user as 11th row if not in top 10 */}
          {!isLoading && !error && currentUserRow && currentUserRank && (
            <>
              <div className="flex items-center justify-center py-2 text-muted-foreground">
                <span className="px-4">• • •</span>
              </div>
              {renderLeaderboardRow(currentUserRow, currentUserRank, true)}
            </>
          )}
        </div>

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
