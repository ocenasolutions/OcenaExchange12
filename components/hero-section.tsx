import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
      <div className="container px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Trade Crypto with
            <span className="text-yellow-600 dark:text-yellow-400"> Confidence</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Join millions of users worldwide on Ocena Exchange. Buy, sell, and trade Bitcoin, Ethereum, and hundreds of
            other cryptocurrencies with industry-leading security.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="bg-yellow-600 hover:bg-yellow-700">
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/trade">
                <TrendingUp className="mr-2 h-4 w-4" />
                Start Trading
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
