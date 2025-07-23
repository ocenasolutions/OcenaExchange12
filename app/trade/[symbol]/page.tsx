"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { TradingChart } from "@/components/trading-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { BarChart3, Activity, Target, ArrowUp, ArrowDown, Star, Settings, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OrderBookEntry {
  price: number
  size: number
  total: number
}

interface RecentTrade {
  id: string
  price: number
  size: number
  side: "buy" | "sell"
  time: string
}

interface Position {
  symbol: string
  side: "long" | "short"
  size: number
  entryPrice: number
  markPrice: number
  pnl: number
  pnlPercent: number
  margin: number
  leverage: number
}

export default function TradingSymbolPage({ params }: { params: { symbol: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // State management
  const [symbol] = useState(params.symbol?.toUpperCase() || "BTCUSDT")
  const [currentPrice, setCurrentPrice] = useState(118330.0)
  const [priceChange, setPriceChange] = useState(-1094.29)
  const [priceChangePercent, setPriceChangePercent] = useState(-0.92)
  const [volume24h, setVolume24h] = useState(154958406)
  const [high24h, setHigh24h] = useState(119720.6)
  const [low24h, setLow24h] = useState(115845.0)
  const [openInterest, setOpenInterest] = useState(10587673707.76)

  // Order book state
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookEntry[]
    asks: OrderBookEntry[]
  }>({
    bids: [],
    asks: [],
  })

  // Recent trades
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([])

  // Trading form state
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy")
  const [orderType, setOrderType] = useState("limit")
  const [orderSize, setOrderSize] = useState("")
  const [orderPrice, setOrderPrice] = useState("")
  const [leverage, setLeverage] = useState("20")
  const [marginMode, setMarginMode] = useState("cross")
  const [reduceOnly, setReduceOnly] = useState(false)
  const [postOnly, setPostOnly] = useState(false)

  // Positions
  const [positions, setPositions] = useState<Position[]>([])
  const [orders, setOrders] = useState<any[]>([])

  // Chart data
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    initializeData()
    const interval = setInterval(updateMarketData, 1000)
    return () => clearInterval(interval)
  }, [status, router])

  const initializeData = async () => {
    try {
      // Generate mock order book
      const bids: OrderBookEntry[] = []
      const asks: OrderBookEntry[] = []

      let totalBids = 0
      let totalAsks = 0

      // Generate bids (buy orders)
      for (let i = 0; i < 20; i++) {
        const price = currentPrice - (i + 1) * 0.1
        const size = Math.random() * 10 + 0.1
        totalBids += size
        bids.push({ price, size, total: totalBids })
      }

      // Generate asks (sell orders)
      for (let i = 0; i < 20; i++) {
        const price = currentPrice + (i + 1) * 0.1
        const size = Math.random() * 10 + 0.1
        totalAsks += size
        asks.push({ price, size, total: totalAsks })
      }

      setOrderBook({ bids, asks })

      // Generate recent trades
      const trades: RecentTrade[] = []
      for (let i = 0; i < 50; i++) {
        trades.push({
          id: i.toString(),
          price: currentPrice + (Math.random() - 0.5) * 100,
          size: Math.random() * 2 + 0.001,
          side: Math.random() > 0.5 ? "buy" : "sell",
          time: new Date(Date.now() - i * 1000).toLocaleTimeString(),
        })
      }
      setRecentTrades(trades)

      // Generate chart data
      generateChartData()

      setLoading(false)
    } catch (error) {
      console.error("Error initializing data:", error)
      setLoading(false)
    }
  }

  const generateChartData = () => {
    const data = []
    let price = currentPrice
    const now = Math.floor(Date.now() / 1000)

    for (let i = 100; i >= 0; i--) {
      const time = now - i * 60
      const change = (Math.random() - 0.5) * 200
      const open = price
      const close = price + change
      const high = Math.max(open, close) + Math.random() * 100
      const low = Math.min(open, close) - Math.random() * 100
      const volume = Math.random() * 1000000 + 500000

      data.push({ time, open, high, low, close, volume })
      price = close
    }

    setChartData(data)
  }

  const updateMarketData = () => {
    // Simulate real-time price updates
    const change = (Math.random() - 0.5) * 10
    setCurrentPrice((prev) => prev + change)

    // Update order book
    setOrderBook((prev) => {
      const newBids = prev.bids.map((bid) => ({
        ...bid,
        price: bid.price + (Math.random() - 0.5) * 0.1,
        size: Math.max(0.001, bid.size + (Math.random() - 0.5) * 0.1),
      }))

      const newAsks = prev.asks.map((ask) => ({
        ...ask,
        price: ask.price + (Math.random() - 0.5) * 0.1,
        size: Math.max(0.001, ask.size + (Math.random() - 0.5) * 0.1),
      }))

      return { bids: newBids, asks: newAsks }
    })
  }

  const handlePlaceOrder = async () => {
    if (!orderSize || (!orderPrice && orderType === "limit")) {
      toast({
        title: "Error",
        description: "Please enter order size and price",
        variant: "destructive",
      })
      return
    }

    try {
      // Simulate order placement
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Order Placed",
        description: `${orderSide.toUpperCase()} ${orderSize} ${symbol} ${orderType === "market" ? "at market price" : `at $${orderPrice}`}`,
      })

      // Reset form
      setOrderSize("")
      setOrderPrice("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Price Ticker */}
      <div className="border-b bg-card">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-bold">{symbol}</span>
                <Badge variant="outline">Perp</Badge>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold">{currentPrice.toLocaleString()}</span>
                <div className={`flex items-center space-x-1 ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {priceChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{Math.abs(priceChange).toFixed(2)}</span>
                  <span>{priceChangePercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div>
                <span className="text-muted-foreground">24h High: </span>
                <span className="font-medium">{high24h.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Low: </span>
                <span className="font-medium">{low24h.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Volume: </span>
                <span className="font-medium">{(volume24h / 1000000).toFixed(1)}M</span>
              </div>
              <div>
                <span className="text-muted-foreground">Open Interest: </span>
                <span className="font-medium">{(openInterest / 1000000000).toFixed(2)}B</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="container py-4">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
          {/* Chart Section */}
          <div className="col-span-8 space-y-4">
            <Card className="h-[70%]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CardTitle>Chart</CardTitle>
                    <div className="flex items-center space-x-2 text-sm">
                      <Button variant="ghost" size="sm">
                        1s
                      </Button>
                      <Button variant="ghost" size="sm">
                        15m
                      </Button>
                      <Button variant="ghost" size="sm" className="bg-primary text-primary-foreground">
                        1H
                      </Button>
                      <Button variant="ghost" size="sm">
                        4H
                      </Button>
                      <Button variant="ghost" size="sm">
                        1D
                      </Button>
                      <Button variant="ghost" size="sm">
                        1W
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      Original
                    </Button>
                    <Button variant="ghost" size="sm">
                      Trading View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Depth
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <TradingChart symbol={symbol} data={chartData} height={400} showVolume={true} showIndicators={true} />
              </CardContent>
            </Card>

            {/* Bottom Tabs */}
            <Card className="h-[30%]">
              <Tabs defaultValue="positions" className="h-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="positions">Positions(0)</TabsTrigger>
                  <TabsTrigger value="orders">Open Orders(0)</TabsTrigger>
                  <TabsTrigger value="history">Order History</TabsTrigger>
                  <TabsTrigger value="trades">Trade History</TabsTrigger>
                  <TabsTrigger value="assets">Assets</TabsTrigger>
                </TabsList>
                <TabsContent value="positions" className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2" />
                    <p>No positions</p>
                  </div>
                </TabsContent>
                <TabsContent value="orders" className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <p>No open orders</p>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                    <p>No order history</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-4">
            {/* Order Book */}
            <Card className="h-[45%]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Order Book</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Price (USDT)</span>
                  <span>Size (BTC)</span>
                  <span>Sum (BTC)</span>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-1">
                {/* Asks */}
                <div className="space-y-px max-h-32 overflow-y-auto">
                  {orderBook.asks
                    .slice()
                    .reverse()
                    .map((ask, i) => (
                      <div
                        key={i}
                        className="relative flex justify-between items-center px-3 py-0.5 text-xs hover:bg-red-50"
                      >
                        <div
                          className="absolute inset-0 bg-red-100 opacity-30"
                          style={{ width: `${(ask.total / Math.max(...orderBook.asks.map((a) => a.total))) * 100}%` }}
                        />
                        <span className="relative text-red-500 font-mono">{ask.price.toFixed(1)}</span>
                        <span className="relative font-mono">{ask.size.toFixed(3)}</span>
                        <span className="relative font-mono text-muted-foreground">{ask.total.toFixed(3)}</span>
                      </div>
                    ))}
                </div>

                {/* Current Price */}
                <div className="flex items-center justify-center py-2 bg-muted/50">
                  <span className={`text-lg font-bold ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {currentPrice.toFixed(1)}
                  </span>
                  <ArrowUp className="w-4 h-4 ml-1 text-green-500" />
                </div>

                {/* Bids */}
                <div className="space-y-px max-h-32 overflow-y-auto">
                  {orderBook.bids.map((bid, i) => (
                    <div
                      key={i}
                      className="relative flex justify-between items-center px-3 py-0.5 text-xs hover:bg-green-50"
                    >
                      <div
                        className="absolute inset-0 bg-green-100 opacity-30"
                        style={{ width: `${(bid.total / Math.max(...orderBook.bids.map((b) => b.total))) * 100}%` }}
                      />
                      <span className="relative text-green-500 font-mono">{bid.price.toFixed(1)}</span>
                      <span className="relative font-mono">{bid.size.toFixed(3)}</span>
                      <span className="relative font-mono text-muted-foreground">{bid.total.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trading Panel */}
            <Card className="h-[55%]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Cross</span>
                    <Badge variant="outline">20x</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Limit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Type Tabs */}
                <Tabs value={orderSide} onValueChange={(value) => setOrderSide(value as "buy" | "sell")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="text-green-600 data-[state=active]:bg-green-100">
                      Buy/Long
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="text-red-600 data-[state=active]:bg-red-100">
                      Sell/Short
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Order Form */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Price (USDT)</Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toFixed(2)}
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Size (BTC)</Label>
                    <Input
                      type="number"
                      placeholder="0.001"
                      value={orderSize}
                      onChange={(e) => setOrderSize(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs bg-transparent"
                      onClick={() => setOrderSize("0.25")}
                    >
                      25%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs bg-transparent"
                      onClick={() => setOrderSize("0.50")}
                    >
                      50%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs bg-transparent"
                      onClick={() => setOrderSize("0.75")}
                    >
                      75%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs bg-transparent"
                      onClick={() => setOrderSize("1.00")}
                    >
                      100%
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cost: 0.00 USDT</span>
                    <span className="text-muted-foreground">Max: 0.000 BTC</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">TP/SL</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Reduce-Only</Label>
                      <Switch checked={reduceOnly} onCheckedChange={setReduceOnly} />
                    </div>
                  </div>

                  <Button
                    className={`w-full ${orderSide === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                    onClick={handlePlaceOrder}
                  >
                    {orderSide === "buy" ? "Buy/Long" : "Sell/Short"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="h-[30%]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Trades</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Top Movers
                  </Button>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Price (USDT)</span>
                  <span>Amount (BTC)</span>
                  <span>Time</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-px max-h-40 overflow-y-auto">
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex justify-between items-center px-3 py-1 text-xs hover:bg-muted/50"
                    >
                      <span className={`font-mono ${trade.side === "buy" ? "text-green-500" : "text-red-500"}`}>
                        {trade.price.toFixed(1)}
                      </span>
                      <span className="font-mono">{trade.size.toFixed(3)}</span>
                      <span className="text-muted-foreground">{trade.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
