"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import Link from "next/link"

interface TradingPair {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  high_24h: number
  low_24h: number
  total_volume: number
  image: string
}

export function TradingPairs() {
  const [pairs, setPairs] = useState<TradingPair[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTradingPairs = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false",
        )
        const data = await response.json()
        setPairs(data)
      } catch (error) {
        console.error("Error fetching trading pairs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTradingPairs()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-muted/50">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Popular Trading Pairs</h2>
            <p className="text-muted-foreground">Start trading with the most popular cryptocurrency pairs</p>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="animate-pulse">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-muted/50">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Popular Trading Pairs</h2>
          <p className="text-muted-foreground">Start trading with the most popular cryptocurrency pairs</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Market</CardTitle>
              <Button asChild variant="outline">
                <Link href="/markets">View All Markets</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Pair</th>
                    <th className="text-right p-4 font-medium">Price</th>
                    <th className="text-right p-4 font-medium">24h Change</th>
                    <th className="text-right p-4 font-medium">24h High</th>
                    <th className="text-right p-4 font-medium">24h Low</th>
                    <th className="text-right p-4 font-medium">Volume</th>
                    <th className="text-right p-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pairs.map((pair) => (
                    <tr key={pair.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            <Star className="w-4 h-4" />
                          </Button>
                          <img src={pair.image || "/placeholder.svg"} alt={pair.name} className="w-6 h-6" />
                          <div>
                            <div className="font-semibold">{pair.symbol.toUpperCase()}/USDT</div>
                            <div className="text-sm text-muted-foreground">{pair.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right p-4 font-mono">${pair.current_price.toLocaleString()}</td>
                      <td className="text-right p-4">
                        <Badge variant={pair.price_change_percentage_24h >= 0 ? "default" : "destructive"}>
                          {pair.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {pair.price_change_percentage_24h.toFixed(2)}%
                        </Badge>
                      </td>
                      <td className="text-right p-4 font-mono text-green-600">
                        ${pair.high_24h?.toLocaleString() || "N/A"}
                      </td>
                      <td className="text-right p-4 font-mono text-red-600">
                        ${pair.low_24h?.toLocaleString() || "N/A"}
                      </td>
                      <td className="text-right p-4 font-mono">${(pair.total_volume / 1000000).toFixed(1)}M</td>
                      <td className="text-right p-4">
                        <Button asChild size="sm">
                          <Link href={`/trade/${pair.symbol.toLowerCase()}`}>Trade</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
