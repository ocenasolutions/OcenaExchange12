"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react" // Import useSession

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Wallet, Activity, BarChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PortfolioAsset {
  coinId: string
  symbol: string
  amount: number
  avgPurchasePrice: number
  current_price?: number
  image?: string
  name?: string
  value?: number
  pnl?: number
  pnl_percentage?: number
}

interface Transaction {
  _id: string
  coinId: string
  symbol: string
  type: "buy" | "sell"
  amount: number
  price: number
  total: number
  date: string
}

interface CoinData {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  image: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession() // Use useSession hook
  const [assets, setAssets] = useState<PortfolioAsset[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [marketData, setMarketData] = useState<CoinData[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalPnL, setTotalPnL] = useState(0)
  const [loadingData, setLoadingData] = useState(true) // Renamed to avoid conflict with Auth.js status
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Do nothing while session is loading

    if (status === "unauthenticated") {
      router.push("/login") // Redirect if not logged in
      toast({
        title: "Authentication Required",
        description: "Please log in to view your dashboard.",
        variant: "destructive",
      })
      return
    }

    const userId = session?.user?.id // Get userId from session
    if (!userId) {
      // This case should ideally not happen if status is 'authenticated'
      // but as a fallback for type safety or unexpected scenarios
      toast({
        title: "Error",
        description: "User ID not found in session.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const fetchDashboardData = async () => {
      setLoadingData(true)
      try {
        // Fetch user assets
        const assetsResponse = await fetch(`/api/users/${userId}/portfolio`)
        const assetsData = await assetsResponse.json()
        if (!assetsResponse.ok) throw new Error(assetsData.error || "Failed to fetch assets")
        const userAssets: PortfolioAsset[] = assetsData.assets || []

        // Fetch current prices for all assets and top market data
        const coinIds = userAssets.map((asset) => asset.coinId).join(",")
        const marketFetchUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`
        const pricesFetchUrl = coinIds
          ? `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&sparkline=false`
          : null

        const [marketResponse, pricesResponse] = await Promise.all([
          fetch(marketFetchUrl),
          pricesFetchUrl ? fetch(pricesFetchUrl) : Promise.resolve({ json: () => [] }),
        ])

        const marketDataResult = await marketResponse.json()
        setMarketData(marketDataResult)

        const pricesDataResult = await pricesResponse.json()
        const currentPrices: { [key: string]: { usd: number; image: string; name: string } } = {}
        pricesDataResult.forEach((coin: any) => {
          currentPrices[coin.id] = { usd: coin.current_price, image: coin.image, name: coin.name }
        })

        // Calculate values and P&L for user assets
        let calculatedTotalValue = 0
        let calculatedTotalPnL = 0

        const updatedAssets = userAssets.map((asset) => {
          const currentPrice = currentPrices[asset.coinId]?.usd || 0
          const value = asset.amount * currentPrice
          const pnl = (currentPrice - asset.avgPurchasePrice) * asset.amount
          const pnl_percentage = asset.avgPurchasePrice > 0 ? (pnl / (asset.avgPurchasePrice * asset.amount)) * 100 : 0

          calculatedTotalValue += value
          calculatedTotalPnL += pnl

          return {
            ...asset,
            current_price: currentPrice,
            image: currentPrices[asset.coinId]?.image,
            name: currentPrices[asset.coinId]?.name,
            value,
            pnl,
            pnl_percentage,
          }
        })

        setAssets(updatedAssets)
        setTotalValue(calculatedTotalValue)
        setTotalPnL(calculatedTotalPnL)

        // Fetch user transactions
        const transactionsResponse = await fetch(`/api/users/${userId}/transactions`)
        const transactionsData = await transactionsResponse.json()
        if (!transactionsResponse.ok) throw new Error(transactionsData.error || "Failed to fetch transactions")
        setTransactions(transactionsData.transactions || [])
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        toast({
          title: "Error",
          description: err.message || "Failed to load dashboard data.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [status, session, router, toast]) // Depend on status and session

  if (status === "loading" || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your personal overview of Ocena Exchange</p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Updated in real-time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalPnL >= 0 ? "+" : ""}$
                {totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalValue > 0 ? ((totalPnL / totalValue) * 100).toFixed(2) : 0}% overall return
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
              <p className="text-xs text-muted-foreground">Cryptocurrencies in your portfolio</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Transactions
                <Button asChild variant="link" className="p-0 h-auto">
                  <Link href="/portfolio?tab=history">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4" />
                  <p>No recent transactions.</p>
                  <p className="text-sm mt-2">Start trading to see your history!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            tx.type === "buy" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {tx.type === "buy" ? "B" : "S"}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {tx.symbol.toUpperCase()} {tx.type.toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {tx.amount.toFixed(4)} @ ${tx.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total: ${tx.total.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Market Movers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Market Movers (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData
                  .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                  .slice(0, 5)
                  .map((coin) => (
                    <div key={coin.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8" />
                        <div>
                          <div className="font-semibold">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          $
                          {coin.current_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <Badge variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}>
                          {coin.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
