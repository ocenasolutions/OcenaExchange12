"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { TradingChart } from "@/components/trading-chart"

interface CoinData {
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

interface UserAsset {
  coinId: string
  symbol: string
  amount: number
  avgPurchasePrice: number
}

export default function TradePage() {
  const { data: session, status } = useSession()
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null)
  const [coins, setCoins] = useState<CoinData[]>([])
  const [orderType, setOrderType] = useState("market")
  const [side, setSide] = useState("buy")
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")
  const [loadingData, setLoadingData] = useState(true)
  const [tradeLoading, setTradeLoading] = useState(false)
  const [userAssets, setUserAssets] = useState<UserAsset[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      toast({
        title: "Authentication Required",
        description: "Please log in to access the trading page.",
        variant: "destructive",
      })
      return
    }

    const userId = session?.user?.id
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found in session.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const fetchInitialData = async () => {
      setLoadingData(true)
      try {
        // Fetch coins
        const coinsResponse = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false",
        )
        const coinsData = await coinsResponse.json()
        setCoins(coinsData)
        setSelectedCoin(coinsData[0]) // Default to Bitcoin or first available

        // Fetch user assets
        const assetsResponse = await fetch(`/api/users/${userId}/portfolio`)
        const assetsData = await assetsResponse.json()
        if (assetsResponse.ok) {
          setUserAssets(assetsData.assets || [])
        } else {
          console.error("Failed to fetch user assets:", assetsData.error)
          toast({
            title: "Error",
            description: "Failed to load your asset balances.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load market data or user assets.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    fetchInitialData()
    const interval = setInterval(fetchInitialData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [status, session, router, toast])

  const handleTrade = async () => {
    if (!selectedCoin || !session?.user?.id) {
      toast({
        title: "Error",
        description: "Please select a coin and ensure you are logged in.",
        variant: "destructive",
      })
      return
    }
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }
    if (orderType === "limit" && (!price || Number.parseFloat(price) <= 0)) {
      toast({
        title: "Error",
        description: "Please enter a valid limit price.",
        variant: "destructive",
      })
      return
    }

    setTradeLoading(true)

    const tradePrice = orderType === "market" ? selectedCoin.current_price : Number.parseFloat(price)
    const tradeAmount = Number.parseFloat(amount)
    const tradeTotal = tradeAmount * tradePrice

    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          coinId: selectedCoin.id,
          symbol: selectedCoin.symbol,
          type: side,
          amount: tradeAmount,
          price: tradePrice,
          total: tradeTotal,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Trade Successful!",
          description: data.message,
          variant: "default",
        })
        // Refresh user assets after trade
        const assetsResponse = await fetch(`/api/users/${session.user.id}/portfolio`)
        const assetsData = await assetsResponse.json()
        if (assetsResponse.ok) {
          setUserAssets(assetsData.assets || [])
        }
        setAmount("")
        setPrice("")
      } else {
        toast({
          title: "Trade Failed",
          description: data.error || "Trade failed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Trade fetch error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred during trade. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setTradeLoading(false)
    }
  }

  const getUserAssetAmount = (coinId: string) => {
    const asset = userAssets.find((a) => a.coinId === coinId)
    return asset ? asset.amount : 0
  }

  if (status === "loading" || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="h-96 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
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
          <h1 className="text-3xl font-bold mb-2">Spot Trading</h1>
          <p className="text-muted-foreground">Trade cryptocurrencies with real-time market data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Trading Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Header */}
            {selectedCoin && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedCoin.image || "/placeholder.svg"}
                        alt={selectedCoin.name}
                        className="w-10 h-10"
                      />
                      <div>
                        <h2 className="text-2xl font-bold">{selectedCoin.symbol.toUpperCase()}/USDT</h2>
                        <p className="text-muted-foreground">{selectedCoin.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        $
                        {selectedCoin.current_price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <Badge variant={selectedCoin.price_change_percentage_24h >= 0 ? "default" : "destructive"}>
                        {selectedCoin.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">24h High</p>
                      <p className="font-semibold text-green-600">
                        $
                        {selectedCoin.high_24h?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">24h Low</p>
                      <p className="font-semibold text-red-600">
                        $
                        {selectedCoin.low_24h?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="font-semibold">${(selectedCoin.total_volume / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trading Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Price Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TradingChart
                  symbol={selectedCoin ? `${selectedCoin.symbol.toUpperCase()}/USDT` : "BTC/USDT"}
                  height={400}
                />
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card>
              <CardHeader>
                <CardTitle>Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Sell Orders</h4>
                    <div className="space-y-1">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-red-600">
                            $
                            {((selectedCoin?.current_price || 0) + (i + 1) * 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span>{(Math.random() * 10).toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Buy Orders</h4>
                    <div className="space-y-1">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-green-600">
                            $
                            {((selectedCoin?.current_price || 0) - (i + 1) * 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span>{(Math.random() * 10).toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Coin Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Trading Pair</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedCoin?.id}
                  onValueChange={(value) => {
                    const coin = coins.find((c) => c.id === value)
                    setSelectedCoin(coin || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coin" />
                  </SelectTrigger>
                  <SelectContent>
                    {coins.slice(0, 20).map((coin) => (
                      <SelectItem key={coin.id} value={coin.id}>
                        <div className="flex items-center space-x-2">
                          <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-4 h-4" />
                          <span>{coin.symbol.toUpperCase()}/USDT</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Trading Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Place Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={side} onValueChange={setSide}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="text-green-600">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="text-red-600">
                      Sell
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="buy" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Order Type</Label>
                      <Select value={orderType} onValueChange={setOrderType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {orderType === "limit" && (
                      <div className="space-y-2">
                        <Label>Price (USDT)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          step="any"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Amount ({selectedCoin?.symbol.toUpperCase()})</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="any"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total (USDT)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={
                          amount && selectedCoin
                            ? (
                                Number.parseFloat(amount) *
                                (orderType === "market" ? selectedCoin.current_price : Number.parseFloat(price || "0"))
                              ).toFixed(2)
                            : ""
                        }
                        readOnly
                      />
                    </div>

                    <Button
                      onClick={handleTrade}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={tradeLoading || !amount || !selectedCoin || (orderType === "limit" && !price)}
                    >
                      {tradeLoading ? "Placing Order..." : `Buy ${selectedCoin?.symbol.toUpperCase()}`}
                    </Button>
                  </TabsContent>
                  <TabsContent value="sell" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Order Type</Label>
                      <Select value={orderType} onValueChange={setOrderType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {orderType === "limit" && (
                      <div className="space-y-2">
                        <Label>Price (USDT)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          step="any"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Amount ({selectedCoin?.symbol.toUpperCase()})</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="any"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total (USDT)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={
                          amount && selectedCoin
                            ? (
                                Number.parseFloat(amount) *
                                (orderType === "market" ? selectedCoin.current_price : Number.parseFloat(price || "0"))
                              ).toFixed(2)
                            : ""
                        }
                        readOnly
                      />
                    </div>

                    <Button
                      onClick={handleTrade}
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={
                        tradeLoading ||
                        !amount ||
                        !selectedCoin ||
                        (orderType === "limit" && !price) ||
                        getUserAssetAmount(selectedCoin?.id || "") < Number.parseFloat(amount || "0")
                      }
                    >
                      {tradeLoading ? "Placing Order..." : `Sell ${selectedCoin?.symbol.toUpperCase()}`}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Account Balance */}
            <Card>
              <CardHeader>
                <CardTitle>Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>USDT</span>
                    <span className="font-semibold">10,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{selectedCoin?.symbol.toUpperCase()}</span>
                    <span className="font-semibold">{getUserAssetAmount(selectedCoin?.id || "").toFixed(6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
