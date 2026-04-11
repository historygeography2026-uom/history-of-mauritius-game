"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Settings, Trophy, LogOut, Map, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ProgressMap } from "@/components/progress-map"
import { DodoMascot } from "@/components/dodo-mascot"

export const dynamic = 'force-dynamic'

export default function SubjectSelection() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [showProgressMap, setShowProgressMap] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [welcomeMessage, setWelcomeMessage] = useState("Let's learn about Mauritian History & Geography! 🌴")
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const loadProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/profile/${session.user.id}`)
          if (response.ok) {
            const profileData = await response.json()
            setProfile(profileData)
          }
        } catch (error) {
          console.error("Failed to load profile:", error)
        }
      }
    }

    loadProfile()
  }, [session])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const subjects = [
    {
      id: "history",
      title: "History",
      description: "Learn about Mauritius's fascinating past",
      icon: "📚",
      emoji2: "🏛️",
      color: "from-blue-500 to-purple-500",
      borderColor: "border-blue-400",
      bgTint: "bg-blue-50",
    },
    {
      id: "geography",
      title: "Geography",
      description: "Explore the islands and landscapes",
      icon: "🗺️",
      emoji2: "🌴",
      color: "from-green-500 to-teal-500",
      borderColor: "border-green-400",
      bgTint: "bg-green-50",
    },
    {
      id: "combined",
      title: "History & Geography",
      description: "Master both subjects together",
      icon: "🌍",
      emoji2: "⛵",
      color: "from-orange-500 to-red-500",
      borderColor: "border-orange-400",
      bgTint: "bg-orange-50",
    },
  ]

  const levels = [
    { id: 1, title: "Level 1", difficulty: "Easy", icon: "🌟", emoji: "🐣", color: "from-green-400 to-emerald-500", border: "border-green-400" },
    { id: 2, title: "Level 2", difficulty: "Medium", icon: "⭐⭐", emoji: "🦊", color: "from-amber-400 to-orange-500", border: "border-amber-400" },
    { id: 3, title: "Level 3", difficulty: "Hard", icon: "⭐⭐⭐", emoji: "🦁", color: "from-red-400 to-rose-500", border: "border-red-400" },
  ]

  if (selectedSubject) {
    const subject = subjects.find((s) => s.id === selectedSubject)
    
    // Show Progress Map view
    if (showProgressMap) {
      return (
        <div className="min-h-screen bg-transparent p-4 md:p-8">
          <div className="mx-auto max-w-6xl relative z-10">
            <Button
              onClick={() => setShowProgressMap(false)}
              className="mb-6 bg-secondary hover:bg-secondary/90 text-white"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Levels
            </Button>
            
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-bold text-primary">{subject?.title} Adventure Map</h1>
              <p className="text-muted-foreground mt-2">Follow your journey through Mauritian History & Geography!</p>
            </div>
            
            <ProgressMap 
              subject={selectedSubject}
              subjectColor={subject?.color || "from-blue-500 to-purple-500"}
              subjectIcon={subject?.icon || "📚"}
              onBack={() => setShowProgressMap(false)}
              onSelectLevel={(levelId) => {
                const queryParams = new URLSearchParams({
                  subject: selectedSubject,
                  level: levelId.toString(),
                })
                window.location.href = `/game?${queryParams.toString()}`
              }}
            />
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen bg-transparent p-4 md:p-8">
        <div className="mx-auto max-w-4xl relative z-10">
          {/* Back Button and Map Toggle */}
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => setSelectedSubject(null)}
              className="kid-btn bg-gradient-to-r from-secondary via-secondary/80 to-secondary text-white px-6 py-3"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              ← Back
            </Button>
            
            <Button
              onClick={() => setShowProgressMap(true)}
              className="kid-btn bg-gradient-to-r from-accent to-teal-500 text-white flex items-center gap-2 px-6 py-3"
            >
              <Map className="h-5 w-5" />
              🗺️ Adventure Map
            </Button>
          </div>

          {/* Subject Header */}
          <div className="mb-8 text-center">
            <div className="mb-2 text-6xl animate-bounce-gentle">{subject?.icon}</div>
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-secondary" />
              <h1 className="text-4xl font-bold text-primary md:text-5xl kid-heading">{subject?.title}</h1>
              <Sparkles className="h-8 w-8 text-secondary" />
            </div>
            <p className="text-lg text-muted-foreground md:text-xl">
              Choose your difficulty level! 🎯
            </p>
          </div>

          {/* Levels Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {levels.map((level) => (
              <Card
                key={level.id}
                className={`kid-card group cursor-pointer overflow-hidden ${level.border} ${subject?.bgTint} hover:opacity-90`}
                onClick={() => {
                  const queryParams = new URLSearchParams({
                    subject: selectedSubject,
                    level: level.id.toString(),
                  })
                  window.location.href = `/game?${queryParams.toString()}`
                }}
              >
                <div className="p-6 text-center">
                  <div className="text-5xl mb-3 animate-float">{level.emoji}</div>
                  <div
                    className={`kid-icon-box mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${level.color} text-4xl shadow-lg`}
                  >
                    {level.icon}
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-card-foreground">{level.title}</h3>
                  <span className={`kid-badge bg-gradient-to-r ${level.color} text-white mb-4`}>{level.difficulty}</span>
                  <Button className={`kid-btn w-full mt-4 bg-gradient-to-r ${level.color} text-white text-lg py-3`}>
                    Play Now! 🎮
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-wrap gap-2">
            <Link href="/leaderboard">
              <Button className="kid-btn bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm md:text-base">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">🏆 Leaderboard</span>
              </Button>
            </Link>
            <Link href="/history">
              <Button className="kid-btn bg-gradient-to-r from-blue-500 to-cyan-600 text-white flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm md:text-base">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">📊 My Progress</span>
              </Button>
            </Link>
            <Link href="/admin">
              <Button className="kid-btn bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm md:text-base">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">⚙️ Admin</span>
              </Button>
            </Link>
            <Link href="/explore-map">
              <Button className="kid-btn bg-gradient-to-r from-cyan-500 to-teal-600 text-white flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm md:text-base">
                <Map className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">🗺️ Explore Map</span>
              </Button>
            </Link>
          </div>

          <div className="flex gap-1 sm:gap-2 items-center flex-wrap">
            {session ? (
              <>
                <div className="text-xs sm:text-sm text-muted-foreground mr-1 sm:mr-2 bg-white/60 rounded-full px-3 py-1">👋 {profile?.name || session?.user?.name || session?.user?.email || "Student"}</div>
                <Button onClick={handleLogout} className="kid-btn bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm md:text-base">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button className="kid-btn bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm md:text-base">🔑 Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="kid-btn bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm md:text-base">✨ Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-12 text-center relative">
          {/* Dodo Mascot - positioned to the right to avoid button overlap */}
          <div className="absolute -right-4 top-8 hidden xl:block z-20">
            <DodoMascot mood="idle" size="lg" showSpeechBubble speechText={welcomeMessage} />
          </div>
          
          {/* Fun island illustration */}
          <div className="text-7xl sm:text-8xl mb-4 animate-bounce-gentle">🏝️</div>
          
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-3xl animate-float">🦤</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold kid-heading bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Mauritius Learning Hub
            </h1>
            <span className="text-3xl animate-float" style={{ animationDelay: "0.5s" }}>🌺</span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mt-4">
            Choose your subject and start the adventure! 🎓🌴
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className={`kid-card group cursor-pointer overflow-hidden ${subject.borderColor} ${subject.bgTint} transition-all`}
              onClick={() => setSelectedSubject(subject.id)}
            >
              <div className="p-4 sm:p-6 md:p-8 text-center">
                {/* Decorative emoji pair */}
                <div className="flex justify-center gap-3 mb-3">
                  <span className="text-2xl animate-float">{subject.emoji2}</span>
                  <span className="text-2xl animate-float" style={{ animationDelay: "0.4s" }}>✨</span>
                </div>
                <div
                  className={`kid-icon-box mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 items-center justify-center rounded-3xl bg-gradient-to-br ${subject.color} text-5xl sm:text-6xl md:text-7xl shadow-lg kid-wobble`}
                >
                  {subject.icon}
                </div>
                <h3 className="mb-2 text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground">{subject.title}</h3>
                <p className="mb-6 text-muted-foreground">{subject.description}</p>
                <Button className={`kid-btn w-full bg-gradient-to-r ${subject.color} text-white text-lg py-4`}>
                  Start Exploring! 🚀
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="kid-card border-accent/40 bg-gradient-to-r from-amber-50/80 via-sky-50/80 to-emerald-50/80">
          <div className="p-8 text-center">
            <div className="flex justify-center gap-2 mb-4">
              <span className="text-3xl">🦤</span>
              <span className="text-3xl">🌴</span>
              <span className="text-3xl">🏝️</span>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-card-foreground kid-heading">Welcome to the Adventure! 🌴</h3>
            <p className="text-lg leading-relaxed text-card-foreground">
              Pick a subject above to begin! Each one has 3 exciting levels with fun games, 
              pictures, and amazing facts about our beautiful island. Collect ⭐ stars and become a Mauritius expert!
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
