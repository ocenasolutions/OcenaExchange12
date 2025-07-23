"use client"

import { Suspense, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MarketOverview } from "@/components/market-overview"
import { TradingPairs } from "@/components/trading-pairs"
import { Footer } from "@/components/footer"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react" // Import useSession

export default function HomePage() {
  const router = useRouter()
  const { status } = useSession() // Get session status

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  // If session is loading or authenticated, don't render the homepage content yet
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <Suspense fallback={<div>Loading market data...</div>}>
          <MarketOverview />
        </Suspense>
        <Suspense fallback={<div>Loading trading pairs...</div>}>
          <TradingPairs />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
