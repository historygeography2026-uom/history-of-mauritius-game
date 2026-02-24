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
      color: "from-blue-500 to-purple-500",
      borderColor: "border-blue-400",
    },
    {
      id: "geography",
      title: "Geography",
      description: "Explore the islands and landscapes",
      icon: "🗺️",
      color: "from-green-500 to-teal-500",
      borderColor: "border-green-400",
    },
    {
      id: "combined",
      title: "History & Geography",
      description: "Master both subjects together",
      icon: "🌍",
      color: "from-orange-500 to-red-500",
      borderColor: "border-orange-400",
    },
  ]

  const levels = [
    { id: 1, title: "Level 1", difficulty: "Easy", icon: "🌟" },
    { id: 2, title: "Level 2", difficulty: "Medium", icon: "⭐⭐" },
    { id: 3, title: "Level 3", difficulty: "Hard", icon: "⭐⭐⭐" },
  ]

  if (selectedSubject) {
    const subject = subjects.find((s) => s.id === selectedSubject)
    
    // Show Progress Map view
    if (showProgressMap) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 md:p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 md:p-8">
        <div className="mx-auto max-w-4xl relative z-10">
          {/* Back Button and Map Toggle */}
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => setSelectedSubject(null)}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
            
            <Button
              onClick={() => setShowProgressMap(true)}
              className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2"
            >
              <Map className="h-5 w-5" />
              Adventure Map
            </Button>
          </div>

          {/* Subject Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-secondary" />
              <h1 className="text-4xl font-bold text-primary md:text-5xl">{subject?.title}</h1>
              <Sparkles className="h-8 w-8 text-secondary" />
            </div>
            <p className="text-lg text-muted-foreground md:text-xl">
              {subject?.description}
            </p>
          </div>

          {/* Levels Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {levels.map((level, index) => (
              <Card
                key={level.id}
                className="group cursor-pointer overflow-hidden border-4 border-primary/20 bg-card transition-all hover:scale-105 hover:border-primary hover:shadow-2xl"
                onClick={() => {
                  const queryParams = new URLSearchParams({
                    subject: selectedSubject,
                    level: level.id.toString(),
                  })
                  window.location.href = `/game?${queryParams.toString()}`
                }}
              >
                <div className="p-6">
                  <div
                    className={`mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${subject?.color} text-5xl shadow-lg group-hover:animate-bounce-gentle transition-transform`}
                  >
                    {level.icon}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-card-foreground">{level.title}</h3>
                  <p className="mb-4 text-muted-foreground text-lg font-semibold">{level.difficulty}</p>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105">
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 md:p-8">
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <Link href="/leaderboard">
              <Button className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Leaderboard
              </Button>
            </Link>
            <Link href="/history">
              <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                My Progress
              </Button>
            </Link>
            <Link href="/admin">
              <Button className="bg-secondary hover:bg-secondary/90 text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Panel
              </Button>
            </Link>
          </div>

          <div className="flex gap-2 items-center">
            {session ? (
              <>
                <div className="text-sm text-muted-foreground mr-2">Welcome, {profile?.name || session?.user?.name || session?.user?.email || "Student"}!</div>
                <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="bg-transparent">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="bg-primary text-primary-foreground">Sign Up</Button>
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
          
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-10 w-10 text-secondary" />
            <h1 className="text-5xl font-bold text-primary md:text-6xl">History & Geography Game</h1>
            <Sparkles className="h-10 w-10 text-secondary" />
          </div>
          <p className="text-xl text-muted-foreground md:text-2xl mt-4">
            Choose your subject and start learning! 🎓
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {subjects.map((subject, index) => (
            <Card
              key={subject.id}
              className={`group cursor-pointer overflow-hidden border-4 ${subject.borderColor} bg-card transition-all hover:scale-105 hover:shadow-2xl`}
              onClick={() => setSelectedSubject(subject.id)}
            >
              <div className="p-8">
                <div
                  className={`mb-6 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${subject.color} text-7xl shadow-lg transition-transform mx-auto`}
                >
                  {subject.icon}
                </div>
                <h3 className="mb-2 text-3xl font-bold text-card-foreground text-center">{subject.title}</h3>
                <p className="mb-6 text-muted-foreground text-center">{subject.description}</p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 text-lg py-6">
                  Start Exploring! →
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-4 border-accent/30 bg-accent/10">
          <div className="p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-secondary" />
            <h3 className="mb-3 text-2xl font-bold text-card-foreground">Welcome to History & Geography Game 🌴</h3>
            <p className="text-lg leading-relaxed text-card-foreground">
              Select a subject above to begin your adventure! Each subject has 3 exciting levels with fun games, visual
              questions, and amazing facts about our beautiful island. Collect stars and become a Mauritius expert!
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
