"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ExploreMapError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[explore-map] Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative z-10">
      <Card className="p-8 text-center max-w-md border-2 border-red-300">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Map Error</h2>
        <p className="text-muted-foreground mb-6">
          Something went wrong loading the explore map. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
