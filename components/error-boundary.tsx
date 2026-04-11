"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallbackTitle?: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">
              {this.props.fallbackTitle || "Oops! Something went wrong"}
            </h2>
            <p className="text-muted-foreground mb-4">
              Don&apos;t worry, just try again!
            </p>
            <Button onClick={() => this.setState({ hasError: false })}>
              Try Again
            </Button>
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => (window.location.href = "/")}
            >
              Go Home
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
