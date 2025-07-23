"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Search, Star } from "lucide-react"
import Link from "next/link"

interface MarketData {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  high_24h: number
  low_24h: number
  image: string
  market_cap_rank: number
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<MarketData[]>([])
  const [filteredMarkets, setFilteredMarkets] = useState<MarketData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
        )
        const data = await response.json()
        setMarkets(data)
        setFilteredMarkets(data)
      } catch (error) {
        console.error("Error fetching market data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
    const interval = setInterval(fetchMarkets, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const filtered = markets.filter(
      (market) =>
        market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredMarkets(filtered)
  }, [searchTerm, markets])

  const toggleFavorite = (coinId: string) => {
    setFavorites((prev) => (prev.includes(coinId) ? prev.filter((id) => id !== coinId) : [...prev, coinId]))
  }

  const getFavoriteMarkets = () => {
    return markets.filter((market) => favorites.includes(market.id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MarketTable = ({ data }: { data: MarketData[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-medium">#</th>
            <th className="text-left p-4 font-medium">Name</th>
            <th className="text-right p-4 font-medium">Price</th>
            <th className="text-right p-4 font-medium">24h %</th>
            <th className="text-right p-4 font-medium">24h High</th>
            <th className="text-right p-4 font-medium">24h Low</th>
            <th className="text-right p-4 font-medium">Market Cap</th>
            <th className="text-right p-4 font-medium">Volume</th>
            <th className="text-right p-4 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((market) => (
            <tr key={market.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => toggleFavorite(market.id)}>
                    <Star
                      className={`w-4 h-4 ${favorites.includes(market.id) ? "fill-yellow-400 text-yellow-400" : ""}`}
                    />
                  </Button>
                  <span className="text-muted-foreground">{market.market_cap_rank}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <img src={market.image || "/placeholder.svg"} alt={market.name} className="w-8 h-8" />
                  <div>
                    <div className="font-semibold">{market.name}</div>
                    <div className="text-sm text-muted-foreground">{market.symbol.toUpperCase()}</div>
                  </div>
                </div>
              </td>
              <td className="text-right p-4 font-mono">${market.current_price.toLocaleString()}</td>
              <td className="text-right p-4">
                <Badge variant={market.price_change_percentage_24h >= 0 ? "default" : "destructive"}>
                  {market.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {market.price_change_percentage_24h.toFixed(2)}%
                </Badge>
              </td>
              <td className="text-right p-4 font-mono text-green-600">${market.high_24h?.toLocaleString() || "N/A"}</td>
              <td className="text-right p-4 font-mono text-red-600">${market.low_24h?.toLocaleString() || "N/A"}</td>
              <td className="text-right p-4 font-mono">${(market.market_cap / 1000000000).toFixed(1)}B</td>
              <td className="text-right p-4 font-mono">${(market.total_volume / 1000000).toFixed(1)}M</td>
              <td className="text-right p-4">
                <Button asChild size="sm">
                  <Link href={`/trade/${market.symbol.toLowerCase()}`}>Trade</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Markets</h1>
          <p className="text-muted-foreground">Track cryptocurrency prices and market data in real-time</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Cryptocurrencies</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MarketTable data={filteredMarkets} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Your Favorites</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {favorites.length > 0 ? (
                  <MarketTable data={getFavoriteMarkets()} />
                ) : (
                  <div className="p-8 text-center">
                    <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No favorites yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click the star icon to add cryptocurrencies to your favorites
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gainers">
            <Card>
              <CardHeader>
                <CardTitle>Top Gainers (24h)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MarketTable
                  data={[...markets]
                    .filter((m) => m.price_change_percentage_24h > 0)
                    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                    .slice(0, 50)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="losers">
            <Card>
              <CardHeader>
                <CardTitle>Top Losers (24h)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MarketTable
                  data={[...markets]
                    .filter((m) => m.price_change_percentage_24h < 0)
                    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
                    .slice(0, 50)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
