"use client"

import { ErrorBoundary } from "@/components/error-boundary"

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallbackTitle="Oops! The quiz had a hiccup">{children}</ErrorBoundary>
}
