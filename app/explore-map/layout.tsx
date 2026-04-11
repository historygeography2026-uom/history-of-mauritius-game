"use client"

import { ErrorBoundary } from "@/components/error-boundary"

export default function ExploreMapLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallbackTitle="Oops! The map had a hiccup">{children}</ErrorBoundary>
}
